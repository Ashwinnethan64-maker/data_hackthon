const express = require('express');
require('dotenv').config();
const { verifyToken } = require('./middleware/auth');

const app = express();
app.use(express.json());

// Authentication is now fully handled by Catalyst via the frontend.
// The backend simply validates the Catalyst session via verifyToken.

// Protect every secured API
const protectedRoutes = ['/dashboard', '/cases', '/reports', '/map', '/analytics', '/ai', '/settings'];

protectedRoutes.forEach(route => {
    app.use(route, verifyToken, (req, res) => {
        res.json({ message: `Access granted to ${route}` });
    });
});

module.exports = app;

// ── Local development: bind to port ────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\n✅ AI-CIOS API running locally on http://localhost:${PORT}`);
    console.log(`   Login: http://localhost:${PORT}/auth/login`);
  });
}
