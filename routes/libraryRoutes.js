const express = require('express')
const router = express.Router()
const LibraryController = require('../controllers/libraryController')

router.get('/', LibraryController.index)
router.get('/userSignup', LibraryController.userSignup)
router.get('/userLogin', LibraryController.userLogin)
router.get('/adminLogin', LibraryController.adminLogin)
router.get('/userDash', LibraryController.userDash)
router.get('/userChange', LibraryController.userChange)
router.get('/userIssued', LibraryController.userIssued)
router.get('/adminDash', LibraryController.adminDash)
router.get('/userBooks', LibraryController.userBook)
router.get('/adminBooks', LibraryController.adminBook)

module.exports = router