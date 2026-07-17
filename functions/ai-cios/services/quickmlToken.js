const catalyst = require('zcatalyst-sdk-node');

/**
 * Resolve a QuickML access token.
 * 1️⃣ Checks process.env.QUICKML_ACCESS_TOKEN (convenient for local dev).
 * 2️⃣ If missing, attempts to retrieve the token from a Catalyst connection named
 *    "quickml_connection" using the request's Catalyst context.
 * Throws an error if a token cannot be obtained.
 *
 * @param {object} req - Express request object injected by Catalyst runtime.
 * @returns {Promise<string>} The bearer token to be used for QuickML API calls.
 */
async function resolveQuickmlToken(req) {
  if (process.env.QUICKML_ACCESS_TOKEN) {
    return process.env.QUICKML_ACCESS_TOKEN;
  }
  try {
    const app = req.locals?.catalyst || catalyst.initialize(req);
    const credentials = await app.connections().getConnectionCredentials('quickml_connection');
    const authHeader = credentials && credentials.headers && (credentials.headers.Authorization || credentials.headers.authorization);
    if (authHeader) {
      return authHeader.replace(/^(Bearer|Zoho-oauthtoken)\s+/i, '').trim();
    }
  } catch (err) {
    console.warn('[WARN] QuickML token resolution failed:', err.message);
  }
  throw new Error('QuickML authorization token not resolved (no connection or QUICKML_ACCESS_TOKEN env)');
}

module.exports = { resolveQuickmlToken };
