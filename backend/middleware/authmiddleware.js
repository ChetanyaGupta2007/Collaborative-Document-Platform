// middleware/verifyAccessToken.js
const jwt = require('jsonwebtoken');
function authmiddleware(req, res, next) {
 const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "Access token missing" });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                        if (err){
                                return res.status(401).json({ message: "Invalid access token" });
                        }
                        req.user = decoded;
                        next();
                });
 
}
module.exports = { authmiddleware };