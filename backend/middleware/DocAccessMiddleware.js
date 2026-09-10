const { hasDocumentAccess, roleLevel } = require('../auth/DocumentAccess');

function documentAccessMiddleware(requiredRole) {
    return async (req, res, next) => {
        const role = await hasDocumentAccess(req.userId, req.params.id);

        if (role === null) {
            return res.status(404).json({
                message: "Document not found"
            });
        }

        if (roleLevel[role] < roleLevel[requiredRole]) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        req.documentRole = role;
        next();
    };
}

module.exports = { documentAccessMiddleware };