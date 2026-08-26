const Document = require('../model/Document');

async function listAllDocuments(req, res) {
    try {
        const userId = req.userId;
        const documents = await Document.find({ owner: userId }, "title owner").populate("owner", "username");
        console.log("list created");
        return res.status(200).json({ documents: documents });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to list document" });
    }
}

module.exports = { listAllDocuments };