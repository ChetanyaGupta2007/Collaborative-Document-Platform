const Document = require('../model/Document');

async function createDocument(req, res) {
    try {
        const userId = req.userId;
        const newDocument = new Document({
            content: req.body.content,
            owner: userId
        });
        await newDocument.save();
        console.log("new doc created");
        return res.status(201).json(newDocument);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to create document" });
    }
}

module.exports = { createDocument };