const express = require('express')
const router = express.Router()
const LibraryController = require('../controllers/libraryController')
const upload = require('../middleware/upload')

router.get('/', LibraryController.index)

router.get('/userSignup', LibraryController.userSignup)
router.post('/userSignup', upload.single('avatar'), LibraryController.userSignupPost)

router.get('/userLogin', LibraryController.userLogin)
router.get('/adminLogin', LibraryController.adminLogin)
router.get('/userDash', LibraryController.userDash)
router.get('/userChange', LibraryController.userChange)
router.get('/userIssued', LibraryController.userIssued)
router.get('/adminDash', LibraryController.adminDash)
router.get('/userBooks', LibraryController.userBook)
router.get('/adminBooks', LibraryController.adminBook)
router.get('/previewBook', LibraryController.previewBook)
router.get('/regStudent',LibraryController.regStudent)
router.get('/userRule', LibraryController.userRule)
router.get('/sidebar', LibraryController.sidebar)
router.get('/userUpdate', LibraryController.updateDetail)
router.get('/adminViewBook', LibraryController.viewBook)
router.get('/adminCategory', LibraryController.adminCategory)
router.get('/adminAuthor', LibraryController.adminAuthor)
router.get('/adminIssued', LibraryController.adminIssue)
router.get('/userRequest', LibraryController.userRequest)
router.get('/adminChange', LibraryController.adminChange)
router.get('/adminViewRequest', LibraryController.adminRequest)

router.get('*', (req,res) => {
  res.redirect('/');
})

module.exports = router