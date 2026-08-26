const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: 'untitled document'
    },

    content: {
        type: String,
        default: ""
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserData",
        required: true
    }

}, {
    timestamps: true
});

const Document = mongoose.model('Document', DocumentSchema);

module.exports = Document;