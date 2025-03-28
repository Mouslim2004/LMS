const express = require('express')
const router = express.Router()
const LibraryController = require('../controllers/libraryController')
const {upload, uploadImage} = require('../middleware/upload')
const {authAdmin, refreshToken } = require('../middleware/adminAuth')

router.get('/adminLogin', LibraryController.adminLogin)
router.post('/adminLogin', LibraryController.adminLoginPost)

router.get('/adminDash',authAdmin, refreshToken, LibraryController.adminDash)

router.get('/adminBooks',authAdmin, refreshToken, LibraryController.adminBook)
router.post('/adminBooks',uploadImage.fields([{ name: 'image' },
  { name: 'bookpdf' }]), LibraryController.adminBookPost)

router.get('/regStudent',authAdmin, refreshToken, LibraryController.regStudent)
router.get('/student/:id', LibraryController.studentInfo)
router.get('/deleteStudent/:userId', LibraryController.findDeleteStudent)
router.delete('/destroyStudent/:studentCne', LibraryController.destroyStudent)
router.post('/addnewstudent', upload.single('avatar'), LibraryController.addNewStudent)

router.get('/sidebar', LibraryController.sidebar)

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

router.get('/adminChange',authAdmin, refreshToken, LibraryController.adminChange)

router.get('/adminViewRequest',authAdmin, refreshToken, LibraryController.adminRequest)
router.post('/grant-request/:bookId/:cne', LibraryController.adminGrantRequest)
router.post('/cancel-request/:bookId/:cne', LibraryController.adminCancelRequest)

router.get('/adminBorrowBook', LibraryController.adminBorrowBook)

router.get('/logout', LibraryController.logout);
router.get('/logoutAdmin', LibraryController.logoutAdmin)

module.exports = router