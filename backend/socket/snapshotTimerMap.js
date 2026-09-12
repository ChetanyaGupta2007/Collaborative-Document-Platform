const timers = new Map();

function getTimer(docId) {
    return timers.get(docId);
}

function setTimer(docId, timer) {
    timers.set(docId, timer);
}

function clearTimer(docId) {
    const timer = timers.get(docId);

    if (timer) {
        clearInterval(timer);
        timers.delete(docId);
    }
}

function hasTimer(docId) {
    return timers.has(docId);
}

module.exports = {
    getTimer,
    setTimer,
    clearTimer,
    hasTimer
};