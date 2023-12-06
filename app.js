const express = require('express')
const logger = require('morgan')
const cors = require('cors')
require("dotenv").config();

const authRouter = require("./routes/api/auth");
const contactsRouter = require('./routes/api/contacts')

const app = express()

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

app.use("/users", authRouter);
app.use('/api/contacts', contactsRouter)

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err, req, res, next) => {
  if (typeof req.file === "undefined") {
    res.status(400).json({ message: err.message });
  }
  res.status(err.status).json({ message: err.message });
})

module.exports = app
