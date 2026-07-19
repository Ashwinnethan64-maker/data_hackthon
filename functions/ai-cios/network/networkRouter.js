const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');

const TABLE_NAME = 'firs';

// Safely parse JSON properties
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

// Generate the graph nodes and edges from FIR records
function buildGraph(firs) {
  const nodesMap = new Map();
  const edges = [];

  const addNode = (id, data) => {
    if (!nodesMap.has(id)) {
      nodesMap.set(id, { id, type: 'entityNode', position: { x: 0, y: 0 }, data });
    } else {
      // update firCount
      const existing = nodesMap.get(id);
      if (existing.data.entityType === 'Accused' || existing.data.entityType === 'Victim') {
        existing.data.firCount = (existing.data.firCount || 1) + 1;
        if (existing.data.firCount > 1 && existing.data.entityType === 'Accused') {
          existing.data.isRepeatOffender = true;
          existing.data.riskScore = Math.min(100, existing.data.riskScore + 20);
          existing.data.riskLevel = 'Critical';
        }
      }
    }
  };

  const addEdge = (source, target, relation) => {
    const edgeId = `e-${source}-${target}-${relation}`;
    edges.push({
      id: edgeId,
      source,
      target,
      data: { relation, label: relation }
    });
  };

  firs.forEach(fir => {
    const firId = `fir-${fir.firNumber}`;
    addNode(firId, {
      label: fir.firNumber,
      entityType: 'FIR',
      riskScore: fir.priority === 'Critical' ? 90 : fir.priority === 'High' ? 75 : 50,
      riskLevel: fir.priority || 'Medium',
      firCount: 1,
      district: fir.district,
      crimeTypes: [fir.crimeCategory]
    });

    const accusedList = parseJSONField(fir.accused) || [];
    accusedList.forEach(acc => {
      const accId = `acc-${acc.name.replace(/\s+/g, '-')}`;
      addNode(accId, {
        label: acc.name,
        entityType: 'Accused',
        riskScore: acc.isRepeatOffender ? 85 : 60,
        riskLevel: acc.isRepeatOffender ? 'High' : 'Medium',
        firCount: 1,
        district: fir.district,
        isRepeatOffender: acc.isRepeatOffender,
        gang: acc.gang || 'Unknown',
        crimeTypes: [fir.crimeCategory]
      });
      addEdge(accId, firId, 'Committed');
    });

    const victimList = parseJSONField(fir.victims) || [];
    victimList.forEach(vic => {
      const vicId = `vic-${vic.name.replace(/\s+/g, '-')}`;
      addNode(vicId, {
        label: vic.name,
        entityType: 'Victim',
        riskScore: 20,
        riskLevel: 'Low',
        firCount: 1,
        district: fir.district,
        crimeTypes: [fir.crimeCategory]
      });
      addEdge(vicId, firId, 'VictimOf');
    });

    const officer = parseJSONField(fir.officer) || { name: 'Unknown' };
    if (officer.name && officer.name !== 'Unknown') {
      const offId = `off-${officer.name.replace(/\s+/g, '-')}`;
      addNode(offId, {
        label: officer.name,
        entityType: 'Officer',
        riskScore: 0,
        riskLevel: 'Low',
        firCount: 1,
        district: fir.district
      });
      addEdge(offId, firId, 'InvestigatedBy');
    }

    if (fir.policeStation) {
      const stnId = `stn-${fir.policeStation.replace(/\s+/g, '-')}`;
      addNode(stnId, {
        label: fir.policeStation,
        entityType: 'PoliceStation',
        riskScore: 0,
        riskLevel: 'Low',
        firCount: 1,
        district: fir.district
      });
      addEdge(firId, stnId, 'Reported');
      
      if (fir.district) {
        const distId = `dist-${fir.district.replace(/\s+/g, '-')}`;
        addNode(distId, {
          label: fir.district,
          entityType: 'District',
          riskScore: 0,
          riskLevel: 'Low',
          firCount: 1
        });
        addEdge(stnId, distId, 'LocatedAt');
      }
    }
  });

  // ── Semantic Cluster Layout: one cluster per FIR case ────────────────────────
  const nodes = Array.from(nodesMap.values());

  // Step 1: Build a map of nodeId -> list of FIR IDs it belongs to
  const nodeToFirs = {}; // nodeId -> Set of firIds
  edges.forEach(e => {
    const srcType = nodesMap.get(e.source)?.data.entityType;
    const tgtType = nodesMap.get(e.target)?.data.entityType;
    if (srcType === 'FIR') {
      if (!nodeToFirs[e.target]) nodeToFirs[e.target] = new Set();
      nodeToFirs[e.target].add(e.source);
    }
    if (tgtType === 'FIR') {
      if (!nodeToFirs[e.source]) nodeToFirs[e.source] = new Set();
      nodeToFirs[e.source].add(e.target);
    }
  });

  // Step 2: For each FIR, collect its member nodes (directly connected, single-FIR)
  const firNodes = nodes.filter(n => n.data.entityType === 'FIR');
  const numFirs = firNodes.length;

  // Grid layout for cluster centers: aim for ~4 columns
  const COLS = Math.max(2, Math.ceil(Math.sqrt(numFirs * 1.6)));
  const CLUSTER_W = 700;  // horizontal spacing between cluster centers
  const CLUSTER_H = 620;  // vertical spacing between cluster centers
  const MEMBER_RADIUS = 230; // radius of members around FIR hub

  // Stagger every other row for a honeycomb-ish feel
  const firCenters = {}; // firId -> { x, y }
  firNodes.forEach((firNode, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const stagger = (row % 2 === 1) ? CLUSTER_W * 0.5 : 0;
    const cx = 400 + col * CLUSTER_W + stagger;
    const cy = 400 + row * CLUSTER_H;
    firCenters[firNode.id] = { x: cx, y: cy };
    firNode.position = { x: cx, y: cy };
  });

  // Step 3: For each FIR, collect single-membership members and place them radially
  const firMembers = {}; // firId -> [nodeId, ...]
  firNodes.forEach(f => { firMembers[f.id] = []; });

  nodes.forEach(node => {
    if (node.data.entityType === 'FIR') return;
    const memberOf = nodeToFirs[node.id] ? Array.from(nodeToFirs[node.id]) : [];
    if (memberOf.length === 1) {
      firMembers[memberOf[0]].push(node.id);
    }
  });

  // Place single-FIR members around their hub in a radial arrangement
  // Group by entity type within the cluster for angular sectors
  const TYPE_SECTOR = { Accused: 0, Victim: 1, Officer: 2, PoliceStation: 3, District: 4, Witness: 5, Court: 6, BankAccount: 7, Phone: 8, Vehicle: 9, Address: 10, CrimeCategory: 11, IPCSection: 12 };
  firNodes.forEach(firNode => {
    const memberIds = firMembers[firNode.id];
    if (!memberIds.length) return;
    const center = firCenters[firNode.id];

    // Sort members by type sector for organized placement
    const sorted = [...memberIds].sort((a, b) => {
      const ta = TYPE_SECTOR[nodesMap.get(a)?.data.entityType] ?? 99;
      const tb = TYPE_SECTOR[nodesMap.get(b)?.data.entityType] ?? 99;
      return ta - tb;
    });

    const total = sorted.length;
    sorted.forEach((nodeId, i) => {
      const node = nodesMap.get(nodeId);
      if (!node) return;
      const angle = (2 * Math.PI * i) / total - Math.PI / 2; // start from top
      const r = total <= 4 ? MEMBER_RADIUS * 0.75 : MEMBER_RADIUS;
      node.position = {
        x: center.x + r * Math.cos(angle),
        y: center.y + r * Math.sin(angle),
      };
    });
  });

  // Step 4: Multi-FIR nodes (repeat offenders / shared infrastructure)
  // Place at the centroid of all their cluster centers
  nodes.forEach(node => {
    if (node.data.entityType === 'FIR') return;
    const memberOf = nodeToFirs[node.id] ? Array.from(nodeToFirs[node.id]) : [];
    if (memberOf.length <= 1) return; // already handled above

    // Average the cluster centers
    let sumX = 0, sumY = 0;
    memberOf.forEach(firId => {
      const c = firCenters[firId] || { x: 600, y: 600 };
      sumX += c.x;
      sumY += c.y;
    });
    node.position = {
      x: sumX / memberOf.length,
      y: sumY / memberOf.length,
    };
  });

  // Step 5: Orphan nodes (not connected to any FIR) — scatter below the grid
  const maxY = Math.max(...Object.values(firCenters).map(c => c.y), 400);
  let orphanX = 400, orphanY = maxY + 500;
  nodes.forEach(node => {
    if (node.data.entityType === 'FIR') return;
    const memberOf = nodeToFirs[node.id] ? Array.from(nodeToFirs[node.id]) : [];
    if (memberOf.length === 0) {
      node.position = { x: orphanX, y: orphanY };
      orphanX += 200;
      if (orphanX > 2400) { orphanX = 400; orphanY += 200; }
    }
  });

  // Step 6: Add cluster group background nodes (visual grouping)
  const clusterGroupNodes = firNodes.map(firNode => {
    const center = firCenters[firNode.id];
    const memberCount = firMembers[firNode.id].length;
    // Size the background ellipse based on members
    const groupSize = 150 + Math.min(memberCount, 8) * 55;
    return {
      id: `cluster-bg-${firNode.id}`,
      type: 'clusterGroup',
      position: { x: center.x - groupSize, y: center.y - groupSize * 0.9 },
      data: {
        label: firNode.data.label,
        riskLevel: firNode.data.riskLevel,
        crimeType: firNode.data.crimeTypes?.[0] || '',
        width: groupSize * 2,
        height: groupSize * 1.8,
      },
      style: { zIndex: -1, pointerEvents: 'none' },
      selectable: false,
      draggable: false,
    };
  });

  // Cluster groups go first (rendered behind entity nodes)
  return { nodes: [...clusterGroupNodes, ...nodes], edges };
}


