const Document = require('../model/Document');

async function getOneDocument(req,res) {
    try {
        const userId= req.userId;
        const docId = req.params.id;
        const Doc = await Document.findOne({ _id : docId});
        console.log("Doc Search happend");
        if (!Doc){
            console.log("wrong id sent");
            return res.status(404).json({message : "Wrong id sent"})
        }
        
        if (Doc.owner.toString() !== userId){
            console.log("wrong owner sent");
            return res.status(403).json({message : "Wrong owner sent"})
        }
        return res.status(200).json({ doc: Doc });



    } catch (error) {
         console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
        
    }


    
}
module.exports = { getOneDocument };