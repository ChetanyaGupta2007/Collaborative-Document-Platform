const Document = require('../model/Document');

const roleLevel = {
  viewer: 1,
  editor: 2,
  owner: 3,
};

async function hasDocumentAccess(userId, docId) {
  const doc = await Document.findById(docId);
  if (!doc) return null;

  if (doc.owner.toString() === userId) return 'owner';

  const collaborator = doc.collaborators.find(
    (c) => c.user.toString() === userId
  );

  if (!collaborator) return null;

  return collaborator.role;
}

module.exports = { hasDocumentAccess, roleLevel };