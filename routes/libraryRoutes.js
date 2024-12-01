const express = require('express')
const router = express.Router()
const LibraryController = require('../controllers/libraryController')
const upload = require('../middleware/upload')
const auth = require('../middleware/auth')

router.get('/', LibraryController.index)

router.get('/userSignup', LibraryController.userSignup)
router.post('/userSignup', upload.single('avatar'), LibraryController.userSignupPost)

router.get('/userLogin', LibraryController.userLogin)
router.post('/userLogin', LibraryController.userLoginPost)

router.get('/adminLogin', LibraryController.adminLogin)
router.post('/adminLogin', LibraryController.adminLoginPost)

router.get('/userDash', auth, LibraryController.userDash)
router.get('/userChange',auth, LibraryController.userChange)
router.get('/userIssued',auth, LibraryController.userIssued)
router.get('/adminDash', LibraryController.adminDash)
router.get('/userBooks',auth, LibraryController.userBook)
router.get('/adminBooks', LibraryController.adminBook)
router.get('/previewBook',auth, LibraryController.previewBook)
router.get('/regStudent',LibraryController.regStudent)
router.get('/userRule',auth, LibraryController.userRule)
router.get('/sidebar', LibraryController.sidebar)
router.get('/userUpdate',auth, LibraryController.updateDetail)
router.get('/adminViewBook', LibraryController.viewBook)
router.get('/adminCategory', LibraryController.adminCategory)
router.get('/adminAuthor', LibraryController.adminAuthor)
router.get('/adminIssued', LibraryController.adminIssue)
router.get('/userRequest',auth, LibraryController.userRequest)
router.get('/adminChange', LibraryController.adminChange)
router.get('/adminViewRequest', LibraryController.adminRequest)

router.get('/logout', LibraryController.logout);

router.get('*', (req,res) => {
  res.redirect('/');
})

module.exports = router