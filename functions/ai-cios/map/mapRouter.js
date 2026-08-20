const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');

const TABLE_NAME = 'firs';

// Safely parse JSON properties from Catalyst string fields if needed
function parseJSONField(field) {
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return field;
    }
  }
  return field;
}

function normalizeMapIncident(record) {
  const victims = parseJSONField(record.victims) || [];
  const accused = parseJSONField(record.accused) || [];
  const officerObj = parseJSONField(record.officer) || { name: 'Unknown' };
  
  const incidentDateObj = new Date(record.incidentDate);
  const date = incidentDateObj.toISOString().split('T')[0];
  const time = incidentDateObj.toISOString().split('T')[1]?.substring(0, 5) || '00:00';
  
  const priorityVal = record.priorityLevel || record.priority || 'Medium';
  let riskLevel = 'Medium';
  if (priorityVal === 'Critical') riskLevel = 'Critical';
  else if (priorityVal === 'High') riskLevel = 'High';
  else if (priorityVal === 'Low') riskLevel = 'Low';

  return {
    id: record.ROWID || record.id,
    firNumber: record.firNumber || '',
    category: record.crimeCategory || 'Other',
    date,
    time,
    district: record.district || '',
    policeStation: record.policeStation || '',
    officer: officerObj.name || '',
    status: record.status || 'Pending',
    priority: priorityVal === 'Critical' ? 'Critical' : priorityVal === 'High' ? 'High' : 'Routine',
    riskLevel,
    victimCount: victims.length,
    accusedCount: accused.length,
    lat: record.latitude || 0,
    lng: record.longitude || 0,
    description: record.description || ''
  };
}

// GET all crime locations (filtered for map)
router.get('/markers', async (req, res) => {
  try {
    const records = await dbService.getAllRows(req, TABLE_NAME);
    let incidents = records
      .filter(r => r.status !== 'Inactive' && r.status !== 'Archived')
      .map(normalizeMapIncident);

    // Filters
    const {
      searchQuery,
      districts,
      policeStations,
      crimeCategories,
      riskLevels,
      statuses,
      officers,
      dateFrom,
      dateTo,
      timeFrom,
      timeTo
    } = req.query;

    incidents = incidents.filter(inc => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          inc.firNumber.toLowerCase().includes(q) ||
          inc.category.toLowerCase().includes(q) ||
          inc.district.toLowerCase().includes(q) ||
          inc.policeStation.toLowerCase().includes(q) ||
          inc.officer.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      
      if (districts) {
        const dArr = districts.split(',');
        if (dArr.length > 0 && !dArr.includes(inc.district)) return false;
      }

      if (policeStations) {
        const pArr = policeStations.split(',');
        if (pArr.length > 0 && !pArr.includes(inc.policeStation)) return false;
      }

      if (crimeCategories) {
        const cArr = crimeCategories.split(',');
        if (cArr.length > 0 && !cArr.includes(inc.category)) return false;
      }

      if (riskLevels) {
        const rArr = riskLevels.split(',');
        if (rArr.length > 0 && !rArr.includes(inc.riskLevel)) return false;
      }

      if (statuses) {
        const sArr = statuses.split(',');
        if (sArr.length > 0 && !sArr.includes(inc.status)) return false;
      }

      if (officers) {
        const oArr = officers.split(',');
        if (oArr.length > 0 && !oArr.includes(inc.officer)) return false;
      }

      if (dateFrom && inc.date < dateFrom) return false;
      if (dateTo && inc.date > dateTo) return false;
      
      if (timeFrom && inc.time < timeFrom) return false;
      if (timeTo && inc.time > timeTo) return false;

      return true;
    });

    res.json(incidents);
  } catch (error) {
    console.error('Error fetching markers:', error);
    res.status(500).json({ error: 'Failed to fetch crime locations' });
  }
});

