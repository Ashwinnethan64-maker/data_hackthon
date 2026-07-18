const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const PDFDocument = require('pdfkit');
const { verifyToken } = require('../middleware/auth');

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

const OFFICER_ID_TO_USERNAME = {
  '101': 'a.fernandes',
  '102': 'j.deshpande',
  '103': 't.r.swamy',
  '104': 'm.s.rao',
  '105': 's.patil',
  '106': 'v.shetty',
  '107': 'g.bhat',
  '108': 'k.r.naik',
  '109': 'p.n.kulkarni',
  '110': 's.b.hiremath'
};

function normalizeCaseRecord(record, officers = []) {
  let officerObj = { name: 'Unknown', rank: 'Unknown' };

  if (record.officerId) {
    const targetUsername = OFFICER_ID_TO_USERNAME[record.officerId];
    const matched = officers.find(o => 
      String(o.ROWID) === String(record.officerId) || 
      String(o.id) === String(record.officerId) ||
      (targetUsername && o.username === targetUsername)
    );
    
    if (matched) {
      officerObj = {
        name: matched.name || 'Unknown',
        rank: matched.role ? (matched.role.charAt(0).toUpperCase() + matched.role.slice(1)) : 'Investigator'
      };
    }
  } else if (record.officer) {
    const parsed = parseJSONField(record.officer);
    if (parsed && typeof parsed === 'object') {
      officerObj = {
        name: parsed.name || 'Unknown',
        rank: parsed.rank || 'Unknown'
      };
    }
  }

  return {
    ...record,
    id: record.ROWID || record.id,
    priority: record.priorityLevel || record.priority || 'Medium',
    victims: parseJSONField(record.victims) || [],
    accused: parseJSONField(record.accused) || [],
    officer: officerObj,
    applicableActs: parseJSONField(record.applicableActs) || [],
    evidence: (parseJSONField(record.evidence) || []).map(ev => ({
      label: ev.label || ev.type || 'Evidence Exhibit',
      value: ev.value || ev.description || '',
      source: ev.source || record.policeStation || 'Investigation Log'
    })),
    timeline: parseJSONField(record.timeline) || []
  };
}

