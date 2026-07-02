const express = require('express');
const router = express.Router();
const {getMethod, postMethod, putMethod, deleteMethod} = require('../controller/method');

router.route('/').get(getMethod).post(postMethod).put(putMethod).delete(deleteMethod);
module.exports = router;