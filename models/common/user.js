const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  _id: String,
  username: String,
  login: String,
  password: String,
  default: Boolean,
  status: String,
  rights: String
})

module.exports = mongoose.model('User', userSchema)