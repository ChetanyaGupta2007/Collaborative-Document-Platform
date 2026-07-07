const express = require('express');
const router = express.Router();
const {getMethod, postMethod, putMethod, deleteMethod} = require('../controller/method');
const {StoreRegisteredUserData}= require('../controller/userRegisteredData');
const {checkData}= require('../auth/authentication');

router.route('/').get(getMethod).post(postMethod).put(putMethod).delete(deleteMethod);
router.route('/register').post(StoreRegisteredUserData);
router.route('/login').post(checkData);
module.exports = router;