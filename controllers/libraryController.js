const Student = require('../models/user')
const Book = require('../models/book')
const Librarian  = require('../models/librarian')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')//is a compact and self-contained way of securely transmitting information between parties as a JSON object.
// It is widely used for authentication and authorization in web applications.
const {v4 : uuidv4} = require('uuid')


const index = (req,res) => {
  res.render('home')
}

const userSignup = (req,res) => {
  const message = req.flash('error')
  res.render('userSignup', {message:message});
}

const userSignupPost = async (req,res,next) => {//this represent the register of the user
  try{
  const passwordHash = await bcrypt.hash(req.body.password, 10)//This will hash the password for more security by using bcrypt

    let student = new Student({ //This add a new user in the student model
      name: req.body.name,
      email: req.body.email,
      cne: req.body.cne,
      phone: req.body.phone,
      address: req.body.address,
      password: passwordHash,
      avatar: 'profile/' + req.file.filename
    })

    await student.save(); //After adding the user, we will store his document in the database using save() method

    //req.flash('error', 'Please fill all the form.');
    res.redirect('/userLogin')
  }catch(error){
    console.log(error.message);
    req.flash('error', 'Please fill all the form.');
    res.redirect('/userSignup');
  }
  
}

const userLogin = (req,res) => {
  const message = req.flash('error')
  res.render('userLogin', {message: message})
}

const userLoginPost = async (req, res) => {
  try{
  //These lines require the email and password from the body
  const temporaryCode = req.body.temporaryCode
  const temporaryPassword = req.body.temporaryPassword
  if(!temporaryCode || !temporaryPassword){
    req.flash('error', 'Please fill the form')
    return res.redirect('/userLogin')
  }

  const studentData = await Student.findOne({temporaryCode: temporaryCode}) //this verify if the user exist in the db

  if(studentData){ //If true
    const checkPassword = await bcrypt.compare(temporaryPassword, studentData.temporaryPassword);//then, We will check if the password is similar,
    //By using compare() method from bcrypt 
    if(checkPassword){//if password exist
      //we will store the user information to the session for authentication or user preferences
      req.session.user = {id: studentData._id.toString(), email: studentData.email}

      //JWT PART
      // 1. A server generates a JWT after verifying user credentials (e.g., during login).
      let token = jwt.sign({name: studentData.name},'mylibrary', {expiresIn: '1h'})
      //payload: An object containing the data you want to encode in the token
      //secretOrPrivateKey: A secret string or a private key used to sign the token
      //Option: An object with additional options, such as setting the token's expiration time
      let refreshToken = jwt.sign({name: studentData.name},'mylibraryToken2025', {expiresIn: '24h'})
      console.log('Generated Token: ',token);
      res.cookie('auth_token', token, { httpOnly: true, maxAge: 3600000 }); // Save token in a cookie
      res.cookie('auth_refresh_token', refreshToken, { httpOnly: true, maxAge: 24 * 3600000 });
      // 2. The client stores the token (e.g., in cookies) and includes it in the headers for subsequent requests to access protected routes.
      res.redirect('/userDash')
    } else {
      req.flash('error', 'Password is incorrect' )
      res.redirect('/userLogin')
    }
  } else {
    req.flash('error', 'Code is incorrect')
    res.redirect('/userLogin')
  }
  }catch(error){
    console.log(error.message);
    req.flash('error', 'Something went wrong. Please try again!')
    res.redirect('/userLogin')
  }
}

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
      return res.redirect('/adminLogin'); // Stop execution with return
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
        return res.redirect('/adminDash');
      } else {
        req.flash('error', 'Password is incorrect!');
        return res.redirect('/adminLogin');
      }
      
    } else {
      req.flash('error', 'Email is incorrect!');
      return res.redirect('/adminLogin');
    }
  } catch (error) {
    console.error(error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/adminLogin');
  }
};


const userDash = async (req,res) => {
  if(!req.session.user){
    return res.redirect('/userLogin')
  }
  try{
    const student = await Student.findById(req.session.user.id);
    res.render('userDash', {student})
  }catch(error){
    console.log(error.message)
    return res.status(500).json({ message: 'Failed to login', error });
  }
  
}

const userChange = (req,res) => {
  res.render('userChange')
}

const userIssued = (req,res) => {
  res.render('userIssued')
}

const adminDash = async (req,res) => {
  
  try{
    const librarian = await Librarian.find()
    res.render('adminDash', {librarian:librarian})
  }catch(error){
    return res.status(500).json({ message: 'Failed to login', error });
  }
  
}

const userBook = async (req,res) => {
  if(!req.session.user){
    return res.redirect('/userLogin')
  }
  try{
    const book = await Book.find();
    const student = await Student.findById(req.session.user.id)
    res.render('userBook', {book: book, student: student})
  }catch(error){
    return res.status(500).json({ message: 'Failed to display all the book', error });
  }
}

