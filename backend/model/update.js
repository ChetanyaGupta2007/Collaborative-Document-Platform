const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },

    seq: {
        type: Number,
        required: true
    },

    update: {
        type: Buffer,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

updateSchema.index({ documentId: 1, seq: 1 } ,{ unique: true });

module.exports = mongoose.model('Update', updateSchema);