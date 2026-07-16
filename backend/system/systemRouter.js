const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const os = require('os');

// GET /system/health
router.get('/health', async (req, res) => {
  const startTime = Date.now();
  
  const healthStatus = {
    status: 'operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      api: { status: 'ok', responseTimeMs: 0 },
      database: { status: 'unknown', responseTimeMs: 0 },
      fileStore: { status: 'ok', message: 'In-memory mock active for hackathon' },
      auth: { status: 'ok', message: 'JWT middleware operational' },
      ai: { status: 'ok', message: 'Zia mock responder active' }
    },
    system: {
      platform: os.platform(),
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      uptimeSeconds: Math.round(process.uptime())
    }
  };

  // Check Database / Catalyst Connectivity
  const dbStartTime = Date.now();
  try {
    // Attempt a lightweight query to verify Catalyst Data Store connection
    await dbService.getAllRows(req, 'firs');
    healthStatus.services.database.status = 'operational';
    healthStatus.services.database.responseTimeMs = Date.now() - dbStartTime;
  } catch (error) {
    healthStatus.services.database.status = 'degraded';
    healthStatus.services.database.message = error.message;
    healthStatus.status = 'degraded';
  }

  healthStatus.services.api.responseTimeMs = Date.now() - startTime;

  res.status(healthStatus.status === 'operational' ? 200 : 207).json(healthStatus);
});

// POST /system/seed-demo-data
// Note: Unprotected for hackathon judging convenience.
router.post('/seed-demo-data', async (req, res) => {
  try {
    // Check if FIRs already exist
    const existingFirs = await dbService.getAllRows(req, 'firs').catch(() => []);
    if (existingFirs.length > 0) {
      return res.json({ status: 'skipped', message: 'Database already contains data.' });
    }

    // Seed dummy FIRs
    const dummyFirs = [
      {
        firNumber: 'FIR-2026-001',
        crimeCategory: 'Cyber Fraud',
        description: 'Phishing attack resulting in financial loss.',
        incidentDate: new Date().toISOString(),
        district: 'Bengaluru Urban',
        policeStation: 'Koramangala',
        latitude: 12.9352,
        longitude: 77.6245,
        status: 'Active',
        priority: 'High',
        applicableActs: 'IT Act 66D',
        victims: JSON.stringify([{ name: 'Rahul S.', age: 34, gender: 'Male' }]),
        accused: JSON.stringify([]),
        evidence: JSON.stringify([{ type: 'Digital Log', description: 'Server IP access logs' }]),
        timeline: JSON.stringify([{ status: 'current', title: 'Investigation Started', time: '10:00 AM' }]),
        officerId: 'OF-001'
      },
      {
        firNumber: 'FIR-2026-002',
        crimeCategory: 'Robbery',
        description: 'Armed robbery at jewelry store.',
        incidentDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        district: 'Bengaluru Urban',
        policeStation: 'Indiranagar',
        latitude: 12.9784,
        longitude: 77.6408,
        status: 'Under Investigation',
        priority: 'Critical',
        applicableActs: 'BNS 309(4)',
        victims: JSON.stringify([{ name: 'Anjali M.', age: 45, gender: 'Female' }]),
        accused: JSON.stringify([{ name: 'Unknown', isRepeatOffender: true }]),
        evidence: JSON.stringify([{ type: 'CCTV', description: 'Video footage of suspects entering.' }]),
        timeline: JSON.stringify([{ status: 'completed', title: 'FIR Filed', time: 'Yesterday' }]),
        officerId: 'OF-002'
      }
    ];

    for (const fir of dummyFirs) {
      await dbService.insertRow(req, 'firs', fir);
    }

    res.json({ status: 'success', message: 'Demo data seeded successfully.' });
  } catch (error) {
    console.error('Demo data seed error:', error);
    res.status(500).json({ error: 'Failed to seed demo data' });
  }
});

module.exports = router;
