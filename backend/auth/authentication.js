
const UserData = require('../model/userData');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function checkData(req, res) {
   

        // 2. Now run your query
        
        
        const {username, email, password} = req.body;
        
        console.log("Unverified user saved:", { username, email, password });
        const verifiedUser = await UserData.findOne({ username, email, password });
        if (verifiedUser) {
            console.log("User verified:");
            
            if (verifiedUser.firstLogin) {
                // Handle first-time login logic
                console.log("First-time login detected for user:", verifiedUser.username);
                // Update the firstLogin field to false
                verifiedUser.firstLogin = false;
                await verifiedUser.save();
                const user= verifiedUser.username;
                const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
                const refreshToken = jwt.sign({ user }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
                res.json({ accessToken, refreshToken, accessGrant: true });

            }
            else {
                // Handle subsequent login logic
                const authHeader = req.headers['authorization'];
                const token = authHeader && authHeader.split(' ')[1];
                if (token == null) return res.sendStatus(401);
                jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                    if (err) {
                        if (err.name === 'TokenExpiredError') {
                            const refreshToken = req.body.existingRefreshToken;
                            if (!refreshToken) return res.sendStatus(401);
                            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (refreshErr, decoded) => {
                            if (refreshErr) {
                                // Refresh token ALSO expired/invalid — force full re-login
                                return res.status(403).json({accessToken : null, refreshToken : null, error: 'Session expired, please log in again' });}
                            const newAccessToken = jwt.sign({ user: decoded.user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
                            res.json({ accessToken: newAccessToken, accessGrant: true });    
                            })
                        }
                        return res.sendStatus(403);
                    }
                    res.json({ accessGrant: true });
                });
            }
        } else {
            console.log("User not found in the database.");
            return false;
        }      

}
module.exports = { checkData };