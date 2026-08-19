const express = require('express');
const router = express.Router();
const {getMethod, postMethod, putMethod, deleteMethod} = require('../controller/method');
const {StoreRegisteredUserData}= require('../controller/userRegisteredData');
const {checkData}= require('../auth/authentication');
const {authmiddleware}= require('../middleware/authmiddleware');
const {refreshToken}= require('../auth/refreshToken');
const {getMe}= require('../controller/getMe');
const {Logout} = require('../controller/Logout');

router.route('/').get(getMethod).post(postMethod).put(putMethod).delete(deleteMethod);
router.route('/register').post(StoreRegisteredUserData);
router.route('/login').post(checkData);
router.route('/Token').post(refreshToken);
router.route('/accessToken').post(authmiddleware, getMe);
router.route('/logout').post(authmiddleware , Logout);

module.exports = router;