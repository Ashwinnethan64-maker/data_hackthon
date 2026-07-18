const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');

const HISTORY_TABLE = 'ai_history';
const FIRS_TABLE = 'firs';

const KANNADA_TRANSLATIONS = {
  summaryBase: 'ನಾನು ವಿಚಾರಣೆಗೆ ಹೊಂದಾಣಿಕೆಯಾಗುವ {count} ಪ್ರಕರಣ(ಗಳನ್ನು) ಕಂಡುಕೊಂಡಿದ್ದೇನೆ.',
  strongestSignal: ' ಪ್ರಮುಖ ಅಂಶವೆಂದರೆ {district} ನಲ್ಲಿ {crime} ಚಟುವಟಿಕೆ. ಪುರಾವೆಗಳು ಪ್ರಸ್ತುತ ದಾಖಲೆಯನ್ನು ಸಮೀಪದ ಘಟನೆಗಳಿಗೆ ಸಂಪರ್ಕಿಸುತ್ತವೆ.',
  noResults: 'ನಿಮ್ಮ ಹುಡುಕಾಟಕ್ಕೆ ಹೊಂದಾಣಿಕೆಯಾಗುವ ಯಾವುದೇ ಪ್ರಕರಣಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
  suggestion1: 'ಅದೇ ಠಾಣೆಯ ಸಂಬಂಧಿತ ಪ್ರಕರಣಗಳನ್ನು ತೋರಿಸಿ',
  suggestion2: 'ಆರೋಪಿಗಳ ಸಂಪರ್ಕಗಳನ್ನು ವಿವರಿಸಿ',
  suggestion3: 'ತನಿಖಾ ವರದಿಯನ್ನು ರಚಿಸಿ',
  suggestion4: 'ಅನ್ವಯವಾಗುವ ಕಾನೂನು ವಿಭಾಗಗಳನ್ನು ಪಟ್ಟಿ ಮಾಡಿ',
  action1: 'ಸಮಾನ ಪ್ರಕರಣ ದಾಖಲೆಗಳನ್ನು ತೆರೆಯಿರಿ',
  action2: 'ಸಾಕ್ಷಿಗಳು ಮತ್ತು ಪುರಾವೆಗಳ ಟಿಪ್ಪಣಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
  action3: 'ಈ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು PDF ಆಗಿ ರಫ್ತು ಮಾಡಿ'
};

