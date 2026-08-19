// userController.js
const UserData = require('../model/userData');
const bcrypt = require('bcrypt')
const saltRounds = 10;
async function bcrypthashing(password){
  const hash = await bcrypt.hash(password, saltRounds);
  return hash

};
async function StoreRegisteredUserData(req, res) {
  try {
    // Your database logic goes here
    const hashedPassword = await bcrypthashing(req.body.password);
    const newUser = new UserData({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
    });
    await newUser.save();
    console.log("User data stored successfully");
    return res.status(201).json({ message: "Success" });
    
  } catch (error) {
    console.error("Error storing user data:", error);
    return res.status(500).json({ error: "Failed" });
    
  }
}

// Export it exactly the same way
module.exports = { StoreRegisteredUserData };