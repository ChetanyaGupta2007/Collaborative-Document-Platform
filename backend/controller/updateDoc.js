const Document = require('../model/Document');
async function UpdateDoc(req, res) {
    try {
        const docId = req.params.id;
        const updatedcontent = req.body.content;
        const updatedtitle = req.body.title;
        console.log("update items stored")
        const result = await Document.findOneAndUpdate(
            { _id: docId },
            { content: updatedcontent, title: updatedtitle },
            { new: true }
        );
        if(result === null){
            return res.status(404).json({
                message: "Document not found"
            });
        }
        return res.status(200).json({ message: "Doc saved" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
}

module.exports = { UpdateDoc };