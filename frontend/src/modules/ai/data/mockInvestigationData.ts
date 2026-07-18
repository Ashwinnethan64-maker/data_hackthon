import type { AiConversationThread, AiMockCase, AiResponse } from '../types';

// ---------------------------------------------------------------------------
// Conversation threads — derived from real FIR data (firs.json)
// ---------------------------------------------------------------------------

export const conversationThreads: AiConversationThread[] = [
  {
    id: 'thread-cybercrime-bengaluru',
    title: 'Bengaluru Urban cybercrime cluster',
    lastQuery: 'Show cybercrime and fraud cases in Bengaluru Urban',
    updatedAt: '3 min ago',
    pinned: true,
    saved: true,
  },
  {
    id: 'thread-mysuru-sweep',
    title: 'Mysuru district activity sweep',
    lastQuery: 'Summarise all open cases in Mysuru district',
    updatedAt: '21 min ago',
    pinned: true,
  },
  {
    id: 'thread-priority-alerts',
    title: 'Drug & extortion priority alerts',
    lastQuery: 'Show critical and high-priority FIRs pending arrest',
    updatedAt: '1 hr ago',
  },
];

// ---------------------------------------------------------------------------
// AI mock responses — evidence, timelines and acts reference real FIR data
// ---------------------------------------------------------------------------

