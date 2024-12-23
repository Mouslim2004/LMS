// const daysjs = require('dayjs')
const mongoose = require('mongoose')
const schema = mongoose.Schema

// const today = daysjs()
// const returnDate = today.add(7, 'days')
// const returnBook = returnDate.format('YYYY-MM-DD');

const BookSchema = new schema({
  image:{type: String, required: true},
  bookpdf:{type: String, required:true},
  bookId:{type: String, required:true, unique: true},
  bookTitle:{type: String, required: true},
  author:{type: String, required: true},
  category:{type: String, required: true},
  publishDate:{type: String, required: true},
  publisher:{type: String, required: true},
  pseudo:{type: String, required: true},
  description: {type: String, required: true},
  like:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: [] }],
  isBorrowed: {type: Boolean, default: false},
  borrowedBy: [{
    type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null
  }]
})

const Book = mongoose.model('Book', BookSchema)

module.exports = Book