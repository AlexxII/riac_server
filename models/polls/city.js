const mongoose = require('mongoose')
const Schema = mongoose.Schema

const citySchema = new Schema({
  _id: String,
  title: String,
  population: Number,
  category: String
})

module.exports = mongoose.model('Cities', citySchema)