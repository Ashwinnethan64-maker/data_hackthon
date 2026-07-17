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

function normalizeCaseRecord(record) {
  return {
    ...record,
    id: record.ROWID || record.id,
    priority: record.priorityLevel || record.priority || 'Medium',
    victims: parseJSONField(record.victims) || [],
    accused: parseJSONField(record.accused) || [],
    officer: parseJSONField(record.officer) || { name: 'Unknown', rank: 'Unknown' },
    applicableActs: parseJSONField(record.applicableActs) || [],
    evidence: parseJSONField(record.evidence) || [],
    timeline: parseJSONField(record.timeline) || []
  };
}

// GET all cases (with search, filter, sort, paginate)
router.get('/', async (req, res) => {
  try {
    let cases = await dbService.getAllRows(req, TABLE_NAME);
    
    // Normalize data structures
    cases = cases.map(normalizeCaseRecord);

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
    // If :id starts with FIR_, it might be firNumber instead of ROWID
    if (req.params.id.startsWith('FIR_') || req.params.id.includes('-')) {
       const allCases = await dbService.getAllRows(req, TABLE_NAME);
       const found = allCases.find(c => c.firNumber === req.params.id);
       if (found) {
         return res.json(normalizeCaseRecord(found));
       }
       return res.status(404).json({ error: 'Case not found' });
    }

    const record = await dbService.getRow(req, TABLE_NAME, req.params.id);
    if (record) {
      res.json(normalizeCaseRecord(record));
    } else {
      res.status(404).json({ error: 'Case not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch case' });
  }
});

// POST a new case
router.post('/', async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    
    // Stringify JSON objects before saving to Catalyst
    const rowData = { ...req.body };
    if (rowData.priority) {
      rowData.priorityLevel = rowData.priority;
      delete rowData.priority;
    }
    ['victims', 'accused', 'officer', 'applicableActs', 'evidence', 'timeline'].forEach(key => {
      if (rowData[key] && typeof rowData[key] !== 'string') {
        rowData[key] = JSON.stringify(rowData[key]);
      }
    });

    const newRecord = await dbService.insertRow(req, TABLE_NAME, rowData);
    res.status(201).json(normalizeCaseRecord(newRecord));
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
    res.json(normalizeCaseRecord(updatedRecord));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update case' });
  }
});

// DELETE a case (Soft Delete)
router.delete('/:id', async (req, res) => {
  try {
    const updateData = { ROWID: req.params.id, status: 'Inactive' };
    const updatedRecord = await dbService.updateRow(req, TABLE_NAME, updateData);
    res.json({ success: true, deletedRecord: normalizeCaseRecord(updatedRecord) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete case' });
  }
});

module.exports = router;
