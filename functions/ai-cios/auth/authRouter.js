const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

const TABLE_NAME = 'officers';

// Helper to seed a user if missing
async function ensureUserExists(req, username, password, role) {
  const records = await dbService.getAllRows(req, TABLE_NAME);
  let user = records.find(r => r.username === username);
  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    let name = username.charAt(0).toUpperCase() + username.slice(1);
    
    const userData = {
      username,
      password: hashedPassword,
      name,
      role,
      policeStation: 'Central Station',
      district: 'Bengaluru'
    };

    user = await dbService.insertRow(req, TABLE_NAME, userData);
  }
  return user;
}

// POST login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Auto-seed required accounts
    await ensureUserExists(req, 'admin', 'Admin@123', 'Administrator');
    await ensureUserExists(req, 'officer', 'Officer@123', 'investigator');
    await ensureUserExists(req, 'analyst', 'Analyst@123', 'analyst');
    await ensureUserExists(req, 'supervisor', 'Supervisor@123', 'supervisor');

    // Validate against Catalyst Data Store
    const records = await dbService.getAllRows(req, TABLE_NAME);
    const user = records.find(r => r.username === username);

    console.log(`[DEBUG] Attempting login for ${username}. Found user:`, !!user);

    if (!user) {
      console.log(`[DEBUG] User not found in records.`);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    console.log(`[DEBUG] Password match:`, validPassword);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        id: user.ROWID, 
        username: user.username, 
        role: user.role, 
        name: user.name,
        district: user.district 
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Set secure HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000 // 8 hours
    });

    res.json({ success: true, message: 'Logged in successfully' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed due to server error' });
  }
});

// POST logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET me - Return current authenticated user profile
router.get('/me', verifyToken, (req, res) => {
  res.json({ 
    id: req.user.id,
    name: req.user.name, 
    role: req.user.role,
    username: req.user.username,
    district: req.user.district,
    policeStation: req.user.policeStation
  });
});

// GET all officers
router.get('/officers', verifyToken, async (req, res) => {
  try {
    const records = await dbService.getAllRows(req, TABLE_NAME);
    // Don't send passwords back
    const safeRecords = records.map(r => {
      const { password, ...rest } = r;
      return rest;
    });
    res.json(safeRecords);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch officers' });
  }
});

// GET an officer by id
router.get('/officers/:id', verifyToken, async (req, res) => {
  try {
    const record = await dbService.getRow(req, TABLE_NAME, req.params.id);
    if (record) {
      const { password, ...safeRecord } = record;
      res.json(safeRecord);
    } else {
      res.status(404).json({ error: 'Officer not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch officer' });
  }
});

// POST a new officer
router.post('/officers', verifyToken, async (req, res) => {
  try {
    if (!req.body || !req.body.username || !req.body.password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
    const newRecord = await dbService.insertRow(req, TABLE_NAME, {
      ...req.body,
      password: hashedPassword
    });
    const { password, ...safeRecord } = newRecord;
    res.status(201).json(safeRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create officer' });
  }
});

// PUT update an officer
router.put('/officers/:id', verifyToken, async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    const updateData = { ROWID: req.params.id, ...req.body };
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    const updatedRecord = await dbService.updateRow(req, TABLE_NAME, updateData);
    const { password, ...safeRecord } = updatedRecord;
    res.json(safeRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update officer' });
  }
});

// DELETE an officer
router.delete('/officers/:id', verifyToken, async (req, res) => {
  try {
    const deletedRecord = await dbService.deleteRow(req, TABLE_NAME, req.params.id);
    res.json({ success: true, deletedRecord });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete officer' });
  }
});

// POST google-login
router.post('/google-login', async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token) {
      return res.status(400).json({ error: 'Access token required' });
    }

    // Call Google's userinfo API using the access token
    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    if (!googleResponse.ok) {
      return res.status(401).json({ error: 'Invalid Google access token' });
    }

    const googleUser = await googleResponse.json();
    const { email, given_name, family_name, name } = googleUser;

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google account' });
    }

    // Check if user exists in our local Catalyst DB 'officers' table
    const records = await dbService.getAllRows(req, TABLE_NAME);
    let user = records.find(r => r.username === email);

    if (!user) {
      // If user doesn't exist, auto-register them in Catalyst officers table
      const salt = await bcrypt.genSalt(10);
      // Create a secure dummy password for database constraint compatibility
      const dummyPassword = require('crypto').randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(dummyPassword, salt);

      const userData = {
        username: email,
        password: hashedPassword,
        name: name || `${given_name || ''} ${family_name || ''}`.trim() || email.split('@')[0],
        role: 'investigator',
        policeStation: 'Central Station',
        district: 'Bengaluru'
      };

      user = await dbService.insertRow(req, TABLE_NAME, userData);
      console.log(`[DEBUG] Automatically registered new Google user in database: ${email}`);
    }

    // Now, generate a Catalyst Custom User token
    const catalyst = require('zcatalyst-sdk-node');
    const app = res.locals.catalyst || catalyst.initialize(req);
    
    // Call generateCustomToken to get Catalyst JWT
    const tokenResponse = await app.userManagement().generateCustomToken({
      type: 'web',
      user_details: {
        email_id: email,
        first_name: given_name || name || 'Google',
        last_name: family_name || 'User'
      }
    });

    // If it's a string, wrap it. If it's an object, send it directly.
    if (typeof tokenResponse === 'string') {
      res.json({
        success: true,
        jwt_token: tokenResponse,
        client_id: app.config?.zaid || app.config?.client_id
      });
    } else {
      res.json({
        success: true,
        jwt_token: tokenResponse.jwt_token || tokenResponse.token || tokenResponse,
        client_id: tokenResponse.client_id,
        scopes: tokenResponse.scopes
      });
    }

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Google login failed due to server error' });
  }
});

module.exports = router;
