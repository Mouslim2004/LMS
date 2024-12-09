const { Student, Book } = require('../models/user')
const Librarian  = require('../models/librarian')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')//is a compact and self-contained way of securely transmitting information between parties as a JSON object.
// It is widely used for authentication and authorization in web applications.
const flash = require('connect-flash')
const { render } = require("ejs")


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
  const email = req.body.email
  const password = req.body.password
  if(!email || !password){
    req.flash('error', 'Please fill the form')
    return res.redirect('/userLogin')
  }

  const studentData = await Student.findOne({email: email}) //this verify if the user exist in the db

  if(studentData){ //If true
    const checkPassword = await bcrypt.compare(password, studentData.password);//then, We will check if the password is similar,
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
      console.log('Generated Token: ',token);
      res.cookie('auth_token', token, { httpOnly: true, maxAge: 3600000 }); // Save token in a cookie
      // 2. The client stores the token (e.g., in cookies) and includes it in the headers for subsequent requests to access protected routes.
      res.redirect('/userDash')
    } else {
      req.flash('error', 'Password is incorrect' )
      res.redirect('/userLogin')
    }
  } else {
    req.flash('error', 'Email is incorrect')
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
        console.log('Generated Token: ',token);
        res.cookie('admin_token', token, { httpOnly: true, maxAge: 3600000 });
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
    res.render('adminDash', {librarian})
  }catch(error){
    return res.status(500).json({ message: 'Failed to login', error });
  }
  
}

const userBook = async (req,res) => {
  try{
    const book = await Book.find();
    res.render('userBook', {book: book})
  }catch(error){
    return res.status(500).json({ message: 'Failed to display all the book', error });
  }
}

const adminBook = (req,res) => {
  const successMessage = req.flash('success');
  const errorMessage = req.flash('error');
  res.render('adminBook', { successMessage, errorMessage })
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
const previewBook  = (req,res) => {
  res.render('previewBook')
}

const regStudent = async (req,res) => {
  try{
    const student = await Student.find()
    res.render('regStudent', {student: student})
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

const userRule = (req,res) => {
  res.render('userRule')
}

const sidebar = (req,res) => {
  res.render('sidebar-header')
}

const updateDetail = (req,res) => {
  res.render('userUpdate')
}

const viewBook = async (req,res) => {
  const showBook = await Book.find()
  res.render('adminViewBook', {showBook: showBook})
}

const adminCategory = async (req,res) => {
  try{
    const book = await Book.distinct('category');
    res.render('adminCategory',{book: book})
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
    res.render('adminAuthor',{book: book})
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

const adminIssue = (req,res) => {
  res.render('adminIssue')
}

const userRequest = (req,res) => {
  res.render('userRequest')
}

const adminChange = (req,res) => {
  res.render('adminChange')
}

const adminRequest = (req,res) => {
  res.render('adminViewRequest')
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
  studentInfo
}