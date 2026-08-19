
const UserData = require('../model/userData');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { refreshToken } = require('./refreshToken');
const saltRounds = 10;
async function checkingHash(hashedpassword,freshpassword){

        
        const storedHash = hashedpassword;
        
        const boolean = await bcrypt.compare(freshpassword,storedHash);
        return boolean;

};

async function checkData(req, res) {
   

        // 2. Now run your query
        
        
        const {username, email, password} = req.body;
        
        console.log("Unverified user saved:", { username, email, password });
        const verifiedUser = await UserData.findOne({ email });
        
        if (!verifiedUser) {
        return res.status(401).json({ message: "User not found" });
        }
        const checking = await checkingHash(verifiedUser.password,req.body.password);

        if (!checking) {
         return res.status(401).json({ message: "Invalid password" });
        }
        const user= verifiedUser.username;
        
        const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ user }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        await UserData.updateOne({ _id: verifiedUser._id }, { $set: { RefreshToken: refreshToken } });
        res.json({ accessToken, refreshToken, accessGrant: true });

        }

module.exports = { checkData };