const express = require('express')
const router = express.Router()
const LibraryController = require('../controllers/libraryController')
const {upload, uploadImage} = require('../middleware/upload')
const {auth, refreshUserToken} = require('../middleware/auth')
const {authAdmin, refreshToken } = require('../middleware/adminAuth')

router.get('/', LibraryController.index)

router.get('/userSignup', LibraryController.userSignup)
router.post('/userSignup', upload.single('avatar'), LibraryController.userSignupPost)

router.get('/userLogin', LibraryController.userLogin)
router.post('/userLogin', LibraryController.userLoginPost)

router.get('/adminLogin', LibraryController.adminLogin)
router.post('/adminLogin', LibraryController.adminLoginPost)

router.get('/userDash', auth, refreshUserToken, LibraryController.userDash)
router.get('/userChange',auth, refreshUserToken, LibraryController.userChange)
router.get('/userIssued',auth, refreshUserToken, LibraryController.userIssued)

router.get('/adminDash',authAdmin, refreshToken, LibraryController.adminDash)

router.get('/userBooks',auth, refreshUserToken, LibraryController.userBook)
router.put('/toggleLike/:bookId', LibraryController.toggleLike);
router.post('/userSearchBook', LibraryController.userSearchBook)

router.get('/adminBooks',authAdmin, refreshToken, LibraryController.adminBook)
router.post('/adminBooks',uploadImage.fields([{ name: 'image' },
  { name: 'bookpdf' }]), LibraryController.adminBookPost)

router.get('/previewBook/:bookId',auth, refreshUserToken, LibraryController.previewBook)

router.get('/regStudent',authAdmin, refreshToken, LibraryController.regStudent)
router.get('/student/:id', LibraryController.studentInfo)
router.get('/deleteStudent/:userId', LibraryController.findDeleteStudent)
router.delete('/destroyStudent/:studentCne', LibraryController.destroyStudent)
router.post('/addnewstudent', upload.single('avatar'), LibraryController.addNewStudent)
router.post('/searchUser', LibraryController.searchUser)

router.get('/userRule',auth, refreshUserToken, LibraryController.userRule)
router.get('/sidebar', LibraryController.sidebar)

router.get('/userUpdate',auth, refreshUserToken, LibraryController.updateDetail)
router.put('/updateUser/:studentId', LibraryController.updateUser)

router.get('/adminViewBook',authAdmin, refreshToken, LibraryController.viewBook)
router.get('/deleteBook/:book_id', LibraryController.findDeleteBook)
router.get('/updateBook/:book_id', LibraryController.findUpdateBook)
router.delete('/destroyBook/:bookId', LibraryController.destroyBook)
router.put('/updateBook', uploadImage.fields([{ name: 'image' },
  { name: 'bookpdf' }]), LibraryController.updateBook)

router.get('/adminCategory',authAdmin, refreshToken, LibraryController.adminCategory)
router.get('/category/:category', LibraryController.findCategory)
router.put('/updateCategory', LibraryController.updateCategory)

router.get('/adminAuthor',authAdmin, refreshToken, LibraryController.adminAuthor)
router.get('/author/:author', LibraryController.findAuthor)
router.put('/updateAuthor', LibraryController.updateAuthor)

router.get('/adminIssued',authAdmin, refreshToken, LibraryController.adminIssue)
router.get('/userRequest',auth, refreshUserToken, LibraryController.userRequest)
router.get('/adminChange',authAdmin, refreshToken, LibraryController.adminChange)
router.get('/adminViewRequest',authAdmin, refreshToken, LibraryController.adminRequest)

router.get('/adminBorrowBook', LibraryController.adminBorrowBook)

router.get('/logout', LibraryController.logout);
router.get('/logoutAdmin', LibraryController.logoutAdmin)

router.get('*', (req,res) => {
  res.redirect('/');
})

module.exports = router