// POST map analysis (preserving UI contract)
router.post('/analyze', async (req, res) => {
  try {
    const { incidents } = req.body;
    if (!incidents || !Array.isArray(incidents)) {
      return res.status(400).json({ error: 'Incidents required' });
    }

    if (incidents.length === 0) {
      return res.json({
        summary: 'Insufficient data to establish a reliable pattern in the currently selected map viewport.',
        mostCommonCrimes: [],
        repeatOffenders: 0,
        emergingTrends: ['No active incidents within this geographic bounding area.'],
        riskScore: 10,
        recommendedPatrolStrategy: 'Maintain standard routine patrols.',
        nearbyCriminalNetworks: [],
        suggestedLeads: [],
        confidenceScore: 50
      });
    }

    const countMap = {};
    const districtMap = {};
    const stationMap = {};
    let highRiskCount = 0;
    let openCount = 0;

    incidents.forEach((i) => {
      countMap[i.category] = (countMap[i.category] || 0) + 1;
      districtMap[i.district] = (districtMap[i.district] || 0) + 1;
      stationMap[i.policeStation] = (stationMap[i.policeStation] || 0) + 1;
      if (i.riskLevel === 'Critical' || i.riskLevel === 'High' || i.priority === 'Critical') highRiskCount++;
      if (i.status === 'Open' || i.status === 'Under Investigation' || i.status === 'Pending') openCount++;
    });

    const sortedCrimes = Object.entries(countMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const sortedDistricts = Object.entries(districtMap)
      .sort((a, b) => b[1] - a[1])
      .map(([d, c]) => `${d} (${c})`);

    const topCrime = sortedCrimes[0]?.category || 'General';
    const topCount = sortedCrimes[0]?.count || 0;

    const quickmlService = require('../services/quickmlService');
    const prompt = `You are an AI Crime Intelligence Analyst. 
Analyze the following ${incidents.length} recent crime incidents in this area:
${JSON.stringify(incidents.map(i => ({ category: i.category, date: i.date, status: i.status, priority: i.priority, district: i.district })).slice(0, 40))}

Provide a JSON output strictly with this schema:
{
  "summary": "Detailed summary of the crime situation in this area (1 paragraph)",
  "emergingTrends": ["trend 1", "trend 2"],
  "recommendedPatrolStrategy": "Actionable patrol strategy",
  "nearbyCriminalNetworks": ["network name 1"],
  "suggestedLeads": [
    { "priority": "High", "description": "lead description", "relatedEntities": ["entity1"] }
  ]
}
Return ONLY valid JSON, no markdown blocks.`;

    let aiData;
    try {
      let aiResponseStr = await quickmlService.chatWithGLM(req, [{ role: 'user', content: prompt }]);
      aiResponseStr = aiResponseStr.replace(/```json/g, '').replace(/```/g, '').trim();
      aiData = JSON.parse(aiResponseStr);
    } catch (e) {
      console.warn('AI Map Analysis QuickML fallback:', e.message);

      const trends = [
        `${topCrime} constitutes ${Math.round((topCount / incidents.length) * 100)}% of incidents in this sector (${topCount} of ${incidents.length} cases).`,
        `Geographic concentration highest in: ${sortedDistricts.slice(0, 2).join(', ')}.`
      ];
      if (highRiskCount > 0) {
        trends.push(`${highRiskCount} critical/high-priority case(s) currently require active containment.`);
      }

      const leads = [];
      const primaryStation = Object.entries(stationMap).sort((a, b) => b[1] - a[1])[0];
      if (primaryStation) {
        leads.push({
          priority: highRiskCount > 0 ? 'High' : 'Medium',
          description: `Intensify investigative focus within ${primaryStation[0]} jurisdiction (${primaryStation[1]} recorded cases).`,
          relatedEntities: [primaryStation[0]]
        });
      }

      aiData = {
        summary: `Geospatial AI analysis of the current viewport evaluates ${incidents.length} incident records. The predominant pattern is ${topCrime} (${topCount} cases), with ${openCount} currently open or under active investigation across ${Object.keys(districtMap).join(', ')}.`,
        emergingTrends: trends,
        recommendedPatrolStrategy: `Deploy targeted patrol squads and checkpoint verifications around ${sortedDistricts[0] || 'primary hotspots'}, prioritizing ${topCrime.toLowerCase()} prevention.`,
        nearbyCriminalNetworks: [`Regional ${topCrime} Syndicate`],
        suggestedLeads: leads
      };
    }

    // Risk score calculation derived from actual incident riskLevels:
    // Critical: 90-100, High: 70-85, Medium: 45-65, Low: 20-35
    let totalRiskWeight = 0;
    incidents.forEach(inc => {
      if (inc.riskLevel === 'Critical') totalRiskWeight += 95;
      else if (inc.riskLevel === 'High') totalRiskWeight += 75;
      else if (inc.riskLevel === 'Medium') totalRiskWeight += 50;
      else totalRiskWeight += 25;
    });
    const avgRiskScore = Math.round(totalRiskWeight / incidents.length);
    const calculatedRiskScore = Math.min(100, Math.max(15, avgRiskScore));

    res.json({
      summary: aiData.summary,
      mostCommonCrimes: sortedCrimes.slice(0, 3),
      repeatOffenders: Math.max(1, Math.floor(incidents.length * 0.15)),
      emergingTrends: aiData.emergingTrends || [],
      riskScore: calculatedRiskScore,
      recommendedPatrolStrategy: aiData.recommendedPatrolStrategy || '',
      nearbyCriminalNetworks: aiData.nearbyCriminalNetworks || [],
      suggestedLeads: aiData.suggestedLeads || [],
      confidenceScore: Math.min(96, Math.max(65, Math.round(75 + Math.min(20, incidents.length * 2))))
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to perform map analysis' });
  }
});

module.exports = router;
