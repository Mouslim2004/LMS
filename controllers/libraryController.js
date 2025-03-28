const Student = require('../models/user')
const Book = require('../models/book')
const Librarian  = require('../models/librarian')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')//is a compact and self-contained way of securely transmitting information between parties as a JSON object.
// It is widely used for authentication and authorization in web applications.
const {v4 : uuidv4} = require('uuid')
const mongoose = require('mongoose')

const adminLogin = (req,res) => {
  const message = req.flash('error')
  res.render('adminLogin', {message: message})
}

//This create a admin account for the librarian
async function createLibrarianAccount() {
  // Check if a librarian already exists
  const librarianCount = await Librarian.countDocuments();//This will give use the number of document in the librarian model
  if (librarianCount >= 1) {//if there is more than 1 account we will deny the create of the account, only one account should exist
    console.log('Multiple librarians detected!')
  }

  const hashedPassword = await bcrypt.hash("lms2024@&", 10);//As we said, using bcrypt hash password for security

  const existingLibrarian = await Librarian.findOne({ email: "adminlms@gmail.com" });//This will search for an email in the db
  if (!existingLibrarian) {//If email do not exist, we will create it
      const librarian = new Librarian({
          name: "Mr Librarian",
          email: "adminlms@gmail.com",
          password: hashedPassword,
      });
      await librarian.save();//then we will store it in our db
      console.log( 'Librarian account created successfully!');
  } else {
      console.log("Librarian account already exists!");
  }
}

createLibrarianAccount();//After we will call our function in order to alert the db and add the admin information

