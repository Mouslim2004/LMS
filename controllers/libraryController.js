const { Student } = require('../models/user')
const bcrypt = require('bcrypt')
const flash = require('connect-flash')
const { render } = require("ejs")


const index = (req,res) => {
  res.render('home')
}

const userSignup = (req,res) => {
  const message = req.flash('error')
  res.render('userSignup', {message});
}

const userSignupPost = async (req,res,next) => {
  try{
  const passwordHash = await bcrypt.hash(req.body.password, 10)

    let student = new Student({
      name: req.body.name,
      email: req.body.email,
      cne: req.body.cne,
      phone: req.body.phone,
      address: req.body.address,
      password: passwordHash,
      avatar: 'profile/' + req.file.filename
    })

    await student.save();

    res.render('userLogin')
  }catch(error){
    console.log(error.message);
    req.flash('error', 'Please fill all the form.');
    res.redirect('/userSignup');
  }
  
}

const userLogin = (req,res) => {
  res.render('userLogin')
}

const adminLogin = (req,res) => {
  res.render('adminLogin')
}

const userDash = (req,res) => {
  res.render('userDash')
}

const userChange = (req,res) => {
  res.render('userChange')
}

const userIssued = (req,res) => {
  res.render('userIssued')
}

const adminDash = (req,res) => {
  res.render('adminDash')
}

const userBook = (req,res) => {
  res.render('userBook')
}

const adminBook = (req,res) => {
  res.render('adminBook')
}

const previewBook  = (req,res) => {
  res.render('previewBook')
}

const regStudent = (req,res) => {
  res.render('regStudent')
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

const viewBook = (req,res) => {
  res.render('adminViewBook')
}

const adminCategory = (req,res) => {
  res.render('adminCategory')
}

const adminAuthor = (req,res) => {
  res.render('adminAuthor')
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
  userSignupPost
}