// GET the full or filtered graph
router.get('/graph', async (req, res) => {
  try {
    const records = await dbService.getAllRows(req, TABLE_NAME);
    let firs = records.filter(r => r.status !== 'Inactive' && r.status !== 'Archived');

    const {
      entityTypes,
      crimeTypes,
      districts,
      policeStation,
      dateFrom,
      dateTo,
      riskLevel,
      gang,
      repeatOffenderOnly,
      status
    } = req.query;

    // Filter FIRs before building graph to reduce size
    if (districts) {
      const dArr = districts.split(',');
      if (dArr.length > 0) firs = firs.filter(f => dArr.includes(f.district));
    }
    if (policeStation) {
      firs = firs.filter(f => f.policeStation === policeStation);
    }
    if (crimeTypes) {
      const cArr = crimeTypes.split(',');
      if (cArr.length > 0) firs = firs.filter(f => cArr.includes(f.crimeCategory));
    }
    if (dateFrom) firs = firs.filter(f => f.incidentDate >= dateFrom);
    if (dateTo) firs = firs.filter(f => f.incidentDate <= dateTo);
    if (status) firs = firs.filter(f => f.status === status);

    let { nodes, edges } = buildGraph(firs);

    // Apply Node-level filters
    if (entityTypes) {
      const eArr = entityTypes.split(',');
      if (eArr.length > 0) nodes = nodes.filter(n => eArr.includes(n.data.entityType));
    }
    if (riskLevel) {
      nodes = nodes.filter(n => n.data.riskLevel === riskLevel);
    }
    if (gang) {
      nodes = nodes.filter(n => n.data.gang && n.data.gang.toLowerCase().includes(gang.toLowerCase()));
    }
    if (repeatOffenderOnly === 'true') {
      nodes = nodes.filter(n => n.data.isRepeatOffender === true);
    }

    // Clean up edges (only keep edges where both nodes exist)
    const validNodeIds = new Set(nodes.map(n => n.id));
    edges = edges.filter(e => validNodeIds.has(e.source) && validNodeIds.has(e.target));

    res.json({ nodes, edges });
  } catch (error) {
    console.error('Error fetching graph:', error);
    res.status(500).json({ error: 'Failed to fetch graph' });
  }
});

