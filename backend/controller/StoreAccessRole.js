const UserData = require('../model/userData');
const Document = require('../model/Document');
async function StoreRole(req,res) {
    try {
    const email = req.body.email;
    const role = req.body.role;
    const docId = req.body.id;
    
    const userId= req.userId;
    const doc = await Document.findById(docId);

        if (!doc) {
            return res.status(404).json({
                message: "Document not found"
            });
        }
    if (doc.owner.toString() !== userId) {
            return res.status(403).json({
                message: "Only the owner can grant access"
            });
        }

        // 3. Find the invited user using email
        const invitedUser = await UserData.findOne({ email });

        if (!invitedUser) {
            return res.status(404).json({
                message: "User with this email does not exist"
            });
        }
    const newRole = await Document.findOneAndUpdate( {
        _id : docId 
    },{ $push: { collaborators: { user: invitedUser._id, role: role } } })
    if(newRole === null){
            return res.status(404).json({
    message: "Document not found"
});
        }
        console.log('role saved' )
        return res.status(200).json({ message: "Role saved" });}
    catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        })
    }
}
module.exports = {StoreRole};