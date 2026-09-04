const Document = require('../model/Document');

async function HasDocumentAccess(userId, docId, requiredRole){  
    try {
        const doc = await Document.findById(docId);
        if (!doc) {
            return null; // document doesn't exist
        }
        if (doc.owner.toString() === userId) return true;
        const collaborator = doc.collaborators.find(
            collaborator => collaborator.user.toString() === userId
        );
        if (!collaborator) {
            return false;
        }
        const roleLevel = {
            viewer: 1,
            editor:2,
            owner:3
        }
        console.log('hasDocumentAcess function ran' )
        return roleLevel[collaborator.role] >= roleLevel[requiredRole]
    } catch (err) {
        console.error(err);
        return false;
    }
}
module.exports= { HasDocumentAccess};