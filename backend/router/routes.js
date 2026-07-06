const express = require('express');
const router = express.Router();
const {getMethod, postMethod, putMethod, deleteMethod} = require('../controller/method');
const {StoreRegisteredUserData}= require('../controller/userRegisteredData');

router.route('/').get(getMethod).post(postMethod).put(putMethod).delete(deleteMethod);
router.route('/register').post(StoreRegisteredUserData);
module.exports = router;