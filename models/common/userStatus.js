const mongoose = require('mongoose')
const Schema = mongoose.Schema

const statusSchema = new Schema({
  _id: String,
  title: String,
  order: Number,
  default: Boolean,
  active: Boolean
})

module.exports = mongoose.model('Userstatus', statusSchema)