const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose')

const { agecategories } = require('./constants/poll_constants')

mongoose.connect('mongodb://localhost:27017/poll', { useNewUrlParser: true });
const dbConnection = mongoose.connection
dbConnection.on('error', err => console.log(`Connsetcion error: ${err}`))
dbConnection.once('open', () => console.log('Connected to DB!'))
const AgeCategory = require('./models/polls/agecategory')

// добавление категории возраста респондентов
for (let i = 0; i < agecategories.length; i++) {
  try {
    AgeCategory.create({
      _id: uuidv4(),
      title: agecategories[i],
      order: i,
      default: true,
      active: true
    }, () => {
      // ноебходимо отсоединится от БД
      if (i === agecategories.length - 1) {
        mongoose.disconnect();                                                                      // отключение от базы данных
      }
    })
  } catch (e) {
    console.log('Ошибка при создании БД - категории населенных пунктов', e);
    mongoose.disconnect();                                                                          // отключение от базы данных
  }
}