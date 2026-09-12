const Counter = require("../model/counter");
const Snapshot = require("../model/snapshot");
const { createSnapshot } = require("../utils/createSnapshot");
const { getDoc, deleteDoc } = require("./yjsDocMap");
const { stopSnapshotTimer } = require("../utils/snapshotTimer");

/**
 * Shared logic for "this socket left this document" — used by both
 * disconnect and leave_document so they can no longer disagree about
 * whether anyone is still present. Redis presence (hLen) is the single
 * source of truth, not Socket.IO's room adapter, since a presence entry
 * and room membership are always set together in join_document — the room
 * adapter was a redundant second signal, not a genuinely different one.
 *
 * On last-leave (remainingUsers === 0):
 *  - takes a mandatory snapshot if the document has any updates since its
 *    latest snapshot (same idle-skip comparison as the 5-minute timer, to
 *    avoid a redundant snapshot when nothing changed since the last one)
 *  - stops the 5-minute snapshot timer
 *  - evicts the live Y.Doc from yjsDocMap
 *  - clears the Redis presence hash entirely
 */
async function handleUserLeave(docId, socket, redisClient) {
    if (!docId) return;

    const username = await redisClient.hGet(
        `documentPresence:${docId}`,
        socket.id
    );

    await redisClient.hDel(`documentPresence:${docId}`, socket.id);

    socket.to(docId).emit("user_left", { username });

    const remainingUsers = await redisClient.hLen(
        `documentPresence:${docId}`
    );

    if (remainingUsers === 0) {
        const ydoc = getDoc(docId);

        if (ydoc) {
            try {
                const counter = await Counter.findOne({ _id: docId });

                if (counter && counter.seq > 0) {
                    const latestSnapshot = await Snapshot.findOne({
                        documentId: docId,
                    }).sort({ lastUpdateSeq: -1 });

                    const lastSnapshottedSeq = latestSnapshot
                        ? latestSnapshot.lastUpdateSeq
                        : 0;

                    if (counter.seq > lastSnapshottedSeq) {
                        await createSnapshot(docId, ydoc, counter.seq);
                    }
                }
            } catch (err) {
                console.error(
                    `Failed to create mandatory last-leave snapshot for document ${docId}:`,
                    err
                );
            }
        }

        stopSnapshotTimer(docId);
        deleteDoc(docId);
        await redisClient.del(`documentPresence:${docId}`);
    }
}

module.exports = { handleUserLeave };