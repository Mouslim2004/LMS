const { render } = require("ejs")


const index = (req,res) => {
  res.render('home')
}

const userSignup = (req,res) => {
  res.render('userSignup')
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
  regStudent
}