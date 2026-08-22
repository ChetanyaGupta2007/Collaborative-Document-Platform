const jwt = require('jsonwebtoken');
const UserData = require('../model/userData');

async function refreshToken(req, res) {

    const refreshTokenFromClient = req.body;
    if (!refreshTokenFromClient) {
        return res.status(401).json({ message: "Refresh token missing" });
    }

    jwt.verify(refreshTokenFromClient, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }
        const userId = decoded.id;
        const userData = await UserData.findOne({ _id : userId});

        if (!userData || userData.RefreshToken !== refreshTokenFromClient) {
            return res.status(403).json({ message: "Invalid refresh token, user must login again" });
        }

        const accessToken = jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        res.json({ accessToken });
    });
}

module.exports = { refreshToken };