const mongoose = require("mongoose");
const Y = require("yjs");

const Snapshot = require("../model/snapshot");
const Update = require("../model/update");

async function createSnapshot(documentId, ydoc, lastUpdateSeq) {
    const state = Y.encodeStateAsUpdate(ydoc);

    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            const snapshot = new Snapshot({
                documentId: documentId,
                lastUpdateSeq: lastUpdateSeq,
                state: Buffer.from(state)
            });

            await snapshot.save({ session });

            await Update.deleteMany(
                {
                    documentId: documentId,
                    seq: {
                        $lte: lastUpdateSeq
                    }
                },
                { session }
            );
        });
    } finally {
        await session.endSession();
    }
}

module.exports = {
    createSnapshot
};