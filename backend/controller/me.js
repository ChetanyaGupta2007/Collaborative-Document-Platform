// controller/getMe.js
function getMe(req, res) {
  res.json({ id: req.userId });
}
module.exports = { getMe };