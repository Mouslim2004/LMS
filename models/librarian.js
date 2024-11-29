const mongoose = require('mongoose')
const schema = mongoose.Schema

const LibrarianSchema = new schema({
  name:{type:String, default: 'adminlms'},
  email:{type:String,  required: true, unique: true},
  password:{type:String, required: true}
})

const Librarian = mongoose.model('librarian', LibrarianSchema);

module.exports = Librarian