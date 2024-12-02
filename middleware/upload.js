const path = require('path')
const multer = require('multer')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/profile'))
  },
  filename: (req, file, cb) => {
    const name = Date.now() + '-' + file.originalname
    cb(null, name)
  }
})

const upload = multer({
  storage: storage
})

const storageImage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname,'../public/bookImage'))
  },
  filename: (req, file, cb) => {
    const name = Date.now() + '-' + file.originalname
    cb(null, name)
  }
})

const uploadImage = multer({
  storage: storageImage
})

module.exports = {upload, uploadImage}