const toggleLike = async (req, res) => {
  const { bookId } = req.params; // Get the book ID from the route parameters
  const { studentId } = req.body; // Action can be 'like' or 'unlike'

  try {
    // Find the book by its bookId
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' }); // If the book doesn't exist
    }

    // Ensure `like` is initialized
    if (!Array.isArray(book.like)) {
      book.like = [];
    }

    // Check if the user has already liked the book
    const userIndex = book.like.indexOf(studentId);

    if (userIndex === -1) {
      // User hasn't liked yet, so add their ID to the likes array
      book.like.push(studentId);
    } else {
      // User has liked, so remove their ID from the likes array
      book.like.splice(userIndex, 1);
    }

    // Save the updated book document
    await book.save();

    // Respond with the updated like count and success message
    return res.status(200).json({ like: book.like.length });
  } catch (error) {
    console.error('Error toggling like:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


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
      return res.redirect('/adminBooks');
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
    res.redirect('/adminBooks')    
  }catch(error){
    console.log(error.message)
    req.flash('error', 'Please fill all the form to add a book!');
    res.redirect('/adminBooks');
  }
}


const previewBook = async (req,res) => {
  try{
    const bookDetails = await Book.findById(req.params.bookId)
    if(bookDetails){
      res.render('previewBook', {bookDetails : bookDetails})
    } else {
      res.status(404).json({message : 'Book not found'})
    }
  }catch(error){
    console.log(error.message)
    res.status(500).json({message: 'An error occured'})
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
    const student = await Student.findOne({_id : req.params.id})
    if(student){
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
      from: student.email, // sender address
      to: 'mouslimombadi@gmail.com', // list of receivers, replace with your email
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


const userRule = (req,res) => {
  res.render('userRule')
}

const sidebar = (req,res) => {
  res.render('sidebar-header')
}

const updateDetail = async (req,res) => {
  if(!req.session.user){
    return res.redirect('/userLogin')
  }
  try{
    const student = await Student.findById(req.session.user.id);
    res.render('userUpdate', {student})
  }catch(error){
    console.log(error.message)
    return res.status(500).json({ message: 'Failed to login', error });
  }
  
}

const updateUser = async (req,res) => {
  const _id = req.params.studentId
  try{
    const {name, email, phone, address, cne} = req.body
    const update = {
      name,
      email,
      phone,
      address,
      cne
    }
    const studentUpdate = await Student.findByIdAndUpdate(_id, {$set : update}, {new : true, runValidators: true})
    if(studentUpdate){
      return res.json(studentUpdate)
    } else {
      res.status(404).json({message: 'Failed to update student'})
    }
  }catch(error){
    console.log(error.message)
    res.status(500).json({message : 'An error occured'})
  }
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
  res.render('adminIssue', {librarian: librarian})
}


const userRequest = async(req,res) => {
  if(!req.session.user){
    return res.status(401).json({message: 'Unauthorized'})
  }
  const student = await Student.findById(req.session.user.id).populate("requestedBooks.book")
  // console.log(student)
  res.render('userRequest', {student})
}

const userRequestBook = async (req,res) => {
  if(!req.session.user){
    return res.status(401).json({message: 'Unauthorized'})
  }

  try{
    const student = await Student.findById(req.session.user.id)
    const findBook = await Book.findOne({"pseudo" : {$regex: new RegExp(req.body.book, "i")}})
    // console.log(req.session.user)
    // console.log('Book result : ', findBook)
    if(!findBook){
      return res.status(404).json({message : 'Book not found'})
    }
    const newRequest = {
      book: findBook._id,
      note: req.body.note
    }
    const alreadyRequest = student.requestedBooks.some(
      (request) => request.book.toString() === findBook._id.toString()
    )

    if(alreadyRequest){
      console.log('You have already request this book')
      return res.status(400).json({message: 'You have already request this book!'})
    }
    let updateStudent = "";
    if(student.requestedBooks.length < 3){
       updateStudent = await Student.findByIdAndUpdate(req.session.user.id, {$push : {requestedBooks: newRequest}}, {new: true})
    } else {
      console.log('You cannot request more than 3 books!')
      return res.status(500).json({message: 'You cannot request more than 3 books!'})
    }

    if(!updateStudent){
      return res.status(400).json({message: 'Student not found'})
    }
    res.status(200).json({requestBooks : updateStudent.requestedBooks});
  }catch(error){
    console.log('Error : ', error.message, error.stack)
    res.status(500).json({message: 'Failed to request Book'})
  }
}

const adminChange = async (req,res) => {
  const librarian = await Librarian.find()
  res.render('adminChange', {librarian})
}

const adminRequest = async (req,res) => {
  const librarian = await Librarian.find()
  res.render('adminViewRequest', {librarian})
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
  index,
  userSignup,
  userLogin,
  adminLogin,
  userDash,
  userChange,
  userIssued,
  adminDash,
  userBook,
  adminBook,
  previewBook,
  regStudent,
  userRule,
  sidebar,
  updateDetail,
  viewBook,
  adminCategory,
  adminAuthor,
  adminIssue,
  userRequest,
  adminChange,
  adminRequest,
  userSignupPost,
  userLoginPost,
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
  updateUser,
  toggleLike,
  userRequestBook
}