const UserData = require('../model/userData');
async function Logout(req, res) {
    const user = req.user.user;

    const userData = await UserData.findOne({ username: user });

    userData.RefreshToken = null;

    await userData.save();

    res.send("success");
}
module.exports = {Logout}