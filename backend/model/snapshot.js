const mongoose=require('mongoose');

const snapshotSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    lastUpdateSeq: {
        type: Number,
        required: true
    },
    state: {
        type: Buffer,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
snapshotSchema.index({documentId: 1,lastUpdateSeq: -1});
module.exports = mongoose.model('Snapshot', snapshotSchema);