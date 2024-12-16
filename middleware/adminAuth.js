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

const refreshToken = (req, res, next) => {
  const refreshToken = req.cookies.admin_refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  try {
    const decoded = jwt.verify(refreshToken, 'librarianToken2025');
    const newToken = jwt.sign({ name: decoded.name }, 'librarian@&2025', { expiresIn: '1h' });

    res.cookie('admin_token', newToken, { httpOnly: true, maxAge: 3600000 }); // 1 hour
    // res.status(200).json({ message: 'Token refreshed' });
    next()
  } catch (error) {
    console.error('Invalid refresh token', error.message);
    // res.status(403).json({ message: 'Invalid refresh token' });
    res.status(403).redirect('/adminLogin')
  }
};


module.exports = { authAdmin, refreshToken }