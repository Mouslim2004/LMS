const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const {upload, uploadImage} = require('../middleware/upload')
const {auth, refreshUserToken} = require('../middleware/auth')
// const {authAdmin, refreshToken } = require('../middleware/adminAuth')

router.get('/userSignup', userController.userSignup)
router.post('/userSignup', upload.single('avatar'), userController.userSignupPost)

router.get('/userLogin', userController.userLogin)
router.post('/userLogin', userController.userLoginPost)

router.get('/userDash', [auth, refreshUserToken], userController.userDash)
router.get('/userChange',[auth, refreshUserToken], userController.userChange)

router.get('/userIssued',[auth, refreshUserToken], userController.userIssued)

router.get('/userBooks',[auth, refreshUserToken], userController.userBook)
router.put('/toggleLike/:bookId', userController.toggleLike);

router.get('/previewBook/:bookId',[auth, refreshUserToken], userController.previewBook)

router.get('/userRule',[auth, refreshUserToken], userController.userRule)

router.get('/userUpdate',[auth, refreshUserToken], userController.updateDetail)
router.put('/updateUser/:studentId', userController.updateUser)

router.get('/userRequest',[auth, refreshUserToken], userController.userRequest)
router.post('/requestBook', userController.userRequestBook)

router.get('/logout', userController.logout);

module.exports = router


