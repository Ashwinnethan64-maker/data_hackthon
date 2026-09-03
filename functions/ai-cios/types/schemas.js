const { z } = require('zod');

const loginSchema = z.object({
  username: z.string().min(1, 'Username or email is required'),
  password: z.string().optional(),
  token: z.string().optional(),
  role: z.enum(['investigator', 'analyst', 'commissioner', 'admin']).optional(),
  stationId: z.string().optional(),
  divisionId: z.string().optional(),
});

const createCaseSchema = z.object({
  firNumber: z.string().regex(/^\d{18}$/, 'FIR Number must be exactly 18 digits (numeric string).'),
  crimeCategory: z.string().min(1, 'Crime category is required'),
  district: z.string().min(1, 'District is required'),
  policeStation: z.string().min(1, 'Police station is required'),
  dateReported: z.string().optional().default(() => new Date().toISOString()),
  incidentDate: z.string().optional().default(() => new Date().toISOString()),
  status: z.enum(['Open', 'Under Investigation', 'Under Review', 'Closed', 'Pending', 'Archived', 'Inactive'])
    .or(z.string())
    .default('Open'),
  riskLevel: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  priorityLevel: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  locationText: z.string().optional(),
  latitude: z.number().or(z.string().transform((v) => parseFloat(v))).optional().default(12.9716),
  longitude: z.number().or(z.string().transform((v) => parseFloat(v))).optional().default(77.5946),
  description: z.string().min(1, 'Case Brief / Description is required'),
  applicableActs: z.array(z.string()).or(z.string()).optional(),
  victims: z.array(z.any()).or(z.string()).optional(),
  accused: z.array(z.any()).or(z.string()).optional(),
  evidence: z.array(z.any()).or(z.string()).optional(),
  timeline: z.array(z.any()).or(z.string()).optional(),
  complainantName: z.string().optional(),
  accusedName: z.string().optional(),
  actSections: z.string().optional(),
  summary: z.string().optional(),
  officerId: z.string().optional(),
});

const updateCaseSchema = createCaseSchema.partial();

const aiChatSchema = z.object({
  query: z.string().min(1, 'Query parameter is required'),
  conversationHistory: z.array(z.any()).optional(),
  threadId: z.string().optional(),
});

const mapAnalysisSchema = z.object({
  incidents: z.array(z.any()).min(1, 'At least one incident is required for area analysis'),
});

module.exports = {
  loginSchema,
  createCaseSchema,
  updateCaseSchema,
  aiChatSchema,
  mapAnalysisSchema,
};
