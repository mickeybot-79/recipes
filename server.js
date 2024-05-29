require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const cookieParser = require('cookie-parser')
const credentials = require('./middleware/credentials')
const mongoose = require('mongoose')
const connectDB = require('./config/dbConn')
const PORT = process.env.PORT || 3500

connectDB()

app.use(credentials)

//app.use(cors())
//app.use(cors(corsOptions))

// app.use(express.urlencoded({ extended: false }))
// app.use(express.json())

app.use(express.json({limit: "10mb", extended: true}))
app.use(express.urlencoded({limit: "10mb", extended: true, parameterLimit: 50000}))

app.use(cookieParser())

app.use('/register', require('./routes/auth'))
app.use('/auth', require('./routes/auth'))
app.use('/refresh', require('./routes/auth'))
app.use('/logout', require('./routes/auth'))
app.use('/recipes', require('./routes/recipes'))
app.use('/log', require('./routes/log'))
app.use('/temp', require('./routes/temp'))
app.use('/myrecipes', require('./routes/myrecipes'))
app.use('/users', require('./routes/users'))

mongoose.connection.once('open', () => {
   console.log('Connected to MongoDB')
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})
