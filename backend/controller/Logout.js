// controller/Logout.js
const UserData = require('../model/userData');

async function Logout(req, res) {
    const userId = req.userId;

    const userData = await UserData.findOne({ _id: userId });

    if (!userData) {
        return res.status(404).json({ message: "User not found" });
    }

    userData.RefreshToken = null;
    await userData.save();
    console.log("logut success")
    res.json({ message: "success" });
}

module.exports = { Logout };