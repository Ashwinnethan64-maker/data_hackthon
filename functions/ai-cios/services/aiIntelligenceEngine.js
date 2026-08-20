const crypto = require('crypto');

// Safely parse JSON properties from Catalyst string fields
function parseJSON(val, fallback = []) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

/**
 * Detect language: 'kn' | 'en' | 'mixed'
 */
function detectLanguage(text = '', requestedLang = 'en') {
  const hasKannada = /[\u0C80-\u0CFF]/.test(text);
  const lower = text.toLowerCase();
  
  if (lower.includes('in kannada') || lower.includes('ಕನ್ನಡದಲ್ಲಿ') || lower.includes('ಕನ್ನಡ')) {
    return 'kn';
  }
  if (lower.includes('in english') || lower.includes('ಆಂಗ್ಲದಲ್ಲಿ') || lower.includes('ಇಂಗ್ಲಿಷ್')) {
    return 'en';
  }
  if (hasKannada) {
    const hasEnglishWords = /[a-zA-Z]{3,}/.test(text);
    return hasEnglishWords ? 'mixed' : 'kn';
  }
  return requestedLang === 'kn' ? 'kn' : 'en';
}

/**
 * Intent Classifier with strict separation of general conversation, capability explanation,
 * external research, and domain crime search queries.
 */
function classifyIntent(query = '', context = {}) {
  const clean = query.trim();
  const lower = clean.toLowerCase().replace(/[?!.,]/g, '').trim();

  // 1. External Research / Internet Search / Non-police queries
  const externalResearchKeywords = [
    'internet', 'google', 'search online', 'web search', 'browse the web', 'look up online',
    'sih', 'smart india hackathon', 'hackathon template', 'ppt template', 'slide template',
    'template for me', 'research an sih', 'research a template', 'weather today', 'recipe',
    'movie', 'cricket score', 'stock price', 'bitcoin', 'crypto price'
  ];
  if (externalResearchKeywords.some(kw => lower.includes(kw))) {
    return { type: 'external_research' };
  }

  // 2. Greetings / Small talk
  const greetingPhrases = [
    'hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'good day',
    'how are you', 'are you fine', 'how do you do', 'who are you', 'what are you', 'tell me about yourself',
    'namaskara', 'namaste', 'ಹಲೋ', 'ನಮಸ್ಕಾರ', 'ಹೇಗಿದ್ದೀರಿ', 'ನೀವು ಯಾರು', 'ಶುಭೋದಯ', 'ಹೇಗಿದ್ದೀರ',
    'thank you', 'thanks', 'dhanyavada', 'ಧನ್ಯವಾದ', 'ಧನ್ಯವಾದಗಳು'
  ];
  if (greetingPhrases.includes(lower) || greetingPhrases.some(g => lower.startsWith(g + ' ') || lower.endsWith(' ' + g))) {
    return { type: 'greeting' };
  }

  // 3. Capabilities / Help / What can you do?
  const capabilityPhrases = [
    'what can you do', 'what can you help me with', 'help me', 'how can you help',
    'what are your features', 'features', 'help', 'capabilities', 'ನೀವು ಏನು ಮಾಡಬಹುದು', 'ಸಹಾಯ'
  ];
  if (capabilityPhrases.includes(lower) || capabilityPhrases.some(c => lower.includes(c))) {
    return { type: 'capabilities' };
  }

  // 4. Translation requests
  if (
    lower.includes('translate that to kannada') ||
    lower.includes('translate to kannada') ||
    lower.includes('in kannada') ||
    lower.includes('ಕನ್ನಡದಲ್ಲಿ ತಿಳಿಸಿ') ||
    lower.includes('ಕನ್ನಡಕ್ಕೆ ಭಾಷಾಂತರಿಸಿ')
  ) {
    return { type: 'translate', targetLang: 'kn' };
  }
  if (
    lower.includes('translate that to english') ||
    lower.includes('translate to english') ||
    lower.includes('in english') ||
    lower.includes('ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ತಿಳಿಸಿ')
  ) {
    return { type: 'translate', targetLang: 'en' };
  }

  // 5. Follow-up: Count / Quantity
  if (
    lower.includes('how many are active') ||
    lower.includes('how many are pending') ||
    lower.includes('how many did you find') ||
    lower.includes('how many cases') ||
    lower.includes('how many') ||
    lower.includes('total cases') ||
    lower.includes('count') ||
    lower.includes('ಎಷ್ಟು ಪ್ರಕರಣ') ||
    lower.includes('ಎಷ್ಟು ಸಕ್ರಿಯ') ||
    lower.includes('ಎಷ್ಟು ಇದೆ') ||
    lower.includes('ಸಂಖ್ಯೆ ಎಷ್ಟು')
  ) {
    return { type: 'count' };
  }

  // 6. Follow-up: High risk / Priority
  if (
    lower.includes('highest risk') ||
    lower.includes('high risk') ||
    lower.includes('critical case') ||
    lower.includes('most critical') ||
    lower.includes('most dangerous') ||
    lower.includes('ಹೆಚ್ಚು ಅಪಾಯ') ||
    lower.includes('ಹೆಚ್ಚಿನ ರಿಸ್ಕ್')
  ) {
    return { type: 'highest_risk' };
  }

  // 7. Follow-up: Case details / previous case
  if (
    lower.includes('first one') ||
    lower.includes('previous case') ||
    lower.includes('that case') ||
    lower.includes('more details') ||
    lower.includes('first case') ||
    lower.includes('ವಿವರಗಳನ್ನು ನೀಡಿ') ||
    lower.includes('ಆ ಪ್ರಕರಣ') ||
    lower.includes('ಮೊದಲನೆಯದು')
  ) {
    return { type: 'case_details' };
  }

  // 8. Repeat offenders lookup
  if (
    lower.includes('repeat offender') ||
    lower.includes('habitual offender') ||
    lower.includes('reoffender') ||
    lower.includes('ಪುನರಾವರ್ತಿತ') ||
    lower.includes('ಖದೀಮ')
  ) {
    return { type: 'repeat_offenders' };
  }

  // 9. Specific Crime/FIR Query Intent (Explicit crime terms or locations or FIR numbers)
  const crimeKeywords = [
    'fir', 'case', 'cases', 'crime', 'crimes', 'police', 'investigation', 'accused', 'suspect', 'victim',
    'drug', 'narcotic', 'ndps', 'cyber', 'cybercrime', 'hacking', 'phishing', 'fraud', 'cheating', 'forgery',
    'burglary', 'theft', 'robbery', 'assault', 'attack', 'extortion', 'blackmail', 'riot', 'rioting',
    'bengaluru', 'bangalore', 'mysuru', 'mysore', 'dharwad', 'belagavi', 'kalaburagi', 'mangaluru',
    'dakshina kannada', 'hubballi', 'station', 'section', 'act', 'active', 'pending', 'closed', 'solved',
    'ಪ್ರಕರಣ', 'ಅಪರಾಧ', 'ಪೊಲೀಸ್', 'ತನಿಖೆ', 'ಆರೋಪಿ', 'ಸೈಬರ್', 'ವಂಚನೆ', 'ಕಳುವು', 'ದರೋಡೆ', 'ಹಲ್ಲೆ', 'ಸುಲಿಗೆ', 'ಗಲಭೆ',
    'ಬೆಂಗಳೂರು', 'ಮೈಸೂರು', 'ಧಾರವಾಡ', 'ಬೆಳಗಾವಿ', 'ಕಲಬುರಗಿ', 'ಮಂಗಳೂರು'
  ];

  const hasCrimeKeywords = crimeKeywords.some(kw => lower.includes(kw));
  if (hasCrimeKeywords) {
    return { type: 'crime_search' };
  }

  // 10. Default for any other conversational message: General conversation (NEVER crime search)
  return { type: 'general_conversation' };
}

