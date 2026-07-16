const catalyst = require('zcatalyst-sdk-node');

async function verifyToken(req, res, next) {
    try {
        // Initialize Catalyst with the incoming request, preferring res.locals for advancedio
        const app = res.locals.catalyst || catalyst.initialize(req);
        
        // Verify session using Catalyst
        const user = await app.userManagement().getCurrentProjectUser();
        
        if (user) {
            // Map Catalyst user to our application's expected format
            req.user = {
                id: user.ZUID || user.user_id,
                username: user.email_id,
                role: user.role_details?.role_name?.toLowerCase() || 'investigator'
            };
            return next();
        }
        throw new Error('No active Catalyst session');
    } catch (error) {
        // Fallback to Mock User from cookie if Catalyst session check fails (development only)
        const isDev = process.env.NODE_ENV !== 'production' || process.env.CATALYST_EMULATOR;
        if (isDev) {
            const mockCookieRow = req.headers.cookie?.split(';').find(row => row.trim().startsWith('mock_user='));
            if (mockCookieRow) {
                try {
                    const mockUser = JSON.parse(decodeURIComponent(mockCookieRow.trim().split('=')[1]));
                    req.user = {
                        id: mockUser.id || 'mock-user-123',
                        username: mockUser.username || 'demo@police.karnataka.gov.in',
                        role: mockUser.role || 'investigator',
                        name: mockUser.name || 'Demo User'
                    };
                    return next();
                } catch (e) {
                    console.error("Failed to parse mock_user cookie:", e);
                }
            }

            // Default developer fallback for local emulators/scripts
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
    verifyToken
};
