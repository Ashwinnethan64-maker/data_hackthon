const catalyst = require('zcatalyst-sdk-node');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'catalyst-cios-secret-key-123456789';

async function verifyToken(req, res, next) {
    try {
        console.log("[DEBUG AUTH] req.headers.cookie:", req.headers.cookie);
        // Initialize Catalyst with the incoming request, preferring res.locals for advancedio
        const app = res.locals.catalyst || catalyst.initialize(req);
        
        // Verify session using Catalyst
        console.log("[DEBUG AUTH] Checking Catalyst session...");
        const user = await app.userManagement().getCurrentProjectUser();
        console.log("[DEBUG AUTH] Catalyst user resolved:", user ? user.email_id : null);
        
        if (user) {
            let dbUser = null;
            try {
                const dbService = require('../services/dbService');
                const records = await dbService.getAllRows(req, 'officers');
                dbUser = records.find(r => r.username === user.email_id);
            } catch (err) {
                console.warn("[WARN] Failed to lookup user in database officers table:", err.message);
            }

            // Map Catalyst user to our application's expected format
            req.user = {
                id: user.ZUID || user.user_id,
                username: user.email_id,
                name: dbUser?.name || (user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.email_id),
                role: dbUser?.role?.toLowerCase() || user.role_details?.role_name?.toLowerCase() || 'investigator',
                district: dbUser?.district || 'Bengaluru',
                policeStation: dbUser?.policeStation || 'Central Station'
            };
            console.log("[DEBUG AUTH] Mapped Catalyst user:", req.user);
            return next();
        }
        throw new Error('No active Catalyst session');
    } catch (error) {
        console.log("[DEBUG AUTH] Catalyst session check failed:", error.message);
        // Fallback to custom JWT, Google JWT, or Mock User if Catalyst session check fails (development only)
        const isDev = process.env.NODE_ENV !== 'production' || process.env.CATALYST_EMULATOR;
        console.log("[DEBUG AUTH] isDev:", isDev);
        if (isDev) {
            // 1. Try to extract from custom 'token' cookie (from username/password login)
            const tokenCookieRow = req.headers.cookie?.split(';').find(row => row.trim().startsWith('token='));
            console.log("[DEBUG AUTH] tokenCookieRow found:", !!tokenCookieRow);
            if (tokenCookieRow) {
                try {
                    const token = tokenCookieRow.trim().split('=')[1];
                    const decoded = jwt.verify(token, JWT_SECRET);
                    console.log("[DEBUG AUTH] Custom token decoded:", decoded ? decoded.username : null);
                    if (decoded) {
                        let dbUser = null;
                        try {
                            const dbService = require('../services/dbService');
                            const records = await dbService.getAllRows(req, 'officers');
                            dbUser = records.find(r => r.username === decoded.username);
                        } catch (err) {
                            console.warn("[WARN] Failed to lookup user in database officers table:", err.message);
                        }
                        req.user = {
                            id: decoded.id || dbUser?.ROWID || 'mock-user-123',
                            username: decoded.username,
                            name: dbUser?.name || decoded.name || 'Demo User',
                            role: dbUser?.role?.toLowerCase() || decoded.role?.toLowerCase() || 'investigator',
                            district: dbUser?.district || decoded.district || 'Bengaluru',
                            policeStation: dbUser?.policeStation || 'Central Station'
                        };
                        console.log("[DEBUG AUTH] Fallback custom token user:", req.user);
                        return next();
                    }
                } catch (e) {
                    console.error("Failed to verify token cookie:", e);
                }
            }

            // 2. Try to extract from 'google_session' cookie (set during Google login)
            // JWT_AUTH is an opaque Zoho token — it cannot be decoded with jwt.decode().
            // Instead we rely on the 'google_session' cookie which stores the user's email.
            const googleSessionRow = req.headers.cookie?.split(';').find(row => row.trim().startsWith('google_session='));
            console.log("[DEBUG AUTH] googleSessionRow found:", !!googleSessionRow);
            if (googleSessionRow) {
                try {
                    const email = decodeURIComponent(googleSessionRow.trim().split('=')[1]);
                    console.log("[DEBUG AUTH] google_session email:", email);
                    if (email) {
                        let dbUser = null;
                        try {
                            const dbService = require('../services/dbService');
                            const records = await dbService.getAllRows(req, 'officers');
                            dbUser = records.find(r => r.username === email);
                        } catch (err) {
                            console.warn("[WARN] Failed to lookup user in database officers table:", err.message);
                        }
                        req.user = {
                            id: dbUser?.ROWID || 'mock-user-123',
                            username: email,
                            name: dbUser?.name || email,
                            role: dbUser?.role?.toLowerCase() || 'investigator',
                            district: dbUser?.district || 'Bengaluru',
                            policeStation: dbUser?.policeStation || 'Central Station'
                        };
                        console.log("[DEBUG AUTH] Fallback Google session user:", req.user);
                        return next();
                    }
                } catch (e) {
                    console.error("Failed to read google_session cookie:", e);
                }
            }

            // 3. Fallback to mock_user cookie
            const mockCookieRow = req.headers.cookie?.split(';').find(row => row.trim().startsWith('mock_user='));
            console.log("[DEBUG AUTH] mockCookieRow found:", !!mockCookieRow);
            if (mockCookieRow) {
                try {
                    const mockUser = JSON.parse(decodeURIComponent(mockCookieRow.trim().split('=')[1]));
                    req.user = {
                        id: mockUser.id || 'mock-user-123',
                        username: mockUser.username || 'demo@police.karnataka.gov.in',
                        role: mockUser.role || 'investigator',
                        name: mockUser.name || 'Demo User'
                    };
                    console.log("[DEBUG AUTH] Fallback mock_user:", req.user);
                    return next();
                } catch (e) {
                    console.error("Failed to parse mock_user cookie:", e);
                }
            }

            // Default developer fallback for local emulators/scripts
            console.log("[DEBUG AUTH] Falling back to default Demo Investigator");
            req.user = {
                id: 'mock-user-123',
                username: 'demo@police.karnataka.gov.in',
                role: 'investigator',
                name: 'Demo Investigator'
            };
            return next();
        }

        console.error("Auth middleware error:", error);
        res.status(401).json({ error: 'Unauthorized: Invalid session' });
    }
}

module.exports = {
    verifyToken,
    JWT_SECRET
};

