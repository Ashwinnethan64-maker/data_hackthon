const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');

// In a real Catalyst environment, you would use Catalyst Profile or a specific users table.
// Here we mock with predefined tables for the hackathon context: 'users', 'audit_logs', 'sessions'
const USERS_TABLE = 'users';
const AUDIT_TABLE = 'audit_logs';

// ------------------------------------------------------------------
// PROFILE
// ------------------------------------------------------------------

// GET profile
router.get('/profile', async (req, res) => {
  try {
    const userEmail = req.user?.email || 'admin@police.karnataka.gov.in';
    const users = await dbService.getAllRows(req, USERS_TABLE).catch(() => []);
    let user = users.find(u => u.email === userEmail);
    if (!user) {
      user = {
        name: 'Admin Officer',
        badgeNumber: 'KA-9912',
        role: 'Administrator',
        policeStation: 'Central Station',
        district: 'Bengaluru',
        email: userEmail,
        phone: '+91 9876543210',
        department: 'Crime Branch',
        joiningDate: '2015-06-12',
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
    const userEmail = req.user?.email || 'admin@police.karnataka.gov.in';
    
    // In a real app we'd update the specific ROWID in USERS_TABLE
    // Here we'll simulate success and log to audit
    
    await dbService.insertRow(req, AUDIT_TABLE, {
      action: 'PROFILE_UPDATE',
      user: userEmail,
      timestamp: new Date().toISOString(),
      details: 'User updated their profile details.'
    }).catch(() => {});

    res.json({ success: true, message: 'Profile updated successfully', profile: req.body });
  } catch (error) {
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
    const userEmail = req.user?.email || 'admin@police.karnataka.gov.in';
    
    await dbService.insertRow(req, AUDIT_TABLE, {
      action: 'PREFERENCES_UPDATE',
      user: userEmail,
      timestamp: new Date().toISOString(),
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
    
    const userEmail = req.user?.email || 'admin@police.karnataka.gov.in';
    await dbService.insertRow(req, AUDIT_TABLE, {
      action: 'SECURITY_UPDATE',
      user: userEmail,
      timestamp: new Date().toISOString(),
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
    const userEmail = req.user?.email || 'admin@police.karnataka.gov.in';
    await dbService.insertRow(req, AUDIT_TABLE, {
      action: 'SESSION_TERMINATED',
      user: userEmail,
      timestamp: new Date().toISOString(),
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
    if (logs.length === 0) {
      logs = [
        { ROWID: '1', action: 'LOGIN', user: 'admin@police.karnataka.gov.in', timestamp: new Date().toISOString(), details: 'Successful login' },
        { ROWID: '2', action: 'REPORT_GENERATION', user: 'admin@police.karnataka.gov.in', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'Generated Crime Summary Report' }
      ];
    }
    // Sort descending by timestamp
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

module.exports = router;