export const mockResponses: Record<string, AiResponse> = {
  // Thread 1 — FIR 100011003202400001 (Whitefield cybercrime) +
  //            FIR 100011002202500001 (Indiranagar fraud)
  'thread-cybercrime-bengaluru': {
    summary:
      'Found 2 matching records in Bengaluru Urban. FIR 100011003202400001 (Whitefield PS) involves identity theft via a cloned banking portal — phishing email headers and server traffic logs have been secured. FIR 100011002202500001 (Indiranagar PS) is a closed investment-scheme fraud with a chargesheet already filed. Cross-referencing suggests a shared digital modus operandi.',
    evidence: [
      {
        label: 'Phishing email headers',
        value: 'Source headers trace back to a rented offshore server active across both incidents',
        source: 'FIR 100011003202400001 · Digital Log',
      },
      {
        label: 'Server traffic logs',
        value: 'Unauthorised portal login attempts correlated with victim Rohit Menon\'s account',
        source: 'Whitefield PS · IT Section 66C evidence log',
      },
      {
        label: 'Bank transaction record',
        value: 'Fraudulent transfer trail documented in financial statement for victim Fathima Beevi',
        source: 'FIR 100011002202500001 · Indiranagar PS',
      },
    ],
    confidence: 0.91,
    relatedCases: [
      {
        firNumber: '100011003202400001',
        crime: 'Cybercrime',
        district: 'Bengaluru Urban',
        station: 'Whitefield PS',
        status: 'Under Investigation',
      },
      {
        firNumber: '100011002202500001',
        crime: 'Fraud',
        district: 'Bengaluru Urban',
        station: 'Indiranagar PS',
        status: 'Closed',
      },
    ],
    investigationTimeline: [
      { title: 'FIR Registered (Whitefield)', time: '2024-06-14 10:15', status: 'completed' },
      { title: 'Digital evidence secured', time: '2024-06-14 14:00', status: 'completed' },
      { title: 'FIR Registered (Indiranagar)', time: '2025-11-06 14:30', status: 'completed' },
      { title: 'Arrest made — Ramesh Chandran', time: '2025-11-20 12:00', status: 'completed' },
      { title: 'Chargesheet filed (Indiranagar)', time: '2025-12-28 16:00', status: 'completed' },
      { title: 'Suspect identification (Whitefield)', time: 'Pending', status: 'pending' },
    ],
    suggestedQuestions: [
      'Are there other phishing complaints from Whitefield PS in 2024?',
      'Can the Indiranagar fraud suspect be linked to the Whitefield portal clone?',
    ],
    recommendedActions: [
      'Request ISP for subscriber details of the offshore server IP',
      'Initiate joint investigation between Whitefield and Indiranagar PS',
    ],
    applicableActs: ['IT Section 66D', 'IT Section 66C', 'IPC Section 420'],
  },

  // Thread 2 — FIR 100033001202600001 (Vijayanagara cybercrime) +
  //            FIR 100033001202600002 (Vijayanagara burglary)
  'thread-mysuru-sweep': {
    summary:
      'Mysuru district shows 2 active open cases, both registered at Vijayanagara PS. FIR 100033001202600001 involves unauthorised corporate account access — IP login histories confirm intrusion. FIR 100033001202600002 is a night-time residential burglary with latent fingerprints lifted from the broken window frame. No arrests made in either case.',
    evidence: [
      {
        label: 'IP access log',
        value: 'Unauthorized login histories from external IP show entry into corporate accounts of victim Deepa Kulkarni',
        source: 'FIR 100033001202600001 · Access Log',
      },
      {
        label: 'Latent fingerprints',
        value: 'Prints lifted from broken window frame at victim Pooja Rao\'s residence — pending AFIS match',
        source: 'FIR 100033001202600002 · Forensic Unit, Vijayanagara PS',
      },
    ],
    confidence: 0.84,
    relatedCases: [
      {
        firNumber: '100033001202600001',
        crime: 'Cybercrime',
        district: 'Mysuru',
        station: 'Vijayanagara PS',
        status: 'Open',
      },
      {
        firNumber: '100033001202600002',
        crime: 'Burglary',
        district: 'Mysuru',
        station: 'Vijayanagara PS',
        status: 'Open',
      },
    ],
    investigationTimeline: [
      { title: 'FIR Registered (cybercrime)', time: '2026-03-03 16:00', status: 'completed' },
      { title: 'IP log secured', time: '2026-03-04 10:00', status: 'completed' },
      { title: 'FIR Registered (burglary)', time: '2026-02-05 09:00', status: 'completed' },
      { title: 'Fingerprints lifted', time: '2026-02-05 11:30', status: 'completed' },
      { title: 'AFIS match — fingerprints', time: 'Pending', status: 'pending' },
      { title: 'Suspect identification (cybercrime)', time: 'Pending', status: 'pending' },
    ],
    suggestedQuestions: [
      'Have any other corporate entities in Mysuru reported similar access breaches?',
      'Do the burglary fingerprints match any prior offender in AFIS?',
    ],
    recommendedActions: [
      'Submit fingerprints to AFIS for expedited matching',
      'Request CERT-In advisory for corporate account intrusion pattern',
    ],
    applicableActs: ['IT Section 66D', 'IPC Section 379'],
  },

  // Thread 3 — FIR 100011001202600001 (Malleshwaram drug trafficking) +
  //            FIR 800011004202400001 (Jayanagar extortion)
  'thread-priority-alerts': {
    summary:
      'Two high-priority FIRs requiring urgent attention. FIR 100011001202600001 (Malleshwaram PS, Critical) — drug trafficking: suspect Naveen Kumar arrested after contraband seizure at checkpoint; case under active investigation. FIR 800011004202400001 (Jayanagar PS, High) — blackmail and extortion against victim Manjunath Gowda; accused Faiz Ahmed identified via voice call records but arrest is pending.',
    evidence: [
      {
        label: 'Contraband seizure',
        value: 'Narcotic substance seized during vehicle inspection at Malleshwaram checkpoint — NDPS Section 21 invoked',
        source: 'FIR 100011001202600001 · Malleshwaram PS evidence log',
      },
      {
        label: 'Audio recording',
        value: 'Voice call records contain explicit threat details linking accused Faiz Ahmed to extortion demand',
        source: 'FIR 800011004202400001 · Jayanagar PS',
      },
    ],
    confidence: 0.95,
    relatedCases: [
      {
        firNumber: '100011001202600001',
        crime: 'Drug Trafficking',
        district: 'Bengaluru Urban',
        station: 'Malleshwaram PS',
        status: 'Under Investigation',
      },
      {
        firNumber: '800011004202400001',
        crime: 'Extortion',
        district: 'Bengaluru Urban',
        station: 'Jayanagar PS',
        status: 'Open',
      },
    ],
    investigationTimeline: [
      { title: 'FIR Registered (drug trafficking)', time: '2026-01-15 08:30', status: 'completed' },
      { title: 'Suspect Naveen Kumar arrested', time: '2026-01-15 10:00', status: 'completed' },
      { title: 'FIR Registered (extortion)', time: '2024-06-18 15:20', status: 'completed' },
      { title: 'Voice records secured', time: '2024-06-20 09:00', status: 'completed' },
      { title: 'Arrest of Faiz Ahmed', time: 'Pending', status: 'pending' },
    ],
    suggestedQuestions: [
      'Is Naveen Kumar linked to any prior NDPS cases in Karnataka?',
      'Have Faiz Ahmed\'s call records been subpoenaed from the telecom provider?',
    ],
    recommendedActions: [
      'Escalate extortion arrest warrant to senior officer M. S. Rao (Jayanagar PS)',
      'Run NDPS offender history check on Naveen Kumar via CCTNS',
    ],
    applicableActs: ['NDPS Section 21', 'IPC Section 384'],
  },
};

