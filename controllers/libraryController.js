

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

module.exports = {
  index,
  userSignup,
  userLogin,
  adminLogin,
  userDash,
  userChange
}