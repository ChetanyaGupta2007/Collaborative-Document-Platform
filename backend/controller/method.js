const getMethod = (req, res) => {
    console.log("Get Method");
    res.send("Get Method");
};
const postMethod = (req, res) => {
    console.log("Post Method");
    res.send("Post Method");
};
const putMethod = () => {
    console.log("Put Method");
};
const deleteMethod = () => {
    console.log("Delete Method");
};
module.exports = {getMethod, postMethod, putMethod, deleteMethod};