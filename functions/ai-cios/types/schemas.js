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
  firNumber: z.string().min(1, 'FIR number is required'),
  crimeCategory: z.string().min(1, 'Crime category is required'),
  district: z.string().min(1, 'District is required'),
  policeStation: z.string().min(1, 'Police station is required'),
  dateReported: z.string().min(1, 'Date reported is required'),
  incidentDate: z.string().optional(),
  status: z.enum(['Open', 'Closed', 'Pending']).default('Open'),
  riskLevel: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
  locationText: z.string().optional(),
  latitude: z.number().or(z.string().transform((v) => parseFloat(v))).optional(),
  longitude: z.number().or(z.string().transform((v) => parseFloat(v))).optional(),
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
