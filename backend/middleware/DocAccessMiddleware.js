const {HasDocumentAccess}= require('../auth/DocumentAccess');
function documentAccessMiddleware(requiredRole) {
    return async (req, res, next) => {
        console.log('hasDocumentAcess middlewware ran' )
        const result = await HasDocumentAccess(req.userId, req.params.id, requiredRole);
        if (result === null) {
    return res.status(404).json({
        message: "Document not found"
    });
}

if (result === false) {
    return res.status(403).json({
        message: "Access denied"
    });
}
        next();
        
        // decide what to do based on result, then either next() or send a response
    };
}
module.exports = {  documentAccessMiddleware };