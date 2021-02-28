const mongoose = require('mongoose')
const Schema = mongoose.Schema

const pollFiltersSchema = new Schema({
  _id: String,
  type: String,
  filterId: String,
  code: String,
  order: Number,
  active: Boolean,
})

module.exports = mongoose.model('PollFilters', pollFiltersSchema)