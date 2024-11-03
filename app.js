const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const morgan = require('morgan')
const session = require('express-session')
const flash = require('connect-flash')
const app = express()

mongoose.connect('mongodb://localhost:27017/lms')

const db = mongoose.connection
db.on('error', () => {
  console.log('Connection to db failed!')
})
db.once('open', () => {
  console.log('Connection to db success!')
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})