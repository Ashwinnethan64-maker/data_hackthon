const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

const TABLE_NAME = 'officers';

// Helper to seed a user if missing
async function ensureUserExists(req, username, password, role, customDetails = {}) {
  const records = await dbService.getAllRows(req, TABLE_NAME);
  let user = records.find(r => r.username === username);
  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    let name = username.charAt(0).toUpperCase() + username.slice(1);
    if (!username.includes('.')) name += " User";
    
    // Default metadata mapping
    const metadata = {
      admin: { badge: 'KA-9912', phone: '+91 9876543210', dept: 'Administration', date: '2015-06-12 00:00:00' },
      officer: { badge: 'KA-8834', phone: '+91 9876543211', dept: 'Crime Branch', date: '2018-09-20 00:00:00' },
      analyst: { badge: 'KA-7721', phone: '+91 9876543212', dept: 'Intelligence', date: '2020-02-14 00:00:00' },
      supervisor: { badge: 'KA-6610', phone: '+91 9876543213', dept: 'Supervision', date: '2012-11-05 00:00:00' }
    }[username.toLowerCase()] || { badge: 'KA-' + Math.floor(1000 + Math.random() * 9000), phone: '', dept: 'Crime Branch', date: '2026-01-01 00:00:00' };

    const userData = {
      username,
      password: hashedPassword,
      name: customDetails.name || name,
      role: customDetails.role || role,
      policeStation: customDetails.policeStation || 'Central Station',
      district: customDetails.district || 'Bengaluru',
      badgeNumber: customDetails.badgeNumber || metadata.badge,
      email: customDetails.email || (username.includes('@') ? username : `${username}@police.karnataka.gov.in`),
      phone: customDetails.phone || metadata.phone,
      department: customDetails.department || metadata.dept,
      joiningDate: customDetails.joiningDate || metadata.date,
      status: customDetails.status || 'Active'
    };

    if (customDetails.ROWID) {
      userData.ROWID = customDetails.ROWID;
    }

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

    // Auto-seed PDF reference officers
    await ensureUserExists(req, 'a.fernandes', 'Officer@123', 'investigator', { ROWID: '101', name: 'A. Fernandes', policeStation: 'Malleshwaram PS', district: 'Bengaluru Urban', badgeNumber: 'KA0114490', email: 'a.fernandes@police.karnataka.gov.in', phone: '+91 9440011101', department: 'Crime Branch', joiningDate: '2018-09-20 00:00:00' });
    await ensureUserExists(req, 'j.deshpande', 'Officer@123', 'investigator', { ROWID: '102', name: 'J. Deshpande', policeStation: 'Indiranagar PS', district: 'Bengaluru Urban', badgeNumber: 'KA0117732', email: 'j.deshpande@police.karnataka.gov.in', phone: '+91 9440011102', department: 'Crime Branch', joiningDate: '2019-03-15 00:00:00' });
    await ensureUserExists(req, 't.r.swamy', 'Officer@123', 'investigator', { ROWID: '103', name: 'T. R. Swamy', policeStation: 'Whitefield PS', district: 'Bengaluru Urban', badgeNumber: 'KA0119284', email: 't.r.swamy@police.karnataka.gov.in', phone: '+91 9440011103', department: 'Crime Branch', joiningDate: '2020-05-20 00:00:00' });
    await ensureUserExists(req, 'm.s.rao', 'Officer@123', 'investigator', { ROWID: '104', name: 'M. S. Rao', policeStation: 'Jayanagar PS', district: 'Bengaluru Urban', badgeNumber: 'KA0120118', email: 'm.s.rao@police.karnataka.gov.in', phone: '+91 9440011104', department: 'Crime Branch', joiningDate: '2021-08-10 00:00:00' });
    await ensureUserExists(req, 's.patil', 'Officer@123', 'supervisor', { ROWID: '105', name: 'Shanthamma Patil', policeStation: 'Dharwad Suburban PS', district: 'Dharwad', badgeNumber: 'KA0108825', email: 's.patil@police.karnataka.gov.in', phone: '+91 9440011105', department: 'Law & Order', joiningDate: '2012-04-01 00:00:00' });
    await ensureUserExists(req, 'v.shetty', 'Officer@123', 'investigator', { ROWID: '106', name: 'Vijay Shetty', policeStation: 'Vijayanagara PS', district: 'Mysuru', badgeNumber: 'KA0122931', email: 'v.shetty@police.karnataka.gov.in', phone: '+91 9440011106', department: 'Crime Branch', joiningDate: '2017-10-18 00:00:00' });
    await ensureUserExists(req, 'g.bhat', 'Officer@123', 'investigator', { ROWID: '107', name: 'Girish Bhat', policeStation: 'Vijayanagara PS', district: 'Mysuru', badgeNumber: 'KA0125540', email: 'g.bhat@police.karnataka.gov.in', phone: '+91 9440011107', department: 'Crime Branch', joiningDate: '2019-11-12 00:00:00' });
    await ensureUserExists(req, 'k.r.naik', 'Officer@123', 'supervisor', { ROWID: '108', name: 'K. R. Naik', policeStation: 'Khade Bazar PS', district: 'Belagavi', badgeNumber: 'KA0111276', email: 'k.r.naik@police.karnataka.gov.in', phone: '+91 9440011108', department: 'Law & Order', joiningDate: '2010-05-15 00:00:00' });
    await ensureUserExists(req, 'p.n.kulkarni', 'Officer@123', 'investigator', { ROWID: '109', name: 'P. N. Kulkarni', policeStation: 'Kadri PS', district: 'Dakshina Kannada', badgeNumber: 'KA0126603', email: 'p.n.kulkarni@police.karnataka.gov.in', phone: '+91 9440011109', department: 'Crime Branch', joiningDate: '2016-02-28 00:00:00' });
    await ensureUserExists(req, 's.b.hiremath', 'Officer@123', 'investigator', { ROWID: '110', name: 'S. B. Hiremath', policeStation: 'Chowk PS', district: 'Kalaburagi', badgeNumber: 'KA0128817', email: 's.b.hiremath@police.karnataka.gov.in', phone: '+91 9440011110', department: 'Crime Branch', joiningDate: '2020-07-01 00:00:00' });

    // Validate against Catalyst Data Store
    const records = await dbService.getAllRows(req, TABLE_NAME);
    const user = records.find(r => r.username === username || r.email === username);

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


// GET me - Return current authenticated user profile (full DB record)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const records = await dbService.getAllRows(req, TABLE_NAME);
    const dbUser = records.find(r => r.username === req.user.username);
    if (dbUser) {
      const { password, ...safeProfile } = dbUser;
      return res.json(safeProfile);
    }
    // Fallback to JWT-encoded fields if DB lookup fails
    res.json({ 
      id: req.user.id,
      name: req.user.name, 
      role: req.user.role,
      username: req.user.username,
      district: req.user.district,
      policeStation: req.user.policeStation
    });
  } catch (error) {
    res.json({
      id: req.user.id,
      name: req.user.name,
      role: req.user.role,
      username: req.user.username,
    });
  }
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
        district: 'Bengaluru',
        badgeNumber: 'KA-' + Math.floor(1000 + Math.random() * 9000),
        email: email,
        phone: '',
        department: 'Crime Branch',
        joiningDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'Active'
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
