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
  storage: storage,
  fileFilter: function(req,file,callback){//This function is used to filter files based on their MIME type before they are uploaded.
    if(file.mimetype == "image/png" || file.mimetype == "image/jpg"){
      callback(null,true)
    } else {
      console.log('Only jpg & png file supported!')
      callback(null,false)
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 6
    //This option limits the size of the uploaded file to 6 MB (2 * 1024 * 1024 bytes).
    //If a file exceeds this size, it will be rejected.
  }
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