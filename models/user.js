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

const Student = mongoose.model('Student', StudentSchema)

module.exports = Student