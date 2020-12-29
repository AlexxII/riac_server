const mongoose = require('mongoose')
const Schema = mongoose.Schema

const cityTypeSchema = new Schema({
  _id: String,
  title: String,
  order: Number,
  default: Boolean,
  active: Boolean,
})

module.exports = mongoose.model('Citytype', cityTypeSchema)