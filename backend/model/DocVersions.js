
const mongoose = require("mongoose");

const documentVersionSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },

    version: {
      type: Number,
      required: true,
    },

    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
documentVersionSchema.index( { document: 1, version: 1 }, { unique: true } );
module.exports = mongoose.model("DocumentVersion", documentVersionSchema);

