const DocumentVersion = require('../model/DocVersions');
async function UpdateDocumentVersion(req, res) {
    try {
        const content = req.body.content;
        const documentId = req.params.id;
        const latestVersion = await DocumentVersion .findOne({ document: documentId }) .sort({ version: -1 }); 
        const nextVersion = latestVersion ? latestVersion.version + 1 : 1;

        const newVersion = new DocumentVersion({
            document: documentId,
            version: nextVersion,
            content: content,
            createdBy: req.userId
        });
        await newVersion.save();
        console.log("Version saved successfully");
        res.status(201).json(newVersion);
    }
    catch (err){
        console.error("Error saving version:", err);
        res.status(500).json({ message: "Failed to save version" });
    }
}
module.exports = { UpdateDocumentVersion };