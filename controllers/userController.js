const Student = require('../models/user')
const Book = require('../models/book')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')//is a compact and self-contained way of securely transmitting information between parties as a JSON object.
// It is widely used for authentication and authorization in web applications.
const mongoose = require('mongoose')

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
    res.redirect('/user/userLogin')
  }catch(error){
    console.log(error.message);
    req.flash('error', 'Please fill all the form.');
    res.redirect('/user/userSignup');
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
    return res.redirect('/user/userLogin')
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
      res.redirect('/user/userDash')
    } else {
      req.flash('error', 'Password is incorrect' )
      res.redirect('/user/userLogin')
    }
  } else {
    req.flash('error', 'Code is incorrect')
    res.redirect('/user/userLogin')
  }
  }catch(error){
    console.log(error.message);
    req.flash('error', 'Something went wrong. Please try again!')
    res.redirect('/user/userLogin')
  }
}


const userDash = async (req,res) => {
  if(!req.session.user){
    return res.redirect('/user/userLogin')
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

const userIssued = async (req,res) => {
  if(!req.session.user){
    return res.status(400).json({message: 'Unauthorized'});
  }
  const student = await Student.findById(req.session.user.id).populate("borrowedBooks.book");
  res.render('userIssued', {student})
}

const userBook = async (req,res) => {
  if(!req.session.user){
    return res.redirect('/user/userLogin')
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

const userRule = (req,res) => {
  res.render('userRule')
}

const updateDetail = async (req,res) => {
  if(!req.session.user){
    return res.redirect('/user/userLogin')
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

    const alreadyBorrowed = student.borrowedBooks.some(
      (request) => request.book.toString() === findBook._id.toString()
    )

    if(alreadyBorrowed){
      console.log('You have already borrowed this book')
      return res.status(400).json({message: 'You have already borrowed this book!'})
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

const logout = (req,res) => {
  req.session.destroy();
  res.clearCookie('auth_token')
  res.redirect('/');
}

module.exports = {
  userSignup,
  userLogin,
  userDash,
  userChange,
  userIssued,
  userBook,
  previewBook,
  userRule,
  updateDetail,
  userRequest,
  userSignupPost,
  userLoginPost,
  updateUser,
  toggleLike,
  userRequestBook,
  logout
}