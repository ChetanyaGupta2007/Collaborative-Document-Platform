const docs = new Map();

function getDoc(docId) {
    return docs.get(docId);
}

function setDoc(docId, yDoc) {
    if (docs.has(docId)) {
        throw new Error(`Live Y.Doc already exists for document: ${docId}`);
    }

    docs.set(docId, yDoc);
}

function deleteDoc(docId) {
    docs.delete(docId);
}

function hasDoc(docId) {
    return docs.has(docId);
}

module.exports = {
    getDoc,
    setDoc,
    deleteDoc,
    hasDoc
};