// ---------------------------------------------------------------------------
// Detailed case data — sourced directly from firs.json records
// ---------------------------------------------------------------------------

export const mockCases: AiMockCase[] = [
  {
    // FIR 100011003202400001 — Whitefield PS cybercrime
    firNumber: '100011003202400001',
    crime: 'Cybercrime',
    district: 'Bengaluru Urban',
    station: 'Whitefield PS',
    status: 'Under Investigation',
    suspect: 'Unidentified (online)',
    victim: 'Rohit Menon',
    acts: ['IT Section 66D', 'IT Section 66C'],
    timeline: [
      { title: 'FIR Registered', time: '2024-06-14 10:15', status: 'completed' },
      { title: 'Digital evidence secured', time: '2024-06-14 14:00', status: 'current' },
      { title: 'Suspect identification', time: 'Pending', status: 'pending' },
    ],
    evidence: [
      {
        label: 'Phishing email headers',
        value: 'Source headers trace back to an offshore server',
        source: 'Digital Log · Whitefield PS',
      },
      {
        label: 'Server traffic logs',
        value: 'Cloned banking portal login attempts recorded against victim account',
        source: 'IT Section 66C evidence log',
      },
    ],
  },
  {
    // FIR 100033001202600002 — Vijayanagara PS burglary
    firNumber: '100033001202600002',
    crime: 'Burglary',
    district: 'Mysuru',
    station: 'Vijayanagara PS',
    status: 'Open',
    suspect: 'Unidentified',
    victim: 'Pooja Rao',
    acts: ['IPC Section 379'],
    timeline: [
      { title: 'FIR Registered', time: '2026-02-05 09:00', status: 'completed' },
      { title: 'Fingerprints lifted', time: '2026-02-05 11:30', status: 'current' },
      { title: 'AFIS match', time: 'Pending', status: 'pending' },
    ],
    evidence: [
      {
        label: 'Latent fingerprints',
        value: 'Prints lifted from broken window frame at victim\'s residence',
        source: 'Forensic Unit · Vijayanagara PS',
      },
    ],
  },
  {
    // FIR 800011004202400001 — Jayanagar PS extortion
    firNumber: '800011004202400001',
    crime: 'Extortion',
    district: 'Bengaluru Urban',
    station: 'Jayanagar PS',
    status: 'Open',
    suspect: 'Faiz Ahmed',
    victim: 'Manjunath Gowda',
    acts: ['IPC Section 384'],
    timeline: [
      { title: 'FIR Registered', time: '2024-06-18 15:20', status: 'completed' },
      { title: 'Voice records secured', time: '2024-06-20 09:00', status: 'current' },
      { title: 'Arrest of Faiz Ahmed', time: 'Pending', status: 'pending' },
    ],
    evidence: [
      {
        label: 'Audio recording',
        value: 'Voice call records contain explicit threat details from accused',
        source: 'Call record log · Jayanagar PS',
      },
    ],
  },
];
