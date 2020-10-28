const mongoose = require('mongoose')
const Schema = mongoose.Schema

const citySchema = new Schema({
  _id: String,
  title: String
})

module.exports = mongoose.model('Cities', citySchema)