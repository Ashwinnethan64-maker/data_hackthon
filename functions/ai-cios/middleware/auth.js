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
        // 1. Try to extract from custom 'token' cookie (from username/password or Google login)
        const tokenCookieRow = req.headers.cookie?.split(';').find(row => row.trim().startsWith('token='));
        if (tokenCookieRow) {
            try {
                const token = tokenCookieRow.trim().split('=')[1];
                const decoded = jwt.verify(token, JWT_SECRET);
                if (decoded && decoded.username) {
                    let dbUser = null;
                    try {
                        const dbService = require('../services/dbService');
                        const records = await dbService.getAllRows(req, 'officers');
                        dbUser = records.find(r => r.username === decoded.username);
                    } catch (err) {
                        console.warn("[WARN] Failed to lookup user in database officers table:", err.message);
                    }
                    const isGoogle = decoded.username.includes('@');
                    req.user = {
                        id: decoded.id || dbUser?.ROWID || 'user-id',
                        username: decoded.username,
                        name: dbUser?.name || decoded.name || decoded.username,
                        role: dbUser?.role?.toLowerCase() || decoded.role?.toLowerCase() || 'investigator',
                        district: dbUser?.district || decoded.district || 'Bengaluru',
                        policeStation: dbUser?.policeStation || 'Central Station',
                        email: dbUser?.email || (isGoogle ? decoded.username : `${decoded.username}@police.karnataka.gov.in`),
                        provider: isGoogle ? 'Google' : 'Database'
                    };
                    return next();
                }
            } catch (e) {
                console.error("Failed to verify token cookie:", e.message);
            }
        }

        // 2. Try to extract from 'google_session' cookie (set during Google login)
        const googleSessionRow = req.headers.cookie?.split(';').find(row => row.trim().startsWith('google_session='));
        if (googleSessionRow) {
            try {
                const email = decodeURIComponent(googleSessionRow.trim().split('=')[1]);
                if (email && email.includes('@')) {
                    let dbUser = null;
                    try {
                        const dbService = require('../services/dbService');
                        const records = await dbService.getAllRows(req, 'officers');
                        dbUser = records.find(r => r.username === email);
                    } catch (err) {
                        console.warn("[WARN] Failed to lookup user in database officers table:", err.message);
                    }
                    req.user = {
                        id: dbUser?.ROWID || 'google-user',
                        username: email,
                        name: dbUser?.name || email,
                        email: email,
                        role: dbUser?.role?.toLowerCase() || 'investigator',
                        district: dbUser?.district || 'Bengaluru',
                        policeStation: dbUser?.policeStation || 'Central Station',
                        provider: 'Google'
                    };
                    return next();
                }
            } catch (e) {
                console.error("Failed to read google_session cookie:", e);
            }
        }

        // 3. Fallback to mock_user cookie ONLY in non-production local testing if explicitly provided
        const isDev = process.env.NODE_ENV !== 'production' || process.env.CATALYST_EMULATOR;
        if (isDev) {
            const mockCookieRow = req.headers.cookie?.split(';').find(row => row.trim().startsWith('mock_user='));
            if (mockCookieRow) {
                try {
                    const mockUser = JSON.parse(decodeURIComponent(mockCookieRow.trim().split('=')[1]));
                    if (mockUser && mockUser.username) {
                        req.user = {
                            id: mockUser.id || 'mock-user-123',
                            username: mockUser.username,
                            email: mockUser.email,
                            role: mockUser.role || 'investigator',
                            name: mockUser.name || 'Demo User',
                            provider: 'Demo'
                        };
                        return next();
                    }
                } catch (e) {
                    console.error("Failed to parse mock_user cookie:", e);
                }
            }
        }

        // Strictly return 401 when no valid session or token exists
        return res.status(401).json({ error: 'Unauthorized: No active session' });
    }
}

module.exports = {
    verifyToken,
    JWT_SECRET
};

