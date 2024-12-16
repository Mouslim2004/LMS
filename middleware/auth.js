const jwt = require('jsonwebtoken')

//3. The server validates the token to grant or deny access.
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

const refreshUserToken = (req, res, next) => {
  const refreshToken = req.cookies.auth_refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  try {
    const decoded = jwt.verify(refreshToken, 'mylibraryToken2025');
    const newToken = jwt.sign({ name: decoded.name }, 'mylibrary', { expiresIn: '1h' });

    res.cookie('auth_token', newToken, { httpOnly: true, maxAge: 3600000 }); // 1 hour
    // res.status(200).json({ message: 'Token refreshed' });
    next()
  } catch (error) {
    console.error('Invalid refresh token', error.message);
    // res.status(403).json({ message: 'Invalid refresh token' });
    res.status(403).redirect('/userLogin')
  }
};
module.exports = {auth, refreshUserToken}