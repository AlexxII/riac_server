const mongoose = require('mongoose')
const Schema = mongoose.Schema

const citySchema = new Schema({
  _id: String,
  title: String,
  population: Number,
  type: String,
  category: String,
  order: Number,
  active: Boolean
})

module.exports = mongoose.model('Cities', citySchema)