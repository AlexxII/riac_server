const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  _id: String,
  username: String,
  login: String,
  password: String,
  status: String,
  rights: String
})

module.exports = mongoose.model('User', userSchema)