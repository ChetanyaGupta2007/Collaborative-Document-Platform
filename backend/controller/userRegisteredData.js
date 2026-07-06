// userController.js
const UserData = require('../model/userData');
async function StoreRegisteredUserData(req, res) {
  try {
    // Your database logic goes here
    
    const newUser = new UserData({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
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