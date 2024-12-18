const daysjs = require('dayjs')
const mongoose = require('mongoose')
const schema = mongoose.Schema

const today = daysjs()
const returnDate = today.add(7, 'days')
const returnBook = returnDate.format('YYYY-MM-DD');

const StudentSchema = new schema({
  name:{type: String, required: true},
  email: {type: String, required: true},
  cne: {type: String, required: true},
  avatar: {type: String, required: true},
  phone: {type: String, required: true},
  address: {type: String, required: true},
  password: {type: String, required: true},
  borrowedBooks: [{
    book: {type: mongoose.Schema.Types.ObjectId, ref: "Book"},
    borrowedDate: {type: Date, default: Date.now},
    returnDate: {type: Date, default: returnBook}
  }],
  requestedBooks: [{
    type: mongoose.Schema.Types.ObjectId, ref: "Book"
  }]
})

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
  like:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  isBorrowed: {type: Boolean, default: false},
  borrowedBy: [{
    type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null
  }]
})

const AuthorSchema = new schema({
  name: {type: String, required: true}
})

const CategorySchema = new schema({
  name: {type: String, required: true}
})

const Student = mongoose.model('Student', StudentSchema)
const Book = mongoose.model('Book', BookSchema)
const Author = mongoose.model('Author', AuthorSchema)
const Category = mongoose.model('Category', CategorySchema)

module.exports = {
  Student, Book, Author, Category
}