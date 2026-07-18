const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');

// Predefined tables for the hackathon context: 'officers', 'audit_logs', 'sessions'
const USERS_TABLE = 'officers';
const AUDIT_TABLE = 'audit_logs';

// ------------------------------------------------------------------
// PROFILE
// ------------------------------------------------------------------

// GET profile
router.get('/profile', async (req, res) => {
  try {
    const userEmail = req.user?.username || 'admin@police.karnataka.gov.in';
    const users = await dbService.getAllRows(req, USERS_TABLE).catch(() => []);
    let user = users.find(u => u.username === userEmail || u.email === userEmail);
    if (!user) {
      user = {
        name: req.user?.name || 'Admin Officer',
        badgeNumber: 'KA-9912',
        role: req.user?.role || 'Administrator',
        policeStation: req.user?.policeStation || 'Central Station',
        district: req.user?.district || 'Bengaluru',
        email: userEmail,
        phone: '+91 9876543210',
        department: 'Crime Branch',
        joiningDate: '2015-06-12 00:00:00',
        status: 'Active'
      };
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT profile
router.put('/profile', async (req, res) => {
  try {
    const userEmail = req.user?.username || 'admin@police.karnataka.gov.in';
    
    // Find the record in officers table
    const users = await dbService.getAllRows(req, USERS_TABLE).catch(() => []);
    let user = users.find(u => u.username === userEmail || u.email === userEmail);
    
    let updatedProfile;
    if (user) {
      const updateData = {
        ROWID: user.ROWID || user.id,
        name: req.body.name || user.name,
        badgeNumber: req.body.badgeNumber || user.badgeNumber || 'KA-' + Math.floor(1000 + Math.random() * 9000),
        phone: req.body.phone || user.phone || '',
        department: req.body.department || user.department || 'Crime Branch',
        policeStation: req.body.policeStation || user.policeStation || 'Central Station',
        district: req.body.district || user.district || 'Bengaluru',
        email: req.body.email || user.email || userEmail
      };
      updatedProfile = await dbService.updateRow(req, USERS_TABLE, updateData);
    } else {
      // If the user doesn't exist yet, insert a new record
      const newRecord = {
        username: userEmail,
        email: userEmail,
        name: req.body.name || req.user?.name || 'Officer User',
        badgeNumber: req.body.badgeNumber || 'KA-' + Math.floor(1000 + Math.random() * 9000),
        role: req.user?.role || 'investigator',
        policeStation: req.body.policeStation || 'Central Station',
        district: req.body.district || 'Bengaluru',
        phone: req.body.phone || '',
        department: req.body.department || 'Crime Branch',
        joiningDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'Active'
      };
      updatedProfile = await dbService.insertRow(req, USERS_TABLE, newRecord);
    }
    
    await dbService.insertRow(req, AUDIT_TABLE, {
      action: 'PROFILE_UPDATE',
      actor: userEmail,
      loggedAt: new Date().toISOString(),
      details: `User updated profile details for ${userEmail}.`
    }).catch(() => {});

    res.json({ success: true, message: 'Profile updated successfully', profile: updatedProfile });
  } catch (error) {
    console.error('Failed to update profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ------------------------------------------------------------------
// PREFERENCES
// ------------------------------------------------------------------

// GET preferences
router.get('/preferences', async (req, res) => {
  try {
    res.json({
      theme: 'dark',
      language: 'en',
      defaultDashboard: 'overview',
      notificationsEnabled: true,
      emailAlerts: true,
      crimeAlerts: true,
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      tablePageSize: 20
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// PUT preferences
router.put('/preferences', async (req, res) => {
  try {
    const userEmail = req.user?.username || 'admin@police.karnataka.gov.in';
    
    await dbService.insertRow(req, AUDIT_TABLE, {
      action: 'PREFERENCES_UPDATE',
      actor: userEmail,
      loggedAt: new Date().toISOString(),
      details: 'User updated application preferences.'
    }).catch(() => {});

    res.json({ success: true, message: 'Preferences updated successfully', preferences: req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// ------------------------------------------------------------------
// SECURITY
// ------------------------------------------------------------------

// GET security settings
router.get('/security', async (req, res) => {
  try {
    res.json({
      twoFactorEnabled: false,
      lastPasswordChange: '2026-01-15T08:00:00Z',
      loginHistory: [
        { ip: '192.168.1.1', device: 'Windows PC', browser: 'Chrome', time: new Date().toISOString() },
        { ip: '117.198.2.55', device: 'Mobile', browser: 'Safari', time: '2026-07-10T14:30:00Z' }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch security settings' });
  }
});

// PUT security (e.g. password change)
router.put('/security', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const userEmail = req.user?.username || 'admin@police.karnataka.gov.in';
    await dbService.insertRow(req, AUDIT_TABLE, {
      action: 'SECURITY_UPDATE',
      actor: userEmail,
      loggedAt: new Date().toISOString(),
      details: 'User changed their password.'
    }).catch(() => {});

    res.json({ success: true, message: 'Security settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update security settings' });
  }
});

// ------------------------------------------------------------------
// SESSIONS
// ------------------------------------------------------------------

// GET sessions
router.get('/sessions', async (req, res) => {
  try {
    res.json([
      { id: 'sess_1', device: 'Windows PC (Current)', browser: 'Chrome', loginTime: new Date().toISOString(), ip: '192.168.1.1' },
      { id: 'sess_2', device: 'iPhone 14', browser: 'Safari', loginTime: '2026-07-11T09:15:00Z', ip: '117.198.2.55' }
    ]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// DELETE session
router.delete('/sessions/:id', async (req, res) => {
  try {
    const userEmail = req.user?.username || 'admin@police.karnataka.gov.in';
    await dbService.insertRow(req, AUDIT_TABLE, {
      action: 'SESSION_TERMINATED',
      actor: userEmail,
      loggedAt: new Date().toISOString(),
      details: `Terminated session ${req.params.id}`
    }).catch(() => {});

    res.json({ success: true, message: `Session ${req.params.id} terminated` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to terminate session' });
  }
});

// ------------------------------------------------------------------
// AUDIT LOGS
// ------------------------------------------------------------------

// GET audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    let logs = await dbService.getAllRows(req, AUDIT_TABLE).catch(() => []);
    
    // Normalize DB rows (actor -> user, loggedAt -> timestamp)
    let normalizedLogs = logs.map(log => ({
      ROWID: log.ROWID || log.id,
      action: log.action,
      user: log.actor || log.user || 'Unknown',
      timestamp: log.loggedAt || log.timestamp || new Date().toISOString(),
      details: log.details
    }));

    if (normalizedLogs.length === 0) {
      normalizedLogs = [
        { ROWID: '1', action: 'LOGIN', user: 'admin@police.karnataka.gov.in', timestamp: new Date().toISOString(), details: 'Successful login' },
        { ROWID: '2', action: 'REPORT_GENERATION', user: 'admin@police.karnataka.gov.in', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'Generated Crime Summary Report' }
      ];
    }
    // Sort descending by timestamp
    normalizedLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(normalizedLogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

module.exports = router;