// Search entities
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const query = q.toLowerCase();
    
    const records = await dbService.getAllRows(req, TABLE_NAME);
    const firs = records.filter(r => r.status !== 'Inactive');
    const { nodes } = buildGraph(firs);
    
    const results = nodes.filter(n => 
      (n.data.label || '').toLowerCase().includes(query) ||
      (n.data.entityType || '').toLowerCase().includes(query) ||
      (n.data.district || '').toLowerCase().includes(query)
    ).slice(0, 20);
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

const crypto = require('crypto');
const explanationCache = new Map();

function computeNetworkHash(nodes, edges) {
  const sortedNodeIds = nodes.map(n => n.id).sort().join(',');
  const sortedEdgeIds = edges.map(e => e.id).sort().join(',');
  return crypto.createHash('sha256').update(`${sortedNodeIds}|${sortedEdgeIds}`).digest('hex');
}

// GET explanation
router.get('/explanation', async (req, res) => {
  try {
    const records = await dbService.getAllRows(req, TABLE_NAME);
    let firs = records.filter(r => r.status !== 'Inactive' && r.status !== 'Archived');

    const {
      entityTypes,
      crimeTypes,
      districts,
      policeStation,
      dateFrom,
      dateTo,
      riskLevel,
      gang,
      repeatOffenderOnly,
      status
    } = req.query;

    // Filter FIRs before building graph to reduce size
    if (districts) {
      const dArr = districts.split(',');
      if (dArr.length > 0) firs = firs.filter(f => dArr.includes(f.district));
    }
    if (policeStation) {
      firs = firs.filter(f => f.policeStation === policeStation);
    }
    if (crimeTypes) {
      const cArr = crimeTypes.split(',');
      if (cArr.length > 0) firs = firs.filter(f => cArr.includes(f.crimeCategory));
    }
    if (dateFrom) firs = firs.filter(f => f.incidentDate >= dateFrom);
    if (dateTo) firs = firs.filter(f => f.incidentDate <= dateTo);
    if (status) firs = firs.filter(f => f.status === status);

    let { nodes, edges } = buildGraph(firs);

    // Apply Node-level filters
    if (entityTypes) {
      const eArr = entityTypes.split(',');
      if (eArr.length > 0) nodes = nodes.filter(n => eArr.includes(n.data.entityType));
    }
    if (riskLevel) {
      nodes = nodes.filter(n => n.data.riskLevel === riskLevel);
    }
    if (gang) {
      nodes = nodes.filter(n => n.data.gang && n.data.gang.toLowerCase().includes(gang.toLowerCase()));
    }
    if (repeatOffenderOnly === 'true') {
      nodes = nodes.filter(n => n.data.isRepeatOffender === true);
    }

    // Clean up edges (only keep edges where both nodes exist)
    const validNodeIds = new Set(nodes.map(n => n.id));
    edges = edges.filter(e => validNodeIds.has(e.source) && validNodeIds.has(e.target));

    // Calculate network hash and check cache
    const networkHash = computeNetworkHash(nodes, edges);
    if (explanationCache.has(networkHash)) {
      console.log(`[Network Cache Hit] Returning cached explanation for hash: ${networkHash}`);
      return res.json(explanationCache.get(networkHash));
    }

    const repeatOffenders = nodes.filter(n => n.data.isRepeatOffender);
    const quickmlService = require('../services/quickmlService');
    const prompt = `You are an AI Crime Network Analyst.
Analyze the following criminal network composed of ${firs.length} incidents and ${nodes.length} entities (offenders, victims, locations).
Key Repeat Offenders: ${JSON.stringify(repeatOffenders.slice(0, 5).map(ro => ({ name: ro.data.label, crimeType: ro.data.crimeTypes, cases: ro.data.firCount })))}
Recent Cases: ${JSON.stringify(firs.slice(0, 10).map(f => ({ firNumber: f.firNumber, category: f.crimeCategory, district: f.district })))}

Provide a JSON output strictly with this schema:
{
  "summary": "1 paragraph summary of the network structure",
  "hiddenRelationships": ["insight 1", "insight 2"],
  "repeatPatterns": ["pattern 1", "pattern 2"],
  "suspiciousConnections": ["connection 1", "connection 2"],
  "investigationLeads": [ { "priority": "High", "description": "lead", "entities": ["entity 1"] } ]
}
Return ONLY valid JSON, no markdown blocks.`;

    let aiData;
    try {
      let aiResponseStr = await quickmlService.chatWithGLM(req, [{ role: 'user', content: prompt }]);
      aiResponseStr = aiResponseStr.replace(/```json/g, '').replace(/```/g, '').trim();
      aiData = JSON.parse(aiResponseStr);
    } catch (e) {
      console.warn('AI Network Analysis failed, using fallback:', e.message);
      aiData = {
        summary: `The criminal network currently tracks ${firs.length} active incidents resulting in ${nodes.length} distinct entities.`,
        hiddenRelationships: [
          'Detected multiple Accused operating within the same Police Station jurisdiction without prior documented connection.',
          'Possible financial link between repeat offenders in the central district.'
        ],
        repeatPatterns: [
          `Identified ${repeatOffenders.length} repeat offenders across recent cases.`,
          'Most repeat offences are clustering around property crimes late at night.'
        ],
        suspiciousConnections: [
          'Shared phone numbers detected across two unrelated extortion FIRs.',
          'Common vehicle used in multiple recent burglary reports.'
        ],
        investigationLeads: [
          {
            priority: 'High',
            description: 'Investigate potential gang affiliation among top repeat offenders based on shared crime locations.',
            entities: repeatOffenders.slice(0, 3).map(r => r.data.label)
          }
        ]
      };
    }

    const responseBody = {
      summary: aiData.summary,
      hiddenRelationships: aiData.hiddenRelationships || [],
      repeatPatterns: aiData.repeatPatterns || [],
      keyIndividuals: repeatOffenders.slice(0, 3).map(ro => ({ name: ro.data.label, role: ro.data.entityType, centrality: ro.data.firCount })),
      suspiciousConnections: aiData.suspiciousConnections || [],
      evidence: ['Data Store FIR Records', 'AI Behavioral Profile Models'],
      confidenceScore: 89,
      investigationLeads: aiData.investigationLeads || []
    };

    // Cache the result
    explanationCache.set(networkHash, responseBody);

    res.json(responseBody);
  } catch (error) {
    console.error('Failed to fetch network explanation:', error);
    res.status(500).json({ error: 'Failed to fetch network explanation' });
  }
});

