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
            next();
        } else {
            res.status(401).json({ error: 'Unauthorized: No active session' });
        }
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({ error: 'Unauthorized: Invalid session' });
    }
}

module.exports = {
    verifyToken
};
