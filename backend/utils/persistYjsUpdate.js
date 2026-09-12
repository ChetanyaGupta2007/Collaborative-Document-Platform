const Counter = require("../model/counter");
const Update = require("../model/update");

const { createSnapshot } = require("./createSnapshot");

async function persistYjsUpdate(documentId, update, ydoc) {
    try {
        const counter = await Counter.findOneAndUpdate(
            { _id: documentId },
            { $inc: { seq: 1 } },
            {
                new: true,
                upsert: true
            }
        );

        await Update.create({
            documentId: documentId,
            seq: counter.seq,
            update: Buffer.from(update)
        });

        // Snapshot every 50 persisted updates.
        if (counter.seq % 50 === 0) {
            try {
                await createSnapshot(
                    documentId,
                    ydoc,
                    counter.seq
                );
            } catch (error) {
                console.error(
                    "Failed to create Yjs snapshot:",
                    error
                );
            }
        }

    } catch (error) {
        console.error(
            "Failed to persist Yjs update:",
            error
        );
    }
}

module.exports = {
    persistYjsUpdate
};