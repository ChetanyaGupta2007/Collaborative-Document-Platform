const mongoose = require("mongoose");
const Document = require("../model/Document");
const DocumentVersion = require("../model/DocVersions");
const { getIO } = require("../socket/io");

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

    // 2. Get the restored content
    const restoredContent = versionToRestore.content;

    // 3. Update the live document
    await Document.findByIdAndUpdate(
      documentId,
      {
        content: restoredContent,
      },
      { session }
    );

    // 4. Find the latest version number
    const latestVersion = await DocumentVersion.findOne({
      document: documentId,
    })
      .sort({ version: -1 })
      .session(session);

    const nextVersion = latestVersion
      ? latestVersion.version + 1
      : 1;

    // 5. Create a new version representing the restore
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

    // 6. Make all database changes permanent
    await session.commitTransaction();

    // 7. Tell connected clients only after successful commit
    getIO()
      .to(documentId)
      .emit("version-restored", restoredContent);

    res.status(200).json({
      message: "Version restored successfully",
    });

  } catch (error) {
    // Undo all database changes made in this transaction
    await session.abortTransaction();

    res.status(500).json({
      message: "Failed to restore version",
    });

  } finally {
    // Close the session
    await session.endSession();
  }
};

module.exports = { restoreVersion };