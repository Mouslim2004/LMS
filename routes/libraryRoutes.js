const express = require('express')
const router = express.Router()
const LibraryController = require('../controllers/libraryController')
const {upload, uploadImage} = require('../middleware/upload')
const auth = require('../middleware/auth')
const adminAuth = require('../middleware/adminAuth')
const authAdmin = require('../middleware/adminAuth')

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

router.get('/adminDash',authAdmin, LibraryController.adminDash)

router.get('/userBooks',auth, LibraryController.userBook)

router.get('/adminBooks',authAdmin, LibraryController.adminBook)
router.post('/adminBooks',uploadImage.fields([{ name: 'image' },
  { name: 'bookpdf' }]), LibraryController.adminBookPost)

router.get('/previewBook',auth, LibraryController.previewBook)

router.get('/regStudent',authAdmin,LibraryController.regStudent)
router.get('/student/:id', LibraryController.studentInfo)
router.get('/deleteStudent/:userId', LibraryController.findDeleteStudent)

router.get('/userRule',auth, LibraryController.userRule)
router.get('/sidebar', LibraryController.sidebar)
router.get('/userUpdate',auth, LibraryController.updateDetail)
router.get('/adminViewBook',authAdmin, LibraryController.viewBook)

router.get('/adminCategory',authAdmin, LibraryController.adminCategory)
router.get('/category/:category', LibraryController.findCategory)
router.put('/updateCategory', LibraryController.updateCategory)

router.get('/adminAuthor',authAdmin, LibraryController.adminAuthor)
router.get('/author/:author', LibraryController.findAuthor)
router.put('/updateAuthor', LibraryController.updateAuthor)

router.get('/adminIssued',authAdmin, LibraryController.adminIssue)
router.get('/userRequest',auth, LibraryController.userRequest)
router.get('/adminChange',authAdmin, LibraryController.adminChange)
router.get('/adminViewRequest',authAdmin, LibraryController.adminRequest)

router.get('/logout', LibraryController.logout);
router.get('/logoutAdmin', LibraryController.logoutAdmin)

router.get('*', (req,res) => {
  res.redirect('/');
})

module.exports = router