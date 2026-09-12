const Y = require("yjs");

const Snapshot = require("../model/snapshot");
const Update = require("../model/update");

const { seedYDocFromTipTap } = require("./yjsSeed");

async function reconstructYDoc(documentId, documentContent) {
    const ydoc = new Y.Doc();

    // Find the latest snapshot
    const snapshot = await Snapshot.findOne({
        documentId: documentId
    }).sort({
        lastUpdateSeq: -1
    });

    let lastSeq = 0;

    // Restore snapshot state if one exists
    if (snapshot) {
        Y.applyUpdate(ydoc, snapshot.state);

        lastSeq = snapshot.lastUpdateSeq;
    }

    // Find all updates after the snapshot
    const updates = await Update.find({
        documentId: documentId,
        seq: {
            $gt: lastSeq
        }
    }).sort({
        seq: 1
    });

    // Replay updates in sequence order
    for (const updateDoc of updates) {
        Y.applyUpdate(ydoc, updateDoc.update);
    }

    // No Yjs persistence exists yet for this document.
    // Use the old TipTap JSON content as the initial state.
    if (!snapshot && updates.length === 0) {
        seedYDocFromTipTap(ydoc, documentContent);
    }

    return ydoc;
}

module.exports = {
    reconstructYDoc
};