/**
 * Law Enforcement Compliance & Audit Logging Service.
 * Tracks user access, investigations, case updates, and reports with chain-of-custody metadata.
 */
class AuditService {
  constructor() {
    this.logs = [];
    this.maxLogs = 2000;
  }

  /**
   * Record an audit event
   * @param {Object} event
   */
  log({ userId = 'anonymous', officerRole = 'investigator', action, targetResource, targetId, ip = '127.0.0.1', details = {} }) {
    const entry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId,
      officerRole,
      action,
      targetResource,
      targetId: targetId ? String(targetId) : null,
      ip,
      details,
      status: 'SUCCESS',
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    if (process.env.NODE_ENV !== 'test') {
      console.log(`[AUDIT] ${entry.timestamp} | ${entry.action} | User: ${entry.userId} | Resource: ${entry.targetResource} (${entry.targetId || 'N/A'})`);
    }

    return entry;
  }

  /**
   * Query recent audit logs with filters
   */
  getLogs({ limit = 50, action, targetResource, userId } = {}) {
    let result = [...this.logs];

    if (action) result = result.filter(l => l.action === action);
    if (targetResource) result = result.filter(l => l.targetResource === targetResource);
    if (userId) result = result.filter(l => l.userId === userId);

    return result.slice(0, Number(limit));
  }
}

const auditService = new AuditService();
module.exports = { auditService, AuditService };
