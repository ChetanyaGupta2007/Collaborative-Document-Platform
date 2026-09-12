const Counter = require("../model/counter");
const Snapshot = require("../model/snapshot");

const { createSnapshot } = require("./createSnapshot");

const {
    setTimer,
    hasTimer,
    clearTimer
} = require("../socket/snapshotTimerMap");

const {
    getDoc
} = require("../socket/yjsDocMap");

const FIVE_MINUTES = 5 * 60 * 1000;

function startSnapshotTimer(docId, ydoc) {
    if (hasTimer(docId)) {
        return;
    }

    const timer = setInterval(async () => {
        try {
            const currentYDoc = getDoc(docId);

            if (currentYDoc !== ydoc) {
                return;
            }

            const counter = await Counter.findOne({
                _id: docId
            });

            if (!counter || counter.seq === 0) {
                return;
            }

            const currentSeq = counter.seq;

            const latestSnapshot = await Snapshot.findOne({
                documentId: docId
            }).sort({
                lastUpdateSeq: -1
            });

            const lastSnapshottedSeq = latestSnapshot
                ? latestSnapshot.lastUpdateSeq
                : 0;

            if (currentSeq <= lastSnapshottedSeq) {
                return;
            }

            await createSnapshot(
                docId,
                ydoc,
                currentSeq
            );

        } catch (error) {
            console.error(
                "Failed to create timed Yjs snapshot:",
                error
            );
        }
    }, FIVE_MINUTES);

    setTimer(docId, timer);
}

function stopSnapshotTimer(docId) {
    clearTimer(docId);
}

module.exports = {
    startSnapshotTimer,
    stopSnapshotTimer
};