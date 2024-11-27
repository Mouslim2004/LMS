const mongoose = require('mongoose')
const schema = new mongoose.Schema

const LibrarianSchema = schema({
  email:{type:String, required: true},
  password:{type:String, required: true}
})

const Librarian = mongoose.model('librarian', LibrarianSchema);

module.exports = Librarian