const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
  try{
    const token = req.cookies.auth_token;
    if(!token){
      return res.status(401).redirect('/userLogin')
    }
    const decode = jwt.verify(token, 'mylibrary')

    req.user = decode
    next()
  } catch(error){
    console.log(error.message)
    res.status(401).redirect('/userLogin')
  }
}

module.exports = auth