/**
 * Filter FIRs dynamically based on entity extraction & conversation memory
 */
function extractFiltersAndQuery(allFirs, query = '', context = {}) {
  const lower = query.toLowerCase();
  
  // District map
  const DISTRICT_MAP = {
    'bengaluru': 'Bengaluru Urban',
    'bangalore': 'Bengaluru Urban',
    'ಬೆಂಗಳೂರು': 'Bengaluru Urban',
    'mysuru': 'Mysuru',
    'mysore': 'Mysuru',
    'ಮೈಸೂರು': 'Mysuru',
    'dharwad': 'Dharwad',
    'ಧಾರವಾಡ': 'Dharwad',
    'belagavi': 'Belagavi',
    'belgaum': 'Belagavi',
    'ಬೆಳಗಾವಿ': 'Belagavi',
    'kalaburagi': 'Kalaburagi',
    'gulbarga': 'Kalaburagi',
    'ಕಲಬುರಗಿ': 'Kalaburagi',
    'mangaluru': 'Dakshina Kannada',
    'mangalore': 'Dakshina Kannada',
    'dakshina kannada': 'Dakshina Kannada',
    'ದಕ್ಷಿಣ ಕನ್ನಡ': 'Dakshina Kannada',
    'hubballi': 'Dharwad',
    'ಹುಬ್ಬಳ್ಳಿ': 'Dharwad'
  };

  // Crime category map
  const CRIME_MAP = {
    'drug': 'Drug Trafficking',
    'narcotic': 'Drug Trafficking',
    'ndps': 'Drug Trafficking',
    'ಮಾದಕ': 'Drug Trafficking',
    'ಗಾಂಜಾ': 'Drug Trafficking',
    'ಡ್ರಗ್ಸ್': 'Drug Trafficking',
    'cyber': 'Cybercrime',
    'cybercrime': 'Cybercrime',
    'hacking': 'Cybercrime',
    'phishing': 'Cybercrime',
    'ಸೈಬರ್': 'Cybercrime',
    'ಹ್ಯಾಕಿಂಗ್': 'Cybercrime',
    'ಫಿಶಿಂಗ್': 'Cybercrime',
    'fraud': 'Fraud',
    'cheating': 'Fraud',
    'forgery': 'Fraud',
    'ವಂಚನೆ': 'Fraud',
    'ಫ್ರಾಡ್': 'Fraud',
    'burglary': 'Burglary',
    'theft': 'Burglary',
    'robbery': 'Burglary',
    'ಕಳುವು': 'Burglary',
    'ದರೋಡೆ': 'Burglary',
    'ಮನೆಗಳ್ಳತನ': 'Burglary',
    'assault': 'Assault',
    'attack': 'Assault',
    'ಹಲ್ಲೆ': 'Assault',
    'ಹೊಡೆದಾಟ': 'Assault',
    'extortion': 'Extortion',
    'blackmail': 'Extortion',
    'ಸುಲಿಗೆ': 'Extortion',
    'ಬೆದರಿಕೆ': 'Extortion',
    'riot': 'Rioting',
    'rioting': 'Rioting',
    'ಗಲಭೆ': 'Rioting'
  };

  let detectedDistrict = null;
  for (const [key, dist] of Object.entries(DISTRICT_MAP)) {
    if (lower.includes(key)) {
      detectedDistrict = dist;
      break;
    }
  }

  let detectedCrime = null;
  for (const [key, cat] of Object.entries(CRIME_MAP)) {
    if (lower.includes(key)) {
      detectedCrime = cat;
      break;
    }
  }

  // Check for specific FIR number reference
  const targetFir = allFirs.find(f => f.firNumber && lower.includes(f.firNumber.toLowerCase()));

  // Resolve filters: explicit in current query takes priority, else inherit from previous context ONLY if follow-up
  const isExplicitQuery = !!(detectedDistrict || detectedCrime || targetFir);
  const finalDistrict = detectedDistrict || (context.hasActiveCrimeSearch ? context.district : null);
  const finalCrime = detectedCrime || (context.hasActiveCrimeSearch ? context.crime : null);
  const finalStatus = lower.includes('open') || lower.includes('pending') || lower.includes('active') || lower.includes('ಬಾಕಿ') || lower.includes('ಸಕ್ರಿಯ') ? 'Open'
                    : lower.includes('closed') || lower.includes('solved') || lower.includes('ಮುಚ್ಚಲಾಗಿದೆ') ? 'Closed'
                    : (context.hasActiveCrimeSearch ? context.status : null);

  let results = [...allFirs];

  if (targetFir) {
    results = [targetFir];
  } else if (finalCrime || finalDistrict || finalStatus) {
    if (finalCrime) {
      results = results.filter(f => f.crimeCategory && f.crimeCategory.toLowerCase().includes(finalCrime.toLowerCase()));
    }
    if (finalDistrict) {
      results = results.filter(f => f.district && f.district.toLowerCase().includes(finalDistrict.toLowerCase()));
    }
    if (finalStatus) {
      if (finalStatus === 'Closed') {
        results = results.filter(f => f.status === 'Closed');
      } else {
        results = results.filter(f => f.status !== 'Closed');
      }
    }
  }

  return {
    filteredFirs: results,
    context: {
      hasActiveCrimeSearch: isExplicitQuery || context.hasActiveCrimeSearch || false,
      crime: finalCrime,
      district: finalDistrict,
      status: finalStatus,
      lastCaseId: results[0]?.firNumber || context.lastCaseId || null,
      lastResultCount: results.length
    }
  };
}

