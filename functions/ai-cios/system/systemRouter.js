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

    // Seed dummy FIRs mapped from PDF Mock Reference Set
    const dummyFirs = [
      {
        ROWID: '1',
        firNumber: '100011001202600001',
        crimeCategory: 'Drug Trafficking',
        description: 'Possession and trafficking of commercial quantity of contraband. Seized during vehicle inspection at Malleshwaram checkpoint.',
        incidentDate: '2026-01-15T08:30:00Z',
        district: 'Bengaluru Urban',
        policeStation: 'Malleshwaram PS',
        latitude: 12.9982,
        longitude: 77.5711,
        status: 'Under Investigation',
        priorityLevel: 'Critical',
        applicableActs: JSON.stringify(['NDPS Section 21']),
        victims: JSON.stringify([{ name: 'Suresh K. Naidu', age: 34, gender: 'Male' }]),
        accused: JSON.stringify([{ name: 'Naveen Kumar', age: 26, gender: 'Male' }]),
        evidence: JSON.stringify([{ type: 'Narcotic substance', description: 'Contraband seized during vehicle check' }]),
        timeline: JSON.stringify([{ status: 'completed', title: 'FIR Registered', time: '2026-01-15 08:30' }, { status: 'current', title: 'Arrest Made', time: '2026-01-15 10:00' }]),
        officerId: '101'
      },
      {
        ROWID: '2',
        firNumber: '100022001202400001',
        crimeCategory: 'Assault',
        description: 'Physical assault arising from land dispute. Accused voluntarily caused hurt to victim at his residence.',
        incidentDate: '2024-08-20T11:00:00Z',
        district: 'Dharwad',
        policeStation: 'Dharwad Suburban PS',
        latitude: 15.4589,
        longitude: 75.0078,
        status: 'Open',
        priorityLevel: 'Medium',
        applicableActs: JSON.stringify(['IPC Section 323']),
        victims: JSON.stringify([{ name: 'Basavaraj Hosamani', age: 47, gender: 'Male' }]),
        accused: JSON.stringify([{ name: 'Mahesh Talawar', age: 44, gender: 'Male' }]),
        evidence: JSON.stringify([{ type: 'Medical report', description: 'Wound certificate showing physical injury' }]),
        timeline: JSON.stringify([{ status: 'completed', title: 'FIR Registered', time: '2024-08-20 11:00' }, { status: 'current', title: 'Accused Surrendered', time: '2024-08-22 09:30' }]),
        officerId: '105'
      },
      {
        ROWID: '3',
        firNumber: '100011002202500001',
        crimeCategory: 'Fraud',
        description: 'Financial fraud and cheating. Suspect deceived complainant under guise of investment scheme and swindled money.',
        incidentDate: '2025-11-06T14:30:00Z',
        district: 'Bengaluru Urban',
        policeStation: 'Indiranagar PS',
        latitude: 12.9784,
        longitude: 77.6408,
        status: 'Closed',
        priorityLevel: 'High',
        applicableActs: JSON.stringify(['IPC Section 420']),
        victims: JSON.stringify([{ name: 'Fathima Beevi', age: 41, gender: 'Female' }]),
        accused: JSON.stringify([{ name: 'Ramesh Chandran', age: 39, gender: 'Male' }]),
        evidence: JSON.stringify([{ type: 'Financial statement', description: 'Bank logs showing fraudulent transfer' }]),
        timeline: JSON.stringify([{ status: 'completed', title: 'FIR Registered', time: '2025-11-06 14:30' }, { status: 'completed', title: 'Arrest Made', time: '2025-11-20 12:00' }, { status: 'current', title: 'Chargesheet Filed', time: '2025-12-28 16:00' }]),
        officerId: '102'
      },
      {
        ROWID: '4',
        firNumber: '100011003202400001',
        crimeCategory: 'Cybercrime',
        description: 'Identity theft and financial fraud using a cloned banking portal. Fraudulent withdrawal detected.',
        incidentDate: '2024-06-14T10:15:00Z',
        district: 'Bengaluru Urban',
        policeStation: 'Whitefield PS',
        latitude: 12.9698,
        longitude: 77.75,
        status: 'Under Investigation',
        priorityLevel: 'High',
        applicableActs: JSON.stringify(['IT Section 66D', 'IT Section 66C']),
        victims: JSON.stringify([{ name: 'Rohit Menon', age: 29, gender: 'Male' }]),
        accused: JSON.stringify([{ name: 'Unidentified (online)', age: 0, gender: 'Third Gender' }]),
        evidence: JSON.stringify([{ type: 'Digital Log', description: 'Phishing email source headers and server traffic logs' }]),
        timeline: JSON.stringify([{ status: 'current', title: 'FIR Registered', time: '2024-06-14 10:15' }]),
        officerId: '103'
      },
      {
        ROWID: '5',
        firNumber: '100033001202600001',
        crimeCategory: 'Cybercrime',
        description: 'Hacking and unauthorized access to corporate accounts, compromising sensitive trade data.',
        incidentDate: '2026-03-03T16:00:00Z',
        district: 'Mysuru',
        policeStation: 'Vijayanagara PS',
        latitude: 12.3051,
        longitude: 76.6552,
        status: 'Open',
        priorityLevel: 'Medium',
        applicableActs: JSON.stringify(['IT Section 66D']),
        victims: JSON.stringify([{ name: 'Deepa Kulkarni', age: 38, gender: 'Female' }]),
        accused: JSON.stringify([]),
        evidence: JSON.stringify([{ type: 'Access Log', description: 'IP login histories showing unauthorized entry' }]),
        timeline: JSON.stringify([{ status: 'current', title: 'FIR Registered', time: '2026-03-03 16:00' }]),
        officerId: '106'
      },
      {
        ROWID: '6',
        firNumber: '100044001202400001',
        crimeCategory: 'Rioting',
        description: 'Unlawful assembly and rioting. Group damaged public vehicles near bus station and assaulted security guard.',
        incidentDate: '2024-02-09T09:40:00Z',
        district: 'Belagavi',
        policeStation: 'Khade Bazar PS',
        latitude: 15.8497,
        longitude: 74.4977,
        status: 'Open',
        priorityLevel: 'Medium',
        applicableActs: JSON.stringify(['IPC Section 147']),
        victims: JSON.stringify([{ name: 'Irfan Sheikh', age: 52, gender: 'Male' }]),
        accused: JSON.stringify([{ name: 'Prakash Chougale', age: 33, gender: 'Male' }, { name: 'Santosh Kamble', age: 30, gender: 'Male' }]),
        evidence: JSON.stringify([{ type: 'CCTV Footage', description: 'Video showing suspects destroying public bus windows' }]),
        timeline: JSON.stringify([{ status: 'completed', title: 'FIR Registered', time: '2024-02-09 09:40' }, { status: 'current', title: 'Arrest Made', time: '2024-02-11 14:00' }]),
        officerId: '108'
      },
      {
        ROWID: '7',
        firNumber: '800011004202400001',
        crimeCategory: 'Extortion',
        description: 'Blackmail and extortion. Complainant was threatened with leak of personal information if money was not paid.',
        incidentDate: '2024-06-18T15:20:00Z',
        district: 'Bengaluru Urban',
        policeStation: 'Jayanagar PS',
        latitude: 12.9308,
        longitude: 77.583,
        status: 'Open',
        priorityLevel: 'High',
        applicableActs: JSON.stringify(['IPC Section 384']),
        victims: JSON.stringify([{ name: 'Manjunath Gowda', age: 45, gender: 'Male' }]),
        accused: JSON.stringify([{ name: 'Faiz Ahmed', age: 36, gender: 'Male' }]),
        evidence: JSON.stringify([{ type: 'Audio recording', description: 'Voice call records containing threat details' }]),
        timeline: JSON.stringify([{ status: 'current', title: 'FIR Registered', time: '2024-06-18 15:20' }]),
        officerId: '104'
      },
      {
        ROWID: '8',
        firNumber: '100066001202500001',
        crimeCategory: 'Rioting',
        description: 'Public disturbance and rioting during a rally. Commotion caused damage to private shops.',
        incidentDate: '2025-10-06T18:10:00Z',
        district: 'Dakshina Kannada',
        policeStation: 'Kadri PS',
        latitude: 12.8751,
        longitude: 74.8441,
        status: 'Under Investigation',
        priorityLevel: 'Low',
        applicableActs: JSON.stringify(['IPC Section 147']),
        victims: JSON.stringify([{ name: 'Alwyn D\'Souza', age: 31, gender: 'Male' }]),
        accused: JSON.stringify([]),
        evidence: JSON.stringify([{ type: 'Physical evidence', description: 'Vandalized storefront photos' }]),
        timeline: JSON.stringify([{ status: 'current', title: 'FIR Registered', time: '2025-10-06 18:10' }]),
        officerId: '109'
      },
      {
        ROWID: '9',
        firNumber: '100033001202600002',
        crimeCategory: 'Burglary',
        description: 'Housebreak and burglary at locked house. Ornaments and electronic equipment stolen during night hours.',
        incidentDate: '2026-02-05T02:00:00Z',
        district: 'Mysuru',
        policeStation: 'Vijayanagara PS',
        latitude: 12.3051,
        longitude: 76.6552,
        status: 'Open',
        priorityLevel: 'Medium',
        applicableActs: JSON.stringify(['IPC Section 379']),
        victims: JSON.stringify([{ name: 'Pooja Rao', age: 27, gender: 'Female' }]),
        accused: JSON.stringify([{ name: 'Unidentified', age: 0, gender: 'Third Gender' }]),
        evidence: JSON.stringify([{ type: 'Fingerprint', description: 'Latent prints lifted from broken window frame' }]),
        timeline: JSON.stringify([{ status: 'current', title: 'FIR Registered', time: '2026-02-05 09:00' }]),
        officerId: '107'
      },
      {
        ROWID: '10',
        firNumber: '300055001202600001',
        crimeCategory: 'Fraud',
        description: 'Forgery of signatures on government land purchase contract and fraud of public funds.',
        incidentDate: '2026-05-07T13:00:00Z',
        district: 'Kalaburagi',
        policeStation: 'Chowk PS',
        latitude: 17.3297,
        longitude: 76.8343,
        status: 'Closed',
        priorityLevel: 'Medium',
        applicableActs: JSON.stringify(['IPC Section 420']),
        victims: JSON.stringify([{ name: 'Yusuf Ali Baig', age: 58, gender: 'Male' }]),
        accused: JSON.stringify([{ name: 'Siddappa Jamadar', age: 49, gender: 'Male' }]),
        evidence: JSON.stringify([{ type: 'Agreement doc', description: 'Forged contract papers with falsified details' }]),
        timeline: JSON.stringify([{ status: 'completed', title: 'FIR Registered', time: '2026-05-07 13:00' }, { status: 'completed', title: 'Arrest Made', time: '2026-05-15 10:30' }, { status: 'current', title: 'Case Closed: Undetected', time: '2026-06-30 11:00' }]),
        officerId: '110'
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