// POST chat analysis (RAG pipeline)
router.post('/chat', async (req, res) => {
  try {
    const { query, messages = [], context = {}, language = 'en' } = req.body;
    const lowerQuery = query ? query.toLowerCase() : '';

    // Intent Detection — map keywords to actual crimeCategory values in the DB
    const CRIME_MAP = {
      burglary: 'Burglary',
      robbery: 'Burglary',
      theft: 'Burglary',
      cyber: 'Cybercrime',
      hacking: 'Cybercrime',
      phishing: 'Cybercrime',
      fraud: 'Fraud',
      cheating: 'Fraud',
      forgery: 'Fraud',
      drug: 'Drug Trafficking',
      narcotic: 'Drug Trafficking',
      ndps: 'Drug Trafficking',
      riot: 'Rioting',
      rioting: 'Rioting',
      extortion: 'Extortion',
      blackmail: 'Extortion',
      assault: 'Assault',
      hurt: 'Assault',
    };

    let crime = context.crime;
    for (const [keyword, category] of Object.entries(CRIME_MAP)) {
      if (lowerQuery.includes(keyword)) {
        crime = category;
        break;
      }
    }
    
    let district = lowerQuery.includes('mysuru') ? 'Mysuru'
                 : lowerQuery.includes('bengaluru') ? 'Bengaluru'
                 : lowerQuery.includes('mangaluru') ? 'Mangaluru'
                 : lowerQuery.includes('dharwad') ? 'Dharwad'
                 : lowerQuery.includes('belagavi') ? 'Belagavi'
                 : lowerQuery.includes('kalaburagi') ? 'Kalaburagi'
                 : lowerQuery.includes('dakshina kannada') ? 'Dakshina Kannada'
                 : lowerQuery.includes('hubballi') ? 'Hubballi-Dharwad'
                 : context.district;

    const isRepeat = lowerQuery.includes('repeat') || lowerQuery.includes('offender');

    const status = lowerQuery.includes('solved') || lowerQuery.includes('closed') ? 'Closed'
                 : lowerQuery.includes('pending') || lowerQuery.includes('unresolved') || lowerQuery.includes('open') ? 'Open'
                 : context.status;

    // RAG Retrieval
    let allFirs = await dbService.getAllRows(req, FIRS_TABLE);
    let filtered = allFirs;
    
    if (crime) filtered = filtered.filter(c => c.crimeCategory && c.crimeCategory.toLowerCase().includes(crime.toLowerCase()));
    if (district) filtered = filtered.filter(c => c.district && c.district.toLowerCase().includes(district.toLowerCase()));
    if (status) {
      if (status === 'Closed') filtered = filtered.filter(c => c.status === 'Closed');
      else filtered = filtered.filter(c => c.status !== 'Closed');
    }

    if (isRepeat) {
      // Find repeat offenders
      const offendersMap = new Map();
      filtered.forEach(f => {
        let accused = [];
        try { accused = typeof f.accused === 'string' ? JSON.parse(f.accused) : (f.accused || []); } catch(e){}
        accused.forEach(a => {
          offendersMap.set(a.name, (offendersMap.get(a.name) || 0) + 1);
        });
      });
      const repeatNames = Array.from(offendersMap.entries()).filter(e => e[1] > 1).map(e => e[0]);
      filtered = filtered.filter(f => {
        let accused = [];
        try { accused = typeof f.accused === 'string' ? JSON.parse(f.accused) : (f.accused || []); } catch(e){}
        return accused.some(a => repeatNames.includes(a.name));
      });
    }

    // Build Context-Aware AI Response
    let summary = '';
    const primaryCase = filtered[0];

    // Try utilizing Catalyst QuickML GLM serving
    try {
      const quickmlService = require('../services/quickmlService');
      
      // Build conversational history memory
      const conversationMemory = messages.slice(-4).map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
        content: msg.content
      }));

      const systemPrompt = `You are an AI Crime Intelligence Assistant for the Karnataka State Police. 
Analyze the provided cases, extract evidence, detect suspect connections, and answer the user's query.
Be extremely concise, professional, and factual. Cite the FIR numbers when referencing cases.
Do not output any internal reasoning, draft thinking, or step-by-step chain-of-thought analysis. Output ONLY the final response.`;

      const userPrompt = `User Query: "${query}"
Retrieved Case Context:
${JSON.stringify(filtered.slice(0, 3).map(c => ({
  firNumber: c.firNumber,
  crimeCategory: c.crimeCategory,
  description: c.description,
  district: c.district,
  policeStation: c.policeStation,
  incidentDate: c.incidentDate,
  status: c.status,
  priority: c.priorityLevel || c.priority || 'Medium'
})), null, 2)}

Provide a summary answering the user query.`;

      const messagesPayload = [
        { role: 'system', content: systemPrompt },
        ...conversationMemory,
        { role: 'user', content: userPrompt }
      ];

      summary = await quickmlService.chatWithGLM(req, messagesPayload);
    } catch (err) {
      console.warn('[WARN] QuickML GLM query failed, using rule-based fallback:', err.message);

      if (filtered.length === 0) {
        summary = language === 'kn' ? KANNADA_TRANSLATIONS.noResults : 'I could not find any matching cases based on your query.';
      } else {
        let caseDesc = primaryCase.crimeCategory ? primaryCase.crimeCategory.toLowerCase() : 'unknown';
        let distDesc = primaryCase.district || 'the region';
        
        if (language === 'kn') {
          let sumBase = KANNADA_TRANSLATIONS.summaryBase.replace('{count}', filtered.length);
          let signal = KANNADA_TRANSLATIONS.strongestSignal.replace('{district}', distDesc).replace('{crime}', caseDesc);
          summary = sumBase + signal;
        } else {
          summary = `I found ${filtered.length} matching case${filtered.length === 1 ? '' : 's'}. `;
          if (isRepeat) {
            summary += `There is evidence of repeat offenders operating in this dataset. `;
          } else {
            summary += `The strongest signal is ${caseDesc} activity in ${distDesc}, with evidence linking the current records to nearby incidents. `;
          }
          if (messages.length > 2) {
            summary += `Following up on our earlier conversation, these matches refine the previous search.`;
          }
        }
      }
    }

    // Prepare Evidence & Explanations
    let evidenceItems = [];
    let acts = [];
    if (primaryCase) {
      try { evidenceItems = typeof primaryCase.evidence === 'string' ? JSON.parse(primaryCase.evidence) : (primaryCase.evidence || []); } catch(e){}
      try { acts = typeof primaryCase.applicableActs === 'string' ? JSON.parse(primaryCase.applicableActs) : (primaryCase.applicableActs || []); } catch(e){}
      
      if (evidenceItems.length === 0 && primaryCase.description) {
        evidenceItems.push({ type: 'Statement', description: primaryCase.description.substring(0, 50) + '...' });
      }
    }

    // Map evidence items to expected frontend format: { label, value, source }
    const formattedEvidence = evidenceItems.map(item => ({
      label: item.label || item.type || 'Evidence Log',
      value: item.value || item.description || 'Verified evidence log record.',
      source: item.source || `Case ${primaryCase.firNumber || 'Record'}`
    }));

    const confidence = filtered.length > 0 ? (lowerQuery.includes('summarize') ? 95 : 88) : 50;

    const responsePayload = {
      summary,
      evidence: formattedEvidence,
      confidence,
      relatedCases: filtered.slice(0, 5).map(c => ({
        firNumber: c.firNumber,
        crime: c.crimeCategory,
        district: c.district,
        station: c.policeStation,
        status: c.status
      })),
      investigationTimeline: primaryCase ? [
        { title: 'FIR Registered', time: primaryCase.incidentDate },
        { title: 'Evidence Collected', time: 'Ongoing' }
      ] : [],
      suggestedQuestions: language === 'kn' ? [
        KANNADA_TRANSLATIONS.suggestion1, KANNADA_TRANSLATIONS.suggestion2, KANNADA_TRANSLATIONS.suggestion3, KANNADA_TRANSLATIONS.suggestion4
      ] : [
        'Show related cases from the same station',
        'Explain the suspect connections',
        'Generate investigation report',
        'List applicable legal sections'
      ],
      recommendedActions: language === 'kn' ? [
        KANNADA_TRANSLATIONS.action1, KANNADA_TRANSLATIONS.action2, KANNADA_TRANSLATIONS.action3
      ] : [
        'Open similar case records',
        'Review witness and evidence notes',
        'Export the response as PDF'
      ],
      applicableActs: acts,
      updatedContext: { crime, district, status }
    };

    // Save conversation step to history
    await dbService.insertRow(req, HISTORY_TABLE, { 
      query: lowerQuery, 
      response: summary,
      language: language
    }).catch(err => console.error("History save failed", err));

    res.json(responsePayload);
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to process AI chat query' });
  }
});

// GET all AI history
router.get('/', async (req, res) => {
  try {
    const records = await dbService.getAllRows(req, HISTORY_TABLE);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI history' });
  }
});

// GET an AI history record by id
router.get('/:id', async (req, res) => {
  try {
    const record = await dbService.getRow(req, HISTORY_TABLE, req.params.id);
    if (record) {
      res.json(record);
    } else {
      res.status(404).json({ error: 'AI history record not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI history record' });
  }
});

// DELETE an AI history record
router.delete('/:id', async (req, res) => {
  try {
    const deletedRecord = await dbService.deleteRow(req, HISTORY_TABLE, req.params.id);
    res.json({ success: true, deletedRecord });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete AI history record' });
  }
});

module.exports = router;