// GET all cases (with search, filter, sort, paginate)
router.get('/', async (req, res) => {
  try {
    let cases = await dbService.getAllRows(req, TABLE_NAME);
    const officers = await dbService.getAllRows(req, 'officers').catch(() => []);
    
    // Normalize data structures
    cases = cases.map(c => normalizeCaseRecord(c, officers));

    // Filter out soft-deleted cases
    cases = cases.filter(c => c.status !== 'Inactive' && c.status !== 'Archived');

    // Extract query params
    const { 
      searchQuery, crimeCategory, district, policeStation, status, priority, 
      dateFrom, dateTo, ipcSection, officerName, hasRepeatOffender, 
      victimGender, victimAgeMin, victimAgeMax, 
      accusedGender, accusedAgeMin, accusedAgeMax,
      sortBy = 'firNumber', sortOrder = 'asc', page = 1, limit = 10 
    } = req.query;

    // Apply Filters
    cases = cases.filter(record => {
      // 1. Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesFir = (record.firNumber || '').toLowerCase().includes(q);
        const matchesDesc = (record.description || '').toLowerCase().includes(q);
        const matchesOfficer = (record.officer?.name || '').toLowerCase().includes(q);
        const matchesStation = (record.policeStation || '').toLowerCase().includes(q);
        if (!matchesFir && !matchesDesc && !matchesOfficer && !matchesStation) return false;
      }

      // 2. Exact match filters
      if (crimeCategory && record.crimeCategory !== crimeCategory) return false;
      if (district && record.district !== district) return false;
      if (policeStation && record.policeStation !== policeStation) return false;
      if (status && record.status !== status) return false;
      if (priority && record.priority !== priority) return false;

      // 3. Date Range
      if (dateFrom && new Date(record.incidentDate) < new Date(dateFrom)) return false;
      if (dateTo && new Date(record.incidentDate) > new Date(dateTo)) return false;

      // 4. IPC Sections
      if (ipcSection) {
        const section = ipcSection.toLowerCase();
        const matchesAct = record.applicableActs.some(act => typeof act === 'string' && act.toLowerCase().includes(section));
        if (!matchesAct) return false;
      }

      // 5. Officer Name
      if (officerName) {
        const name = officerName.toLowerCase();
        if (!(record.officer?.name || '').toLowerCase().includes(name)) return false;
      }

      // 6. Accused & Victims
      if (hasRepeatOffender !== undefined && hasRepeatOffender !== 'null') {
        const hr = hasRepeatOffender === 'true';
        const hasRepeat = record.accused.some(acc => acc.isRepeatOffender);
        if (hr !== hasRepeat) return false;
      }

      if (victimGender && !record.victims.some(v => v.gender === victimGender)) return false;
      if (victimAgeMin !== undefined && victimAgeMin !== '') {
        const minAge = Number(victimAgeMin);
        if (!record.victims.some(v => v.age >= minAge)) return false;
      }
      if (victimAgeMax !== undefined && victimAgeMax !== '') {
        const maxAge = Number(victimAgeMax);
        if (!record.victims.some(v => v.age <= maxAge)) return false;
      }

      if (accusedGender && !record.accused.some(a => a.gender === accusedGender)) return false;
      if (accusedAgeMin !== undefined && accusedAgeMin !== '') {
        const minAge = Number(accusedAgeMin);
        if (!record.accused.some(a => a.age >= minAge)) return false;
      }
      if (accusedAgeMax !== undefined && accusedAgeMax !== '') {
        const maxAge = Number(accusedAgeMax);
        if (!record.accused.some(a => a.age <= maxAge)) return false;
      }

      return true;
    });

    // Apply Sorting
    cases.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'officer') {
        aVal = a.officer?.name || '';
        bVal = b.officer?.name || '';
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    
    const paginatedCases = cases.slice(startIndex, startIndex + limitNum);
    const totalRecords = cases.length;
    const totalPages = Math.ceil(totalRecords / limitNum);

    res.json({
      data: paginatedCases,
      pagination: {
        totalRecords,
        page: pageNum,
        pageSize: limitNum,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// GET a case by id
router.get('/:id', async (req, res) => {
  try {
    const officers = await dbService.getAllRows(req, 'officers').catch(() => []);

    // 1. Try direct lookup by ROWID first
    const record = await dbService.getRow(req, TABLE_NAME, req.params.id);
    if (record && record.firNumber && record.ROWID === req.params.id) {
      return res.json(normalizeCaseRecord(record, officers));
    }

    // 2. Fall back to scanning all rows by firNumber (covers alphanumeric, purely numeric, or hyphenated FIRs)
    const allCases = await dbService.getAllRows(req, TABLE_NAME);
    const found = allCases.find(c => c.firNumber === req.params.id || c.ROWID === req.params.id);
    if (found) {
      return res.json(normalizeCaseRecord(found, officers));
    }

    res.status(404).json({ error: 'Case not found' });
  } catch (error) {
    console.error('Error fetching case by ID:', error);
    res.status(500).json({ error: 'Failed to fetch case' });
  }
});

// GET /cases/:id/export-pdf
router.get('/:id/export-pdf', async (req, res) => {
  try {
    const officers = await dbService.getAllRows(req, 'officers').catch(() => []);
    
    // Find case record
    const recordId = req.params.id;
    let record = await dbService.getRow(req, TABLE_NAME, recordId);
    
    if (!record || record.ROWID !== recordId) {
      // Fallback scan
      const allCases = await dbService.getAllRows(req, TABLE_NAME);
      record = allCases.find(c => c.firNumber === recordId || c.ROWID === recordId);
    }
    
    if (!record) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    const normalized = normalizeCaseRecord(record, officers);
    
    // Generate PDF using PDFKit
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="FIR_Report_${normalized.firNumber}.pdf"`);
      res.send(pdfBuffer);
    });
    
    // Design layout
    // 1. Header
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#0f172a').text('KARNATAKA STATE POLICE', { align: 'center' });
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#334155').text('FIRST INFORMATION REPORT (FIR)', { align: 'center' });
    doc.fontSize(9).font('Helvetica-Oblique').fillColor('#64748b').text('AI-CIOS Crime Intelligence Export', { align: 'center' });
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cbd5e1').strokeWidth(1).stroke();
    doc.moveDown(1);
    
    // 2. Details Table-like layout
    const yStart = doc.y;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0284c7').text('CASE METADATA', 50, yStart);
    doc.font('Helvetica').fontSize(10).fillColor('#1e293b');
    doc.text(`FIR Number: ${normalized.firNumber}`, 50, yStart + 20);
    doc.text(`Crime Type: ${normalized.crimeCategory}`, 50, yStart + 35);
    doc.text(`District: ${normalized.district}`, 50, yStart + 50);
    doc.text(`Police Station: ${normalized.policeStation}`, 50, yStart + 65);
    
    doc.text(`Status: ${normalized.status}`, 320, yStart + 20);
    doc.text(`Priority: ${normalized.priority}`, 320, yStart + 35);
    doc.text(`Incident Date: ${new Date(normalized.incidentDate).toLocaleString('en-IN')}`, 320, yStart + 50);
    doc.text(`Coordinates: ${normalized.latitude.toFixed(5)}°, ${normalized.longitude.toFixed(5)}°`, 320, yStart + 65);
    
    doc.moveDown(6.5);
    
    // 3. Investigating Officer
    const yOfficer = doc.y;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0284c7').text('ASSIGNED INVESTIGATING OFFICER', 50, yOfficer);
    doc.font('Helvetica').fontSize(10).fillColor('#1e293b');
    doc.text(`Name: ${normalized.officer.name}`, 50, yOfficer + 20);
    doc.text(`Rank/Role: ${normalized.officer.rank}`, 320, yOfficer + 20);
    
    doc.moveDown(3.5);
    
    // 4. Case Description
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0284c7').text('INCIDENT DESCRIPTION', 50);
    doc.font('Helvetica').fontSize(10).fillColor('#1e293b');
    doc.moveDown(0.5);
    doc.text(normalized.description, { width: 495, align: 'justify', lineGap: 3 });
    
    doc.moveDown(1.5);
    
    // 5. Applicable Acts
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0284c7').text('APPLICABLE LEGAL IPC / BNS SECTIONS', 50);
    doc.font('Helvetica').fontSize(10).fillColor('#1e293b');
    doc.moveDown(0.5);
    doc.text(normalized.applicableActs.join(', ') || 'None registered');
    
    doc.moveDown(1.5);
    
    // 6. Demographics
    const yDem = doc.y;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0284c7').text('VICTIMS', 50, yDem);
    doc.font('Helvetica').fontSize(10).fillColor('#1e293b');
    let currentY = yDem + 20;
    if (normalized.victims.length === 0) {
      doc.text('No victim profiles registered', 50, currentY);
      currentY += 15;
    } else {
      normalized.victims.forEach(v => {
        doc.text(`- ${v.name} (${v.gender}, Age ${v.age})`, 50, currentY);
        currentY += 15;
      });
    }
    
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0284c7').text('ACCUSED / SUSPECTS', 320, yDem);
    doc.font('Helvetica').fontSize(10).fillColor('#1e293b');
    let currentYAcc = yDem + 20;
    if (normalized.accused.length === 0) {
      doc.text('No suspects identified', 320, currentYAcc);
      currentYAcc += 15;
    } else {
      normalized.accused.forEach(a => {
        doc.text(`- ${a.name} (${a.gender}, Age ${a.age})${a.isRepeatOffender ? ' [REPEAT OFFENDER]' : ''}`, 320, currentYAcc);
        currentYAcc += 15;
      });
    }
    
    doc.y = Math.max(currentY, currentYAcc) + 15;
    
    // 7. Evidence
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0284c7').text('EVIDENCE EXHIBITS LOG', 50);
    doc.font('Helvetica').fontSize(10).fillColor('#1e293b');
    doc.moveDown(0.5);
    if (normalized.evidence.length === 0) {
      doc.text('No evidence exhibits logged');
    } else {
      normalized.evidence.forEach(ev => {
        doc.text(`* [${ev.label}] ${ev.value} (Source: ${ev.source})`, { width: 495, lineGap: 2 });
        doc.moveDown(0.3);
      });
    }
    
    doc.moveDown(1);
    
    // 8. Timeline
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0284c7').text('INVESTIGATION MILESTONES TIMELINE', 50);
    doc.font('Helvetica').fontSize(10).fillColor('#1e293b');
    doc.moveDown(0.5);
    normalized.timeline.forEach(step => {
      doc.text(`- [${step.time}] ${step.title} (${step.status.toUpperCase()})`);
    });
    
    doc.moveDown(2);
    
    // 9. Footer
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#64748b').text('CONFIDENTIAL - LAW ENFORCEMENT SENSITIVE', { align: 'center' });
    doc.fontSize(7).text(`Generated by AI-CIOS State Police Intelligence System on ${new Date().toLocaleString()}`, { align: 'center' });
    
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to export case PDF' });
  }
});

// POST a new case
router.post('/', async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    
    const rowData = { ...req.body };
    if (rowData.priority) {
      rowData.priorityLevel = rowData.priority;
      delete rowData.priority;
    }

    // Auto-assign the authenticated officer if none was provided
    if (!rowData.officerId && req.user) {
      try {
        const officers = await dbService.getAllRows(req, 'officers');
        const matchedOfficer = officers.find(o =>
          o.username === req.user.username ||
          String(o.ROWID) === String(req.user.id) ||
          String(o.id) === String(req.user.id)
        );
        if (matchedOfficer) {
          rowData.officerId = String(matchedOfficer.ROWID || matchedOfficer.id);
        }
      } catch (err) {
        console.warn('[WARN] Could not resolve officer for new case:', err.message);
      }
    }

    ['victims', 'accused', 'officer', 'applicableActs', 'evidence', 'timeline'].forEach(key => {
      if (rowData[key] && typeof rowData[key] !== 'string') {
        rowData[key] = JSON.stringify(rowData[key]);
      }
    });

    const newRecord = await dbService.insertRow(req, TABLE_NAME, rowData);
    const officers = await dbService.getAllRows(req, 'officers').catch(() => []);
    res.status(201).json(normalizeCaseRecord(newRecord, officers));
  } catch (error) {
    res.status(500).json({ error: 'Failed to create case' });
  }
});

// PUT update a case
router.put('/:id', async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    
    const updateData = { ROWID: req.params.id, ...req.body };
    if (updateData.priority) {
      updateData.priorityLevel = updateData.priority;
      delete updateData.priority;
    }
    ['victims', 'accused', 'officer', 'applicableActs', 'evidence', 'timeline'].forEach(key => {
      if (updateData[key] && typeof updateData[key] !== 'string') {
        updateData[key] = JSON.stringify(updateData[key]);
      }
    });

    const updatedRecord = await dbService.updateRow(req, TABLE_NAME, updateData);
    const officers = await dbService.getAllRows(req, 'officers').catch(() => []);
    res.json(normalizeCaseRecord(updatedRecord, officers));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update case' });
  }
});

// DELETE a case (Soft Delete)
router.delete('/:id', async (req, res) => {
  try {
    const updateData = { ROWID: req.params.id, status: 'Inactive' };
    const updatedRecord = await dbService.updateRow(req, TABLE_NAME, updateData);
    const officers = await dbService.getAllRows(req, 'officers').catch(() => []);
    res.json({ success: true, deletedRecord: normalizeCaseRecord(updatedRecord, officers) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete case' });
  }
});

module.exports = router;
