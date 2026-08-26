const Document = require('../model/Document');
async function DeleteDocument(req, res) { 
    try {
        
    
    const docId = req.params.id;
    const userId = req.userId;
     const result = await Document.findOneAndDelete(
            { _id: docId, owner: userId }
);
if(result === null){
    return res.status(404).json({
    message: "Document not found"});
}
return res.status(200).json({
    message: "Document deleted"
});
} catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        })
    }

};
    
    module.exports = { DeleteDocument };