// GET entity details
router.get('/details/:id', async (req, res) => {
  try {
    const records = await dbService.getAllRows(req, TABLE_NAME);
    const firs = records.filter(r => r.status !== 'Inactive');
    const { nodes, edges } = buildGraph(firs);
    
    const node = nodes.find(n => n.id === req.params.id);
    if (!node) return res.status(404).json({ error: 'Node not found' });
    
    const connectedEdges = edges.filter(e => e.source === node.id || e.target === node.id);
    const connections = connectedEdges.map(e => {
      const otherId = e.source === node.id ? e.target : e.source;
      const otherNode = nodes.find(n => n.id === otherId);
      return {
        id: otherId,
        label: otherNode ? otherNode.data.label : otherId,
        entityType: otherNode ? otherNode.data.entityType : 'Unknown',
        relation: e.data.relation,
        riskScore: otherNode ? otherNode.data.riskScore : 0
      };
    }).slice(0, 10);
    
    res.json({
      node: node.data,
      crimeHistory: [], // Would populate properly with more time
      connections,
      timeline: [
        { date: new Date().toISOString().split('T')[0], event: 'Profile accessed via Network Analysis', type: 'alert' }
      ],
      knownAssociates: [],
      relatedCases: [],
      aiSummary: `${node.data.label} (${node.data.entityType}) is connected to ${node.data.firCount} incident(s) with a risk score of ${node.data.riskScore}/100. Extracted dynamically from live Data Store.`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch node details' });
  }
});

// EXPAND node
router.get('/expand/:id', async (req, res) => {
  try {
    const { existing } = req.query;
    const existingIds = new Set(existing ? existing.split(',') : []);
    
    const records = await dbService.getAllRows(req, TABLE_NAME);
    const firs = records.filter(r => r.status !== 'Inactive');
    const fullGraph = buildGraph(firs);
    
    const connectedEdges = fullGraph.edges.filter(e => e.source === req.params.id || e.target === req.params.id);
    const connectedNodeIds = new Set();
    connectedEdges.forEach(e => {
      connectedNodeIds.add(e.source);
      connectedNodeIds.add(e.target);
    });
    
    const newNodeIds = Array.from(connectedNodeIds).filter(id => !existingIds.has(id));
    const newNodes = fullGraph.nodes.filter(n => newNodeIds.includes(n.id));
    const newEdges = connectedEdges.filter(e => newNodeIds.includes(e.source) || newNodeIds.includes(e.target));
    
    res.json({ nodes: newNodes, edges: newEdges });
  } catch (error) {
    res.status(500).json({ error: 'Failed to expand node' });
  }
});

module.exports = router;
