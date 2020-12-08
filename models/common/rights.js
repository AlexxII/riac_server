const mongoose = require('mongoose')
const Schema = mongoose.Schema

const rightsSchema = new Schema({
  _id: String,
  title: String,
  order: Number,
  default: Boolean,
  root: Boolean,
  active: Boolean
})

module.exports = mongoose.model('Rights', rightsSchema)