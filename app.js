const express = require('express')// Framework to handle HTTP requests and define routes.
const bodyParser = require('body-parser')//Middleware to handle and parse incoming request bodies (especially useful for POST and PUT requests).
const mongoose = require('mongoose')//Connects to MongoDB and provides a structured way to interact with your database.
const morgan = require('morgan')//Middleware for logging HTTP requests for debugging and monitoring purposes.
const session = require('express-session')////The express-session middleware 
//allows the creation and storage of the session data used for authentication or user preferences.
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')//A cookie is a small piece of data that a web server sends to a user's browser.
//  The browser stores the cookie and sends it back to the server with subsequent requests to the same server.
//  Cookies are commonly used for maintaining user sessions, storing user preferences, and tracking user activity on a website.
const app = express()

mongoose.connect('mongodb://localhost:27017/lms')//tells Mongoose to connect to a MongoDB database located 
//at localhost on port 27017 and use the database named pushdb.
//-vm C:\Program Files (x86)\Java\jre8\bin\javaw.exe

// Your Code :  d5b5b8bf Your Password : qnokjcmk --launcher.appendVmargs krk1slxl 
const db = mongoose.connection //This line gets the default connection that Mongoose has established with MongoDB.
db.on('error', () => {
  console.log('Connection to db failed!')
})
db.once('open', () => {
  console.log('Connection to db success!')
})

app.use(
  session({
    secret: 'mylibrary',
    resave: false,
    saveUninitialized: true
  })
)

app.use(flash());// connect-flash is a middleware that allows you to store temporary messages (flash messages)
//  in the session, so they’re available only on the next request.
app.use(cookieParser());//middleware in Node.js is used to parse and manage cookies in HTTP requests.
app.set('view engine', 'ejs')//EJS is a templating engine that allows you to generate HTML with dynamic data.
app.use(express.static('public'))//express.static('public') tells the app to look in the public folder for these files,
//so when a client requests /css/style.css, it will automatically look for it in public/css/style.css.

app.use(morgan('dev'))//Morgan logs details about incoming HTTP requests to the console,
// such as the request method (GET, POST), the URL, response status, and response time.
app.use(bodyParser.urlencoded({extended: false}))//This line tells the app to use the body-parser middleware to handle URL-encoded data (form submissions).
//It allows the app to parse data from HTML forms (submitted via POST requests) and access it via req.body.
app.use(bodyParser.json())//This line tells the app to use the body-parser middleware to handle JSON data.
//If a client sends {"name": "John", "age": 30}, you can access req.body.name and req.body.age.

const LibraryRoutes = require('./routes/libraryRoutes')
app.use('/',LibraryRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
  //This tells the Express application (app) to listen on a specific port for incoming HTTP requests.
})