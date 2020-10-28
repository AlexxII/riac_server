const mongoose = require('mongoose')
const Schema = mongoose.Schema

const logicSchema = new Schema({
  _id: String,
  poll: String,
  path: String
})

module.exports = mongoose.model('Logics', logicSchema)