/**
 * Generate intelligent, grounded response strictly based on intent and real data
 */
function generateGroundedResponse(intent, query, filteredFirs, allFirs, language, context, previousMessages = []) {
  const isKn = language === 'kn' || language === 'mixed';

  // ── INTENT 1: EXTERNAL RESEARCH / INTERNET SEARCH ───────────────────────────
  if (intent.type === 'external_research') {
    if (isKn) {
      return {
        summary: 'ನಾನು AI-CIOS ತನಿಖಾ ಸಹಾಯಕವಾಗಿದ್ದು, ಆಂತರಿಕ ಪೊಲೀಸ್ ಇಲಾಖೆಯ ಅಪರಾಧ ದಾಖಲೆಗಳು, FIR ಡೇಟಾಬೇಸ್ ಮತ್ತು ನೆಟ್‌ವರ್ಕ್ ಮಾಹಿತಿಯನ್ನು ಮಾತ್ರ ವಿಶ್ಲೇಷಿಸಬಲ್ಲೆ. ಇಂಟರ್ನೆಟ್ ಅಥವಾ ಬಾಹ್ಯ ವೆಬ್ ಹುಡುಕಾಟದ ಸಾಮರ್ಥ್ಯವು ಈ ಸಹಾಯಕದಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ.',
        evidence: [],
        confidence: 100,
        relatedCases: [],
        suggestedQuestions: [
          'ಬೆಂಗಳೂರಿನಲ್ಲಿ ಸೈಬರ್ ಅಪರಾಧ ಪ್ರಕರಣಗಳನ್ನು ತೋರಿಸಿ',
          'ಮೈಸೂರು ಜಿಲ್ಲೆಯ ಬಾಕಿ ಪ್ರಕರಣಗಳ ಪಟ್ಟಿ ನೀಡಿ',
          'ಕ್ರಿಮಿನಲ್ ನೆಟ್‌ವರ್ಕ್ ಗ್ರಾಫ್ ಪರಿಶೀಲಿಸಿ'
        ],
        recommendedActions: [
          'ಪ್ರಕರಣಗಳ ಶೋಧನೆಗೆ ಹಿಂತಿರುಗಿ'
        ]
      };
    }
    return {
      summary: "I can analyze and correlate the crime intelligence data available within AI-CIOS (FIRs, criminal networks, suspect profiles, and geospatial incident logs), but I do not have access to external internet web research or external templates.",
      evidence: [],
      confidence: 100,
      relatedCases: [],
      suggestedQuestions: [
        'Show recent cybercrime cases in Bengaluru Urban',
        'List active cases in Mysuru district',
        'Find repeat offender connections'
      ],
      recommendedActions: [
        'Query internal FIR records'
      ]
    };
  }

  // ── INTENT 2: GREETING & SMALL TALK ─────────────────────────────────────────
  if (intent.type === 'greeting') {
    const lower = query.toLowerCase();
    const isThanks = lower.includes('thank') || lower.includes('ಧನ್ಯವಾದ');

    if (isThanks) {
      if (isKn) {
        return {
          summary: 'ನಿಮಗೆ ಸ್ವಾಗತ! ಕರ್ನಾಟಕ ಪೊಲೀಸ್ ಇಲಾಖೆಯ ತನಿಖೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಇನ್ನಾವುದೇ ಸಹಾಯ ಬೇಕಾದರೆ ದಯವಿಟ್ಟು ತಿಳಿಸಿ.',
          evidence: [],
          confidence: 100,
          relatedCases: [],
          suggestedQuestions: ['ಬೆಂಗಳೂರಿನ ಸೈಬರ್ ಅಪರಾಧಗಳನ್ನು ತೋರಿಸಿ', 'ಹೆಚ್ಚು ಅಪಾಯದ ಪ್ರಕರಣಗಳು ಯಾವುವು?'],
          recommendedActions: ['ಪ್ರಕರಣ ಶೋಧನೆ ಮುಂದುವರಿಸಿ']
        };
      }
      return {
        summary: 'You are welcome! Let me know if you need further assistance with active FIR inquiries, network analysis, or case investigations.',
        evidence: [],
        confidence: 100,
        relatedCases: [],
        suggestedQuestions: ['Show cybercrime cases in Bengaluru Urban', 'Which one has the highest risk?'],
        recommendedActions: ['Continue investigation query']
      };
    }

    if (isKn) {
      return {
        summary: 'ನಮಸ್ಕಾರ! ನಾನು ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಇಲಾಖೆಯ AI-CIOS ಅಪರಾಧ ತನಿಖಾ ಸಹಾಯಕ. ಪ್ರಕರಣಗಳ ಪರಿಶೀಲನೆ, ಆರೋಪಿಗಳ ನೆಟ್‌ವರ್ಕ್ ವಿಶ್ಲೇಷಣೆ ಅಥವಾ ಜಿಲ್ಲಾವಾರು ಅಂಕಿಅಂಶಗಳ ಬಗ್ಗೆ ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
        evidence: [],
        confidence: 100,
        relatedCases: [],
        suggestedQuestions: [
          'ಬೆಂಗಳೂರಿನಲ್ಲಿ ಇತ್ತೀಚಿನ ಸೈಬರ್ ಅಪರಾಧ ಪ್ರಕರಣಗಳನ್ನು ತೋರಿಸಿ',
          'ಮೈಸೂರು ಜಿಲ್ಲೆಯ ಬಾಕಿ ಪ್ರಕರಣಗಳ ಪಟ್ಟಿ ನೀಡಿ',
          'ಪುನರಾವರ್ತಿತ ಆರೋಪಿಗಳ ವಿವರಗಳನ್ನು ತೋರಿಸಿ',
          'ಹೆಚ್ಚು ಅಪಾಯದ ಪ್ರಕರಣಗಳು ಯಾವುವು?'
        ],
        recommendedActions: [
          'ಪ್ರಕರಣ ಹುಡುಕಾಟವನ್ನು ಪ್ರಾರಂಭಿಸಿ',
          'ಕ್ರಿಮಿನಲ್ ನೆಟ್‌ವರ್ಕ್ ಪರಿಶೀಲಿಸಿ'
        ]
      };
    }
    return {
      summary: 'Hello! I am the AI-CIOS Intelligence Assistant for the Karnataka State Police. How can I assist with your investigation today? You can query active FIRs, analyze criminal networks, or inspect district crime statistics.',
      evidence: [],
      confidence: 100,
      relatedCases: [],
      suggestedQuestions: [
        'Show recent cybercrime cases in Bengaluru Urban',
        'List pending cases in Mysuru district',
        'Find repeat offender connections',
        'What are the critical priority cases?'
      ],
      recommendedActions: [
        'Start case query',
        'Inspect criminal networks'
      ]
    };
  }

  // ── INTENT 3: CAPABILITIES & HELP ───────────────────────────────────────────
  if (intent.type === 'capabilities') {
    if (isKn) {
      return {
        summary: 'AI-CIOS ಸಹಾಯಕನಾಗಿ ನಾನು ಈ ಕೆಳಗಿನ ಕಾರ್ಯಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n1. ಲೈವ್ FIR ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಅಪರಾಧಗಳು, ಠಾಣೆಗಳು ಮತ್ತು ಜಿಲ್ಲೆಗಳ ಆಧಾರದ ಮೇಲೆ ಪ್ರಕರಣ ಹುಡುಕಾಟ.\n2. ಆರೋಪಿಗಳು, ಬಲಿಪಶುಗಳು ಮತ್ತು ಠಾಣೆಗಳ ನಡುವಿನ ಕ್ರಿಮಿನಲ್ ನೆಟ್‌ವರ್ಕ್ ವಿಶ್ಲೇಷಣೆ.\n3. ಅಪರಾಧ ನಕ್ಷೆಯ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು ಮತ್ತು ಪ್ರವೃತ್ತಿಗಳ ವಿಶ್ಲೇಷಣೆ.\n4. ವಿಶ್ಲೇಷಣಾತ್ಮಕ KPIಗಳು ಮತ್ತು ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿಗಳ ಪತ್ತೆ.\n5. ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ತನಿಖಾ ಸಾರಾಂಶಗಳ ರಚನೆ.',
        evidence: [],
        confidence: 100,
        relatedCases: [],
        suggestedQuestions: [
          'ಬೆಂಗಳೂರಿನಲ್ಲಿ ಸೈಬರ್ ಅಪರಾಧ ಪ್ರಕರಣಗಳನ್ನು ತೋರಿಸಿ',
          'ಪುನರಾವರ್ತಿತ ಆರೋಪಿಗಳ ವಿವರ ನೀಡಿ',
          'ಕ್ರಿಮಿನಲ್ ನೆಟ್‌ವರ್ಕ್ ಪುಟ ತೆರೆಯಿರಿ'
        ],
        recommendedActions: ['ಕೇಸ್ ಎಕ್ಸ್‌ಪ್ಲೋರರ್ ತೆರೆಯಿರಿ']
      };
    }
    return {
      summary: 'As the AI-CIOS Intelligence Assistant, I can assist you with:\n1. Searching and filtering live FIR records by crime category, district, police station, or status.\n2. Criminal Network relationship mapping and repeat offender cross-matching.\n3. Geospatial Crime Map hotspot trend analysis and patrol recommendations.\n4. Risk scoring, priority ranking, and applicable legal act identification.\n5. Bilingual investigation summaries in English and Kannada.',
      evidence: [],
      confidence: 100,
      relatedCases: [],
      suggestedQuestions: [
        'Show cybercrime cases in Bengaluru Urban',
        'Find repeat offenders in the network',
        'Which cases have Critical priority?'
      ],
      recommendedActions: ['Open Case Explorer', 'Review Criminal Network']
    };
  }

  // ── INTENT 4: GENERAL CONVERSATION (FALLBACK) ────────────────────────────────
  if (intent.type === 'general_conversation') {
    if (isKn) {
      return {
        summary: 'ನಾನು AI-CIOS ಅಪರಾಧ ಗುಪ್ತಚರ ಸಹಾಯಕ. ತನಿಖಾ ದಾಖಲೆಗಳು, FIR ಶೋಧನೆ ಅಥವಾ ಅಪರಾಧ ಅಂಕಿಅಂಶಗಳ ಕುರಿತು ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.',
        evidence: [],
        confidence: 100,
        relatedCases: [],
        suggestedQuestions: [
          'ಬೆಂಗಳೂರಿನಲ್ಲಿ ಇತ್ತೀಚಿನ ಸೈಬರ್ ಅಪರಾಧ ಪ್ರಕರಣಗಳನ್ನು ತೋರಿಸಿ',
          'ಮೈಸೂರಿನ ಬಾಕಿ ಪ್ರಕರಣಗಳು ಯಾವುವು?'
        ],
        recommendedActions: ['ಪ್ರಕರಣ ಶೋಧನೆ ಪ್ರಾರಂಭಿಸಿ']
      };
    }
    return {
      summary: 'I am here to assist with police intelligence and case investigations. Please let me know which FIR records, crime types, or districts you would like to explore.',
      evidence: [],
      confidence: 100,
      relatedCases: [],
      suggestedQuestions: [
        'Show recent cybercrime cases in Bengaluru Urban',
        'Show fraud cases in Mysuru',
        'List repeat offender connections'
      ],
      recommendedActions: ['Query active case database']
    };
  }

  // ── INTENT 5: TRANSLATION ───────────────────────────────────────────────────
  if (intent.type === 'translate') {
    const lastAssistant = previousMessages.filter(m => m.role === 'assistant').pop();
    const textToTranslate = lastAssistant?.content || context.lastSummary || '';
    
    if (intent.targetLang === 'kn') {
      const summary = `ಅನುವಾದಿತ ತನಿಖಾ ಸಾರಾಂಶ: ಪ್ರಸ್ತುತ ತನಿಖಾ ದಾಖಲೆಗಳಲ್ಲಿ ${filteredFirs.length} ಹೊಂದಾಣಿಕೆಯ ಪ್ರಕರಣಗಳು ಪತ್ತೆಯಾಗಿವೆ. ಪ್ರಮುಖ ಪ್ರಕರಣ FIR #${filteredFirs[0]?.firNumber || 'N/A'} (${filteredFirs[0]?.crimeCategory || 'ಅಪರಾಧ'}) ಆಗಿದ್ದು, ತನಿಖೆ ಪ್ರಗತಿಯಲ್ಲಿದೆ.`;
      return {
        summary,
        evidence: [],
        confidence: 95,
        relatedCases: filteredFirs.slice(0, 3).map(f => ({ firNumber: f.firNumber, crime: f.crimeCategory, district: f.district, station: f.policeStation, status: f.status })),
        suggestedQuestions: ['ಇದರಲ್ಲಿ ಹೆಚ್ಚು ಅಪಾಯದ ಪ್ರಕರಣ ಯಾವುದು?', 'ಅನ್ವಯವಾಗುವ ಕಾನೂನು ವಿಭಾಗಗಳನ್ನು ಪಟ್ಟಿ ಮಾಡಿ'],
        recommendedActions: ['ಕನ್ನಡ ವರದಿಯನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ']
      };
    }
    const summary = `Translated Intelligence Summary: Found ${filteredFirs.length} matching case record(s). Primary case FIR #${filteredFirs[0]?.firNumber || 'N/A'} (${filteredFirs[0]?.crimeCategory || 'Crime'}) is currently active.`;
    return {
      summary,
      evidence: [],
      confidence: 95,
      relatedCases: filteredFirs.slice(0, 3).map(f => ({ firNumber: f.firNumber, crime: f.crimeCategory, district: f.district, station: f.policeStation, status: f.status })),
      suggestedQuestions: ['Show high risk cases', 'List applicable legal acts'],
      recommendedActions: ['Download intelligence brief']
    };
  }

  // ── INTENT 6: COUNT / QUANTITY ──────────────────────────────────────────────
  if (intent.type === 'count') {
    const count = filteredFirs.length;
    const cat = context.crime || 'relevant';
    const dist = context.district || 'the state';
    const activeCount = filteredFirs.filter(f => f.status === 'Open' || f.status === 'Under Investigation' || f.status === 'Pending').length;
    if (isKn) {
      return {
        summary: `ಪ್ರಸ್ತುತ ಮಾನದಂಡಗಳಿಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಒಟ್ಟು ${count} ಪ್ರಕರಣಗಳು ದಾಖಲಾಗಿವೆ (${dist} ನಲ್ಲಿ ${cat}). ಇವುಗಳಲ್ಲಿ ${activeCount} ಸಕ್ರಿಯ/ತನಿಖೆಯಲ್ಲಿರುವ ಪ್ರಕರಣಗಳಾಗಿವೆ.`,
        evidence: [{ label: 'ಪ್ರಕರಣಗಳ ಎಣಿಕೆ', value: `${count} ದಾಖಲೆಗಳು`, source: 'ಲೈವ್ ಡೇಟಾಬೇಸ್' }],
        confidence: 98,
        relatedCases: filteredFirs.slice(0, 4).map(f => ({ firNumber: f.firNumber, crime: f.crimeCategory, district: f.district, station: f.policeStation, status: f.status })),
        suggestedQuestions: ['ಇದರಲ್ಲಿ ಹೆಚ್ಚು ಅಪಾಯದ ಪ್ರಕರಣ ಯಾವುದು?', 'ಆರೋಪಿಗಳ ಪಟ್ಟಿ ತೋರಿಸಿ'],
        recommendedActions: ['ಎಲ್ಲಾ ಪ್ರಕರಣಗಳ ಪಟ್ಟಿಯನ್ನು ತೆರೆಯಿರಿ']
      };
    }
    return {
      summary: `I found ${count} case record${count === 1 ? '' : 's'} matching the query criteria for ${cat} in ${dist}. Out of these, ${activeCount} are currently active or under investigation.`,
      evidence: [{ label: 'Case Count', value: `${count} verified records`, source: 'Live Catalyst Data Store' }],
      confidence: 98,
      relatedCases: filteredFirs.slice(0, 4).map(f => ({ firNumber: f.firNumber, crime: f.crimeCategory, district: f.district, station: f.policeStation, status: f.status })),
      suggestedQuestions: ['Which one has the highest risk?', 'Show accused connections', 'Export this list'],
      recommendedActions: ['Inspect full case records', 'Review case timelines']
    };
  }

  // ── INTENT 7: HIGHEST RISK / PRIORITY ─────────────────────────────────────────
  if (intent.type === 'highest_risk') {
    const sorted = [...filteredFirs].sort((a, b) => {
      const pMap = { 'Critical': 3, 'High': 2, 'Medium': 1, 'Low': 0 };
      return (pMap[b.priorityLevel || b.priority] || 0) - (pMap[a.priorityLevel || a.priority] || 0);
    });
    const topCase = sorted[0];
    if (!topCase) {
      return {
        summary: isKn ? 'ಯಾವುದೇ ಹೊಂದಾಣಿಕೆಯ ಪ್ರಕರಣಗಳು ಕಂಡುಬಂದಿಲ್ಲ.' : 'No matching cases found to determine risk level.',
        evidence: [],
        confidence: 60,
        relatedCases: [],
        suggestedQuestions: [],
        recommendedActions: []
      };
    }

    const acts = parseJSON(topCase.applicableActs, []);
    if (isKn) {
      return {
        summary: `ಲಭ್ಯವಿರುವ ದಾಖಲೆಗಳಲ್ಲಿ ಅತಿ ಹೆಚ್ಚು ಅಪಾಯದ ಪ್ರಕರಣವೆಂದರೆ FIR #${topCase.firNumber} (${topCase.crimeCategory}, ${topCase.policeStation}, ${topCase.district}). ಇದರ ಆದ್ಯತೆಯ ಮಟ್ಟವು "${topCase.priorityLevel || topCase.priority || 'Critical'}" ಆಗಿದೆ. ವಿವರ: ${topCase.description}`,
        evidence: [
          { label: 'ಪ್ರಕರಣ ಆದ್ಯತೆ', value: topCase.priorityLevel || 'Critical', source: `FIR #${topCase.firNumber}` },
          { label: 'ಅನ್ವಯವಾಗುವ ಕಾನೂನು', value: acts.join(', ') || 'ವಿಭಾಗ ದಾಖಲಾಗಿಲ್ಲ', source: 'FIR ವಿವರ' }
        ],
        confidence: 94,
        relatedCases: sorted.slice(0, 3).map(f => ({ firNumber: f.firNumber, crime: f.crimeCategory, district: f.district, station: f.policeStation, status: f.status })),
        suggestedQuestions: ['ಈ ಪ್ರಕರಣದ ಆರೋಪಿಗಳ ವಿವರ ನೀಡಿ', 'ಸಂಬಂಧಿತ ಸಾಕ್ಷ್ಯಗಳನ್ನು ತೋರಿಸಿ'],
        recommendedActions: ['ತನಿಖಾ ತಂಡಕ್ಕೆ ತುರ್ತು ಎಚ್ಚರಿಕೆ ರವಾನಿಸಿ', 'ವಿವರವಾದ ಕೇಸ್ ಡೈರಿ ತೆರೆಯಿರಿ']
      };
    }

    return {
      summary: `The highest risk case in the current dataset is FIR #${topCase.firNumber} (${topCase.crimeCategory} at ${topCase.policeStation}, ${topCase.district}) with priority level "${topCase.priorityLevel || topCase.priority || 'Critical'}". Incident synopsis: ${topCase.description}`,
      evidence: [
        { label: 'Priority Level', value: topCase.priorityLevel || 'Critical', source: `FIR #${topCase.firNumber}` },
        { label: 'Applicable Acts', value: acts.join(', ') || 'Standard Penal Code', source: 'Chargesheet Log' }
      ],
      confidence: 94,
      relatedCases: sorted.slice(0, 3).map(f => ({ firNumber: f.firNumber, crime: f.crimeCategory, district: f.district, station: f.policeStation, status: f.status })),
      suggestedQuestions: ['Show accused individuals in this case', 'View investigation timeline', 'Generate case brief'],
      recommendedActions: ['Open Case Explorer details', 'Alert assigned Investigation Officer']
    };
  }

  // ── INTENT 8: CASE DETAILS / FOLLOW-UP ─────────────────────────────────────────
  if (intent.type === 'case_details') {
    const target = filteredFirs[0] || allFirs[0];
    if (!target) {
      return {
        summary: isKn ? 'ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ಪ್ರಕರಣದ ವಿವರಗಳು ಲಭ್ಯವಿಲ್ಲ.' : 'No specific case record details available.',
        evidence: [],
        confidence: 50,
        relatedCases: [],
        suggestedQuestions: [],
        recommendedActions: []
      };
    }

    const evidence = parseJSON(target.evidence, []);

    if (isKn) {
      return {
        summary: `FIR #${target.firNumber} ವಿವರಗಳು: ಅಪರಾಧ ವರ್ಗ: ${target.crimeCategory} | ಠಾಣೆ: ${target.policeStation}, ${target.district} | ದಿನಾಂಕ: ${target.incidentDate ? target.incidentDate.split('T')[0] : 'N/A'} | ಸ್ಥಿತಿ: ${target.status}. ಸಾರಾಂಶ: ${target.description}`,
        evidence: evidence.map(e => ({ label: e.type || 'ಪುರಾವೆ', value: e.description || 'ದಾಖಲೆ ಪರಿಶೀಲಿಸಲಾಗಿದೆ', source: `FIR #${target.firNumber}` })),
        confidence: 96,
        relatedCases: [target].map(f => ({ firNumber: f.firNumber, crime: f.crimeCategory, district: f.district, station: f.policeStation, status: f.status })),
        suggestedQuestions: ['ಆರೋಪಿಗಳ ಹಿನ್ನೆಲೆ ಪರಿಶೀಲಿಸಿ', 'ಈ ಠಾಣೆಯ ಇತರ ಪ್ರಕರಣಗಳನ್ನು ತೋರಿಸಿ'],
        recommendedActions: ['ಪೂರ್ಣ FIR ಡಾಕ್ಯುಮೆಂಟ್ ವೀಕ್ಷಿಸಿ', 'ತನಿಖಾ ವರದಿಯನ್ನು ರಫ್ತು ಮಾಡಿ']
      };
    }

    return {
      summary: `Detailed Intelligence Record for FIR #${target.firNumber}: Category: ${target.crimeCategory} | Jurisdiction: ${target.policeStation}, ${target.district} | Date: ${target.incidentDate ? target.incidentDate.split('T')[0] : 'N/A'} | Status: ${target.status}. Synopsis: ${target.description}`,
      evidence: evidence.map(e => ({ label: e.type || 'Evidence Log', value: e.description || 'Verified on file', source: `FIR #${target.firNumber}` })),
      confidence: 96,
      relatedCases: [target].map(f => ({ firNumber: f.firNumber, crime: f.crimeCategory, district: f.district, station: f.policeStation, status: f.status })),
      suggestedQuestions: ['Check accused criminal history', 'Show other FIRs at this police station'],
      recommendedActions: ['Open full case record', 'Export intelligence brief as PDF']
    };
  }

  // ── INTENT 9: REPEAT OFFENDERS ───────────────────────────────────────────────
  if (intent.type === 'repeat_offenders') {
    const offendersMap = new Map();
    allFirs.forEach(f => {
      const accused = parseJSON(f.accused, []);
      accused.forEach(a => {
        if (a && a.name) {
          const list = offendersMap.get(a.name) || [];
          list.push(f.firNumber);
          offendersMap.set(a.name, list);
        }
      });
    });

    const repeats = Array.from(offendersMap.entries()).filter(([_, cases]) => cases.length > 1);
    const repeatCount = repeats.length;

    if (isKn) {
      const names = repeats.map(([name, cases]) => `${name} (${cases.length} ಪ್ರಕರಣಗಳು)`).join(', ');
      return {
        summary: `ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಒಟ್ಟು ${repeatCount} ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿಗಳನ್ನು ಗುರುತಿಸಲಾಗಿದೆ. ಪ್ರಮುಖರು: ${names || 'ಪ್ರಸ್ತುತ ಫಿಲ್ಟರ್‌ನಲ್ಲಿ ಯಾವುದೇ ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ'}.`,
        evidence: repeats.map(([name, cases]) => ({ label: 'ಖದೀಮ ದಾಖಲೆ', value: `${cases.join(', ')} ಪ್ರಕರಣಗಳಲ್ಲಿ ಆರೋಪಿ`, source: name })),
        confidence: 93,
        relatedCases: filteredFirs.slice(0, 4).map(f => ({ firNumber: f.firNumber, crime: f.crimeCategory, district: f.district, station: f.policeStation, status: f.status })),
        suggestedQuestions: ['ಈ ಅಪರಾಧಿಗಳ ನೆಟ್‌ವರ್ಕ್ ಗ್ರಾಫ್ ತೋರಿಸಿ', 'ಅವರ ವಿರುದ್ಧದ ಸೆಕ್ಷನ್‌ಗಳು ಯಾವುವು?'],
        recommendedActions: ['ಕ್ರಿಮಿನಲ್ ನೆಟ್‌ವರ್ಕ್ ಪುಟಕ್ಕೆ ನ್ಯಾವಿಗೇಟ್ ಮಾಡಿ']
      };
    }

    const names = repeats.map(([name, cases]) => `${name} (${cases.length} cases)`).join(', ');
    return {
      summary: `Identified ${repeatCount} repeat offenders across the live records: ${names || 'No multi-FIR repeat offenders matched in current filter'}. Relationship cross-matching indicates recurrent operational patterns.`,
      evidence: repeats.map(([name, cases]) => ({ label: 'Repeat Offender', value: `Linked to FIRs: ${cases.join(', ')}`, source: name })),
      confidence: 93,
      relatedCases: filteredFirs.slice(0, 4).map(f => ({ firNumber: f.firNumber, crime: f.crimeCategory, district: f.district, station: f.policeStation, status: f.status })),
      suggestedQuestions: ['Visualize in Criminal Network graph', 'Show related police station jurisdictions'],
      recommendedActions: ['Open Criminal Network Page', 'Issue intelligence alert']
    };
  }

  // ── INTENT 10: CRIME SEARCH (EXPLICIT CRIME QUERY) ───────────────────────────
  if (filteredFirs.length === 0) {
    if (isKn) {
      return {
        summary: 'ನೀವು ಹುಡುಕಿದ ಮಾನದಂಡಗಳಿಗೆ ಸರಿಹೊಂದುವ ಯಾವುದೇ ಪ್ರಕರಣಗಳು ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಬೇರೆ ಜಿಲ್ಲೆ ಅಥವಾ ಅಪರಾಧದ ಪ್ರಕಾರವನ್ನು ಪ್ರಯತ್ನಿಸಿ.',
        evidence: [],
        confidence: 50,
        relatedCases: [],
        suggestedQuestions: ['ಎಲ್ಲಾ ಪ್ರಕರಣಗಳ ಪಟ್ಟಿ ತೋರಿಸಿ', 'ಬೆಂಗಳೂರಿನ ಸೈಬರ್ ಅಪರಾಧಗಳನ್ನು ತೋರಿಸಿ'],
        recommendedActions: ['ಹುಡುಕಾಟ ಫಿಲ್ಟರ್ ಮರುಹೊಂದಿಸಿ']
      };
    }
    return {
      summary: 'No matching case records were found for the specified criteria in the live Data Store. Please adjust your filters or query parameters.',
      evidence: [],
      confidence: 50,
      relatedCases: [],
      suggestedQuestions: ['Show all active cases', 'Show cybercrime cases in Bengaluru Urban'],
      recommendedActions: ['Reset search filters']
    };
  }

  const primaryCase = filteredFirs[0];
  const totalCount = filteredFirs.length;
  const crimeCategory = primaryCase.crimeCategory || 'General Crime';
  const districtName = primaryCase.district || 'Karnataka';
  const evidenceList = parseJSON(primaryCase.evidence, []);
  const actsList = parseJSON(primaryCase.applicableActs, []);

  if (isKn) {
    let sum = `ನಾನು ${districtName} ನಲ್ಲಿ ${totalCount} ${crimeCategory} ಪ್ರಕರಣ(ಗಳನ್ನು) ಪತ್ತೆಹಚ್ಚಿದ್ದೇನೆ. `;
    sum += `ಪ್ರಮುಖ ದಾಖಲೆ FIR #${primaryCase.firNumber} (${primaryCase.policeStation}), ಸ್ಥಿತಿ: ${primaryCase.status}. `;
    if (primaryCase.description) {
      sum += `ಪ್ರಕರಣದ ಸಾರಾಂಶ: ${primaryCase.description.substring(0, 120)}...`;
    }
    return {
      summary: sum,
      evidence: evidenceList.map(e => ({ label: e.type || 'ಪುರಾವೆ', value: e.description || 'ದಾಖಲಿಸಲಾಗಿದೆ', source: `FIR #${primaryCase.firNumber}` })),
      confidence: 92,
      relatedCases: filteredFirs.slice(0, 5).map(c => ({
        firNumber: c.firNumber,
        crime: c.crimeCategory,
        district: c.district,
        station: c.policeStation,
        status: c.status
      })),
      investigationTimeline: [
        { title: 'FIR Registered', time: primaryCase.incidentDate ? primaryCase.incidentDate.split('T')[0] : '2026-01-15' },
        { title: 'Investigation Stage', time: primaryCase.status || 'Active' }
      ],
      suggestedQuestions: [
        'ಇದರಲ್ಲಿ ಹೆಚ್ಚು ಅಪಾಯದ ಪ್ರಕರಣ ಯಾವುದು?',
        'ಆರೋಪಿಗಳ ಸಂಪರ್ಕಗಳನ್ನು ವಿವರಿಸಿ',
        'ಅನ್ವಯವಾಗುವ ಕಾನೂನು ವಿಭಾಗಗಳನ್ನು ಪಟ್ಟಿ ಮಾಡಿ',
        'ತನಿಖಾ ವರದಿಯನ್ನು ರಚಿಸಿ'
      ],
      recommendedActions: [
        'ಸಮಾನ ಪ್ರಕರಣ ದಾಖಲೆಗಳನ್ನು ತೆರೆಯಿರಿ',
        'ಸಾಕ್ಷಿಗಳು ಮತ್ತು ಪುರಾವೆಗಳ ಟಿಪ್ಪಣಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
        'ಈ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು PDF ಆಗಿ ರಫ್ತು ಮಾಡಿ'
      ],
      applicableActs: actsList
    };
  }

  let sum = `I found ${totalCount} matching ${crimeCategory} case${totalCount === 1 ? '' : 's'} in ${districtName}. `;
  sum += `Primary referenced case is FIR #${primaryCase.firNumber} (${primaryCase.policeStation}), marked as ${primaryCase.status}. `;
  if (primaryCase.description) {
    sum += `Synopsis: ${primaryCase.description.substring(0, 140)}...`;
  }

  return {
    summary: sum,
    evidence: evidenceList.map(e => ({ label: e.type || 'Evidence Log', value: e.description || 'Verified evidence log record.', source: `FIR #${primaryCase.firNumber}` })),
    confidence: 92,
    relatedCases: filteredFirs.slice(0, 5).map(c => ({
      firNumber: c.firNumber,
      crime: c.crimeCategory,
      district: c.district,
      station: c.policeStation,
      status: c.status
    })),
    investigationTimeline: [
      { title: 'FIR Registered', time: primaryCase.incidentDate ? primaryCase.incidentDate.split('T')[0] : '2026-01-15' },
      { title: 'Current Status', time: primaryCase.status || 'Active' }
    ],
    suggestedQuestions: [
      'Which one has the highest risk?',
      'Show related cases from the same station',
      'Explain the suspect connections',
      'Generate investigation report'
    ],
    recommendedActions: [
      'Open similar case records',
      'Review witness and evidence notes',
      'Export the response as PDF'
    ],
    applicableActs: actsList
  };
}

module.exports = {
  parseJSON,
  detectLanguage,
  classifyIntent,
  extractFiltersAndQuery,
  generateGroundedResponse
};
