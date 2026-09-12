const mongoose = require("mongoose");
const DocumentVersion = require("../model/DocVersions");
const { getIO } = require("../socket/io");
const { getDoc } = require("../socket/yjsDocMap");
const { seedYDocFromTipTap } = require("../utils/yjsSeed");
const restoreVersion = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { id: documentId, version: versionNumber } = req.params;
    // 1. Find the version we want to restore
    const versionToRestore = await DocumentVersion.findOne({
      document: documentId,
      version: versionNumber,
    }).session(session);
    if (!versionToRestore) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "Version not found",
      });
    }
   const restoredContent = versionToRestore.content;
    // 3. Find the latest version number
    const latestVersion = await DocumentVersion.findOne({
      document: documentId,
    })
      .sort({ version: -1 })
      .session(session);
    const nextVersion = latestVersion
      ? latestVersion.version + 1
      : 1;
    // 4. Create a n
    await DocumentVersion.create(
      [
        {
          document: documentId,
          version: nextVersion,
          content: restoredContent,
          createdBy: req.userId,
        },
      ],
      { session }
    );
    // 5. Commit MongoDB transaction
    await session.commitTransaction();
    try {
      // 6. Get the live Y.Doc
      const liveDoc = getDoc(documentId);
      // If nobody currently has the document open,
      // there is no live Y.Doc to update.
      if (!liveDoc) {
        return res.status(200).json({
          message: "Version restored successfully",
        });
      }
      // 7. Create the Tiptap schema
      
      // 10. Capture the Yjs update
      let restoreUpdate;
      const updateHandler = (update) => {
        restoreUpdate = update;
      };
      liveDoc.on("update", updateHandler);
      // 11. Replace live document content
      seedYDocFromTipTap(liveDoc, restoredContent);
      liveDoc.off("update", updateHandler);
      // 12. Broadcast restore to connected users
      getIO()
        .to(documentId)
        .emit("version-restored", {
          update: restoreUpdate,
          version: nextVersion,
          restoredBy: req.userId,
        });
    } catch (postCommitError) {
      // MongoDB has already committed.
      // DO NOT abort the transaction here.
      console.error(
        "Database restore succeeded, but live Y.Doc update failed:",
        postCommitError
      );
      return res.status(500).json({
        message:
          "Version restored successfully, but the live document could not be updated",
      });
    }
    res.status(200).json({
      message: "Version restored successfully",
    });
  } catch (error) {
    // This catch handles errors before commitTransaction().
    // Only abort if the transaction is still active.
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error(
      "Restore version error:",
      error
    );

    res.status(500).json({
      message: "Failed to restore version",
    });
  } finally {
    await session.endSession();
  }
};
module.exports = { restoreVersion };