const express = require('express');
const router = express.Router();
const {getMethod, postMethod, putMethod, deleteMethod} = require('../controller/method');
const {StoreRegisteredUserData}= require('../controller/userRegisteredData');
const {checkData}= require('../auth/authentication');
const {authmiddleware}= require('../middleware/authmiddleware');
const {refreshToken}= require('../auth/refreshToken');
const {documentAccessMiddleware}= require('../middleware/DocAccessMiddleware');

const {getMe}= require('../controller/me');
const {Logout} = require('../controller/Logout');
const {createDocument} = require('../controller/CreateDocument');
const { StoreRole } = require ('../controller/StoreAccessRole')
const {listAllDocuments} = require('../controller/ListDoc');
const {getOneDocument} = require('../controller/getOneDoc');
const {UpdateDoc} = require('../controller/updateDoc');
const {DeleteDocument} = require('../controller/DeleteDoc');
const {UpdateDocumentVersion} = require('../controller/UpdateDocumentVersion');
const {getVersionHistory} = require('../controller/getVersionHistory');
const {restoreVersion}= require('../controller/RestoreVersion')
router.route('/').get(getMethod).post(postMethod).put(putMethod).delete(deleteMethod);
router.route('/register').post(StoreRegisteredUserData);
router.route('/document/collaborator').post(authmiddleware,StoreRole);
router.route('/login').post(checkData);
router.route('/Token').post(refreshToken);
router.route('/accessToken').post(authmiddleware, getMe);
router.route('/logout').post(authmiddleware , Logout);
router.route('/document').post(authmiddleware, createDocument).get(authmiddleware ,listAllDocuments)
router.route('/document/:id').get(authmiddleware ,documentAccessMiddleware('viewer'), getOneDocument).put(authmiddleware, documentAccessMiddleware('editor'), UpdateDoc).delete(authmiddleware, documentAccessMiddleware('owner'),DeleteDocument);
router.route('/document/:id/version').post(authmiddleware, documentAccessMiddleware('editor'),UpdateDocumentVersion).get(authmiddleware, documentAccessMiddleware("viewer"), getVersionHistory );
router.route('/version/restore/:id/:version').post(authmiddleware, documentAccessMiddleware('editor'), restoreVersion );
module.exports = router;