const jwt = require('jsonwebtoken')

//3. The server validates the token to grant or deny access.
const authAdmin = (req, res, next) => {
  try{
    const token = req.cookies.admin_token;
    if(!token){
      return res.status(401).redirect('/adminLogin')
    }
    const decode = jwt.verify(token, 'librarian@&2025')

    req.user = decode
    next()
  } catch(error){
    console.log(error.message)
    res.status(401).redirect('/adminLogin')
  }
}

module.exports = authAdmin