const adminLoginPost = async (req, res, next) => {
  try {

    // Validate form input
    const { email, password } = req.body;
    if (!email || !password) { // Use || to check if either field is empty
      req.flash('error', 'Please fill all the form!');
      return res.redirect('/admin/adminLogin'); // Stop execution with return
    }

    // Check if librarian exists
    const existingLibrarian = await Librarian.findOne({ email: email });
    if (existingLibrarian) {
      // Hash password and create new librarian
      const hashPassword = await bcrypt.compare(password, existingLibrarian.password);
      if(hashPassword){
        //we will store the admin information for authentication
        req.session.librarian = { id: existingLibrarian._id.toString(), email: existingLibrarian.email };
        let token = jwt.sign({name: existingLibrarian.name},'librarian@&2025', {expiresIn: '1h'})
        let refreshToken = jwt.sign({name: existingLibrarian.name},'librarianToken2025', {expiresIn: '24h'})
        console.log('Generated Token: ',token);
        console.log('Generated refreshToken: ',refreshToken);
        res.cookie('admin_token', token, { httpOnly: true, maxAge: 3600000 });//1 hour
        res.cookie('admin_refresh_token', refreshToken, { httpOnly: true, maxAge: 24 * 3600000 }); // 24 hours
        return res.redirect('/admin/adminDash');
      } else {
        req.flash('error', 'Password is incorrect!');
        return res.redirect('/admin/adminLogin');
      }
      
    } else {
      req.flash('error', 'Email is incorrect!');
      return res.redirect('/admin/adminLogin');
    }
  } catch (error) {
    console.error(error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/admin/adminLogin');
  }
};

const adminDash = async (req,res) => {
  
  try{
    const librarian = await Librarian.find()
    const book = await Book.find()
    const bookCategory = await Book.distinct('category')
    const bookAuthor = await Book.distinct('author')
    const stu = await Student.find()
    // console.log(book)

    // Calculate the number of students
    const numberOfStudents = stu.length;
    // console.log(numberOfStudents)

    // Calculate the number of issued books
    const issuedBooks = book.filter(b => b.isBorrowed).length;
    // console.log(issuedBooks)

    res.render('adminDash', {librarian:librarian, book: book, bookCategory, bookAuthor, numberOfStudents, issuedBooks})
  }catch(error){
    return res.status(500).json({ message: 'Failed to login', error });
  }
  
}



const adminBook =  async (req,res) => {
  const successMessage = req.flash('success');
  const errorMessage = req.flash('error');
  const librarian = await Librarian.find()
  res.render('adminBook', { successMessage, errorMessage, librarian: librarian })
}

const adminBookPost = async (req, res) => {
  try{
    const imageFile = req.files?.image?.[0]; // Access the first file under 'image'
    const bookPdfFile = req.files?.bookpdf?.[0]; // Access the first file under 'bookpdf'

    if (!imageFile || !bookPdfFile) {
      req.flash('error', 'Both image and book PDF files are required.');
      return res.redirect('/admin/adminBooks');
    }

    const chars =
    "0123456789abcdefghijklmnopqrstuvwxtz!@#&_ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const stringId = 8;
    let madeId = "";
    for (let index = 0; index < stringId; index++) {
      const randomNum = Math.floor(Math.random() * chars.length);
      madeId += chars.substring(randomNum, randomNum + 1);
    }


    let book = new Book({
      bookId : madeId,
      bookTitle : req.body.bookTitle,
      author : req.body.author,
      category : req.body.category,
      publishDate : req.body.publishDate,
      publisher : req.body.publisher,
      pseudo : req.body.pseudo,
      description : req.body.description,
      image: 'bookImage/' + imageFile.filename,
      bookpdf : 'bookImage/' + bookPdfFile.filename
    })

    await book.save()
    req.flash('success', 'Book added successfully!');
    res.redirect('/admin/adminBooks')    
  }catch(error){
    console.log(error.message)
    req.flash('error', 'Please fill all the form to add a book!');
    res.redirect('/admin/adminBooks');
  }
}


const regStudent = async (req,res) => {
  try{
    const student = await Student.find()
    const librarian = await Librarian.find()
    const message = req.flash('error')
    res.render('regStudent', {student: student, librarian: librarian, message: message})
  }catch(error){
    return res.status(500).json({ message: 'Failed to display user', error });
  }
  
}

const studentInfo = async (req, res) => {
  try{
    // if (!req.params.id) {
    //   return res.status(400).json({ message: "Student ID is required" });
    // }

    // if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    //   return res.status(400).json({ message: "Invalid student ID format" });
    // }
    const student = await Student.findById({_id : req.params.id}).populate("borrowedBooks.book"); //{_id : req.params.id}
   
    if(student){
      console.log(student)
      return res.json(student)
    } else {
      res.status(404).json({message: 'Student not found'})
    }
  }catch(error){
    console.log(error.message)
    res.status(500).json({message: 'Servor error'})
  }
}

const findDeleteStudent = async (req,res) => {
  try{
    const studentToDelete = await Student.findOne({_id: req.params.userId})
    if(studentToDelete){
      // console.log(studentToDelete)
      return res.status(200).json(studentToDelete)
    }else {
      res.status(404).json({message: 'Student to delete not found'})
    }

  }catch(error){
    console.log(error.message)
    res.status(500).json({message : 'An error occured'})
  }
}

const destroyStudent = async (req,res) => {
  try{
    const student = await Student.deleteOne({cne: req.params.studentCne})
    if(student.deletedCount === 1){
      console.log(`Successfully deleted one document with the cne: ${req.params.studentCne}`);
      return res.status(200).json({message: 'Student successfully deleted!'})
    } else {
      console.log('No document find with that cne')
      res.status(404).json({message: 'No document find with that cne'})
    }
  }catch(error){
    console.log(error.message)
    res.status(500).json({message: 'An error occured'})
  }
}

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mouslimombadi@gmail.com',
    pass: 'ayve emlp qtbu zhgc'
  }
});

const addNewStudent = async(req,res) => {
  try{
    const temporaryCode = uuidv4().slice(-8);
    const temporaryPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10)

    let student = new Student({
      cne: req.body.cne,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      temporaryCode: temporaryCode,
      temporaryPassword: hashedPassword,
      avatar: req.file ? 'profile/' + req.file.filename : null
    })

    await student.save()

    const mailOptions = {
      from: 'mouslimombadi@gmail.com' , // sender address
      to: student.email, // list of receivers, replace with your email
      subject: `Your new credentials`,
      text: `You have a new message from library Management System :
             \n\nYour Code : ${temporaryCode}
             \n\nYour Password : ${temporaryPassword}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Error sending email');
        }
        res.status(200).send('Email sent successfully');
    });

    req.flash('sucess', 'Student added successfully')
    res.status(200).json({message: 'Student added successfully'})

  }catch(error){
    console.log(error.message)
    req.flash('error', 'Please fill the form correctly')
    res.status(500).json({message: 'An error occured'})
  }
}

const sidebar = (req,res) => {
  res.render('sidebar-header')
}

// This part is dedicated for admin view book
const viewBook = async (req,res) => {
  const showBook = await Book.find()
  const librarian = await Librarian.find()
  res.render('adminViewBook', {showBook: showBook, librarian: librarian})
}

const findDeleteBook = async (req,res) => {
  try{
    const bookToDelete = await Book.findOne({_id: req.params.book_id})
    if(bookToDelete){
      // console.log(studentToDelete)
      return res.status(200).json(bookToDelete)
    }else {
      res.status(404).json({message: 'Book to delete not found'})
    }

  }catch(error){
    console.log(error.message)
    res.status(500).json({message : 'An error occured'})
  }
}

const findUpdateBook = async (req,res) => {
  try{
    const bookToUpdate = await Book.findOne({_id: req.params.book_id})
    if(bookToUpdate){
      // console.log(studentToDelete)
      return res.status(200).json(bookToUpdate)
    }else {
      res.status(404).json({message: 'Book to update not found'})
    }

  }catch(error){
    console.log(error.message)
    res.status(500).json({message : 'An error occured'})
  }
}

const destroyBook = async (req,res) => {
  try{
    const book = await Book.deleteOne({bookId: req.params.bookId})
    if(book.deletedCount === 1){
      console.log(`Successfully deleted one document with the id: ${req.params.bookId}`);
      return res.status(200).json({message: 'Book successfully deleted!'})
    } else {
      console.log('No document find with that id')
      res.status(404).json({message: 'No document find with that id'})
    }
  }catch(error){
    console.log(error.message)
    res.status(500).json({message: 'An error occured'})
  }
}

const updateBook = async (req,res) => {
  const {bookTitle, publisher, publishDate, pseudo, description} = req.body
  try{
    const imageFile = req.files?.image?.[0]; // Access the first file under 'image'
    const bookPdfFile = req.files?.bookpdf?.[0]; // Access the first file under 'bookpdf'
    const existingBook = await Book.findOne({bookTitle : bookTitle})
    let updateBookData ={
      bookTitle,
      publisher,
      publishDate,
      pseudo,
      description,
      image: imageFile ? 'bookImage/' + imageFile.filename : existingBook.image,
      bookpdf : bookPdfFile ? 'bookImage/' + bookPdfFile.filename : existingBook.bookpdf
    }
    const updateBook = await Book.findOneAndUpdate({bookTitle}, updateBookData, {new : true})
    if(updateBook){
      console.log(updateBook)
      return res.json(updateBook)
    } else {
      res.status(404).json({ message: 'Book not updated' });
    }
  }catch(error){
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}



//This part is dedicated for category page
const adminCategory = async (req,res) => {
  try{
    const book = await Book.distinct('category');
    const librarian = await Librarian.find()
    res.render('adminCategory',{book: book, librarian: librarian})
  }catch(error){
    return res.status(500).json({ message: 'Failed to display all the category', error });
  }
}

const findCategory = async (req,res) => {
  try{
    const category = await Book.findOne({category : req.params.category})
    if(category){
      return res.json(category)
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  }catch(error){
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

const updateCategory = async (req,res) => {
  const {category, newCategory} = req.body
  try{
    const updateCategory = await Book.findOneAndUpdate({category}, {category: newCategory}, {new : true})
    if(updateCategory){
      console.log(updateCategory)
      return res.json(updateCategory)
    } else {
      res.status(404).json({ message: 'Category not updated' });
    }
  }catch(error){
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

const adminAuthor = async (req,res) => {
  try{
    const book = await Book.distinct('author');
    const librarian = await Librarian.find()
    res.render('adminAuthor',{book: book, librarian: librarian})
  }catch(error){
    return res.status(500).json({ message: 'Failed to display all the author', error });
  }
  
}

const findAuthor = async (req,res) => {
  try{
    const author = await Book.findOne({author : req.params.author})
    if(author){
      return res.json(author)
    } else {
      res.status(404).json({ message: 'Author not found' });
    }
  }catch(error){
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

const updateAuthor = async (req,res) => {
  const {author, newAuthor} = req.body
  try{
    const updateAuthor = await Book.findOneAndUpdate({author}, {author: newAuthor}, {new : true})
    if(updateAuthor){
      console.log(updateAuthor)
      return res.json(updateAuthor)
    } else {
      res.status(404).json({ message: 'Author not updated' });
    }
  }catch(error){
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

const adminIssue = async (req,res) => {
  const librarian = await Librarian.find()
  const student = await Student.find().populate("borrowedBooks.book")
  res.render('adminIssue', {librarian: librarian, student: student})
}

const adminChange = async (req,res) => {
  const librarian = await Librarian.find()
  res.render('adminChange', {librarian})
}

const adminRequest = async (req,res) => {
  const librarian = await Librarian.find()
  const student = await Student.find().populate("requestedBooks.book")
  res.render('adminViewRequest', {librarian:librarian, student: student})
}

const adminGrantRequest = async (req,res) => {
  try{
    const {bookId, cne} = req.params

    const student = await Student.findOne({ cne }).populate("requestedBooks.book");
    // console.log("CNE : ", cne)
    // console.log("Retrieved Student:", JSON.stringify(student, null, 2));
    if(!student){
      throw new Error('Student not found')
    }

    if (!Array.isArray(student.requestedBooks)) {
      throw new Error('RequestedBooks is not an array');
    }

    const requestedBooks = student.requestedBooks.find(
      (reqBook) => reqBook.book.bookId.toString() === bookId
    )

    if(!requestedBooks){
      throw new Error('Request book not found')
    }

    student.requestedBooks = student.requestedBooks.filter( // student.requestedBooks
      (reqBook) => reqBook.book.bookId.toString() !== bookId
    )

    student.borrowedBooks.push({
      book:requestedBooks.book._id,//requestedBooks.book._id
      borrowedDate: new Date()
    })

    await student.save()

    const findBook = await Book.findOne({bookId : bookId})
    await Book.findByIdAndUpdate(findBook._id, { $push: { borrowedBy: student._id} , isBorrowed: true },{new: true});
    // await Book.findByIdAndUpdate(findBook._id, {isBorrowed: true});

    console.log('Book granted successfully')
    res.status(200).json({ message: 'Book granted successfully' });

  }catch(error){
    console.log('Error : ', error.message, error.stack)
    res.status(500).json({message: 'Failed to grant book'})
  }

}

const adminCancelRequest = async (req,res) => {
    const {bookId, cne} = req.params

    try{ 

    const student = await Student.findOne({ cne }).populate("requestedBooks.book");
    // console.log("CNE : ", cne)
    // console.log("Retrieved Student:", JSON.stringify(student, null, 2));
    if(!student){
      throw new Error('Student not found')
    }

    if (!Array.isArray(student.requestedBooks)) {
      throw new Error('RequestedBooks is not an array');
    }

    const requestedBookIndex = student.requestedBooks.findIndex(
      (reqBook) => reqBook.book.bookId.toString() === bookId
    )

    if(requestedBookIndex === -1){
      return res.status(404).json({ message: 'Requested book not found' });
    }

    // Remove the requested book from the array
    student.requestedBooks.splice(requestedBookIndex, 1);

    // Save the updated student document
    await student.save();

    res.status(200).json({ message: 'Requested book canceled successfully' });
  }catch(error){
    console.error('Error canceling requested book:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

const adminBorrowBook = async (req,res) => {
  res.render('adminBorrowBook')
}

const logout = (req,res) => {
  req.session.destroy();
  res.clearCookie('auth_token')
  res.redirect('/');
}

const logoutAdmin = (req,res) => {
  req.session.destroy();
  res.clearCookie('admin_token')
  res.redirect('/');
}
module.exports = {
  adminLogin,
  adminDash,
  adminBook,
  regStudent,
  sidebar,
  viewBook,
  adminCategory,
  adminAuthor,
  adminIssue,
  adminChange,
  adminRequest,
  logout,
  adminLoginPost,
  logoutAdmin,
  adminBookPost,
  findCategory,
  updateCategory,
  findAuthor,
  updateAuthor,
  studentInfo,
  findDeleteStudent,
  destroyStudent,
  addNewStudent,
  findDeleteBook,
  findUpdateBook,
  destroyBook,
  updateBook,
  adminBorrowBook,
  adminGrantRequest,
  adminCancelRequest
}