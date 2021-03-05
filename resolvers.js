const { AuthenticationError } = require('apollo-server-express')
const { v4: uuidv4 } = require('uuid');
const fs = require('fs')

const Poll = require('./models/polls/poll')
const Question = require('./models/polls/question')
const Answer = require('./models/polls/answer')
const PollFile = require('./models/polls/pollfile')
const Topic = require('./models/polls/topic')
const Logic = require('./models/polls/logic')
const City = require('./models/common/city');
const CityCategory = require('./models/common/citycategory')
const AgeCategory = require('./models/polls/agecategory')
const User = require('./models/common/user');
const UserStatus = require('./models/common/userStatus');
const UserRights = require('./models/common/rights');
const Respondent = require('./models/polls/respondent');
const Result = require('./models/polls/result')
const CustomFilter = require('./models/polls/customfilter')

const { GraphQLScalarType } = require('graphql');
const moment = require('moment');

const sex = [
  {
    id: 'fccd212d-dbfa-4c3c-aa4a-e876e8ce18d9',
    title: 'мужской',
    order: 1
  },
  {
    id: '5be3a15b-a9a0-4d91-ac29-ae7ce4c15f8c',
    title: 'женский',
    order: 2
  }
]

module.exports = {
  Query: {
    users: async () => await User.find({ default: { $ne: true } }).select('id username login status rights').sort('order'),
    // users: () => User.find().select('id username login status rights'),
    currentUser: (_, __, context) => context.getUser(),
    userRights: async () => await UserRights.find({ root: { $ne: true } }).sort('order'),
    userStatus: async () => await UserStatus.find({}).sort('order'),

    polls: async () => await Poll.find({ active: { $ne: false } }).sort('startDate'),
    archivePolls: async () => await Poll.find({ active: { $ne: true } }).sort('startDate'),
    poll: async (_, args) => await Poll.findById(args.id),
    questions: async () => {
      return await Question.find({});
    },
    answers: async () => {
      return await Answer.find({});
    },
    logics: async () => {
      return await Logic.find({})
    },
    cities: async () => {
      return await City.find({})
    },
    intervievers: async () => {
      return await User.find({ default: { $ne: true } })
    },
    sex: () => {
      return sex
    },
    ageCategoriesAll: async () => await AgeCategory.find({}).sort('order'),
    ageCategories: async () => await AgeCategory.find({ active: { $ne: false } }).sort('order'),
    cityCategoriesAll: async () => await CityCategory.find({}).sort('order'),
    cityCategories: async () => await CityCategory.find({ active: { $ne: false } }).sort('order'),
    pollCities: (_, args) => {
      return City.find({})
    },
    question: (_, args) => Question.findById(args.id),
    logicById: (_, args) => Logic.findById(args.id),
    pollLogic: async (_, args) => {
      const res = await Logic.findOne({ "poll": args.id }).exec()
      return res
    },
    topics: async () => await Topic.find({}),
    respondent: async (_, args) => {
      const res = await Respondent.findOne({ "_id": args.id }).exec()
      return res
    },
    customFilters: async () => await CustomFilter.find({}).sort('order'),
    pollResults: async (_, args) => {
      return await Respondent.find({ "poll": args.id }).exec()
      // let res = await Respondent.find({ "poll": args.id }).exec()
      const poll = args.id;
      // генерация пула городов
      const qCities = await City.find({}).select("_id")
      const cities = qCities.map(city => city.id)
      const citiesCount = cities.length
      // генерация пула пользователей
      const qUsers = await User.find({}).select("_id")
      const users = qUsers.map(user => user.id)
      const usersCount = users.length
      const mainCount = 0;
      for (let i = 0; i < mainCount; i++) {
        let data = []
        const rand = randomInteger(12, 18)
        for (let j = 0; j < rand; j++) {
          data.push(uuidv4())
        }
        res.push({
          data,
          id: uuidv4(),
          poll,
          user: users[randomInteger(0, usersCount - 1)],
          city: cities[randomInteger(0, citiesCount - 1)],
          _v: 0
        })
      }
      return res
    }
  },
  Mutation: {
    addNewUser: async (_, args) => {
      const user = {
        _id: uuidv4(),
        username: args.user.username,
        login: args.user.login,
        password: args.user.password,
        status: args.user.status,
        rights: args.user.rights,
        default: false,
        active: true
      }
      const res = await User.create(user)
      return res
      /*
            const res = await User.findOne({ "username": username }).exec()
            if (res) {
              throw new Error('Пользователь с таким ИМЕНЕМ уже существует');
            } else {
              const newUser = {
                _id: uuidv4(),
                username,
                password
              };
              context.User.create(newUser)
              return { user: newUser }
            }
      */

    },
    deleteUsers: async (_, args) => {
      // TODO: УДАЛИТЬ или выставить флаг active -> false
      const users = args.users
      let result = []
      for (let i = 0; i < users.length; i++) {
        const userId = users[i]
        const user = await User.findOne({ "_id": userId })
        if (!user.root) {
          user.deleteOne()
          result.push(user)
        }
      }
      return result
    },
    updateUser: async (_, args) => {
      const userId = args.id
      const data = args.data
      const user = await User.findByIdAndUpdate(userId, data, { new: true })
      return user
    },
    resetPassword: async (_, args) => {
      const userId = args.id
      const password = args.password
      const user = await User.findByIdAndUpdate(userId, { password: password }, { new: true })
    },
    signin: async (_, { login, password }, context) => {
      const { user } = await context.authenticate('graphql-local', { login, password });
      if (!user) {
        throw new AuthenticationError('Такого пользователя не существует');
      } else {
        await context.login(user);
        return { user }
      }
    },
    logout: (_, __, context) => context.logout(),
    newCity: async (_, args) => {
      const allCities = await City.find({}).sort('order')
      const maxOrder = allCities[allCities.length - 1].order
      const city = {
        ...args,
        _id: uuidv4(),
        order: maxOrder + 1
      }
      const res = await City.create(city)
      return res
    },
    newCities: async (_, args) => {
      const lCities = args.cities.length
      const cities = args.cities
      const categories = await CityCategory.find({}).sort('order')
      let result = []
      for (let i = 0; i < lCities; i++) {
        const category = categories[+cities[i].category]
        if (category !== undefined) {
          const city = {
            ...cities[i],
            category: category.id,
            _id: uuidv4()
          }
          const res = await City.create(city)
          result.push(res)
        } else {
          return false
        }
      }
      return result
    },
    cityEdit: async (_, args) => {
      const filter = { _id: args.id }
      const update = {
        ...args
      }
      let city = await City.findOneAndUpdate(filter, update, {
        new: true
      })
      return city
    },
    deleteCity: async (_, args) => {
      const city = await City.findOne({ _id: args.id })
      const res = await city.deleteOne()
      return res
    },
    saveNewCityCategory: async (_, args) => {
      const allCategories = await CityCategory.find({}).sort('order')
      let maxOrder = 0
      if (allCategories.length) {
        maxOrder = allCategories[allCategories.length - 1].order
      }
      const category = {
        _id: uuidv4(),
        title: args.title,
        order: maxOrder + 1,
        default: false,
        active: true
      }
      const res = await CityCategory.create(category)
      return res
    },
    updateCityCategory: async (_, args) => {
      const filter = { _id: args.id }
      const update = {
        ...args
      }
      let category = await CityCategory.findOneAndUpdate(filter, update, {
        new: true
      })
      return category
    },
    saveCityCategoryOrder: async (_, args) => {
      const categories = args.categories
      const cLength = categories.length
      let result = []
      for (let i = 0; i < cLength; i++) {
        const cId = categories[i].id
        const category = await CityCategory.findOne({ '_id': cId })
        category.order = categories[i].order
        await category.save()
        result.push(category)
      }
      return await result
    },
    deleteCityCategory: async (_, args) => {
      const city = await CityCategory.findOne({ _id: args.id })
      const res = await city.deleteOne()
      return res
    },
    changeCityCategoryStatus: async (_, args) => {
      const filter = { _id: args.id }
      const update = {
        active: args.status
      }
      const category = await CityCategory.findOneAndUpdate(filter, update, {
        new: true
      })
      return category
    },
    saveNewAgeCategory: async (_, args) => {
      const allCategories = await AgeCategory.find({}).sort('order')
      let maxOrder = 0
      if (allCategories.length) {
        maxOrder = allCategories[allCategories.length - 1].order
      }
      const category = {
        _id: uuidv4(),
        title: args.title,
        order: maxOrder + 1,
        default: false,
        active: true
      }
      const res = await AgeCategory.create(category)
      return res
    },
    updateAgeCategory: async (_, args) => {
      const filter = { _id: args.id }
      const update = {
        ...args
      }
      let category = await AgeCategory.findOneAndUpdate(filter, update, {
        new: true
      })
      return category
    },
    deleteAgeCategory: async (_, args) => {
      const age = await AgeCategory.findOne({ _id: args.id })
      const res = await age.deleteOne()
      return res
    },
    changeAgeCategoryStatus: async (_, args) => {
      const filter = { _id: args.id }
      const update = {
        active: args.status
      }
      const category = await AgeCategory.findOneAndUpdate(filter, update, {
        new: true
      })
      return category
    },
    saveAgeCategoryOrder: async (_, args) => {
      const ages = args.ages
      const cLength = ages.length
      let result = []
      for (let i = 0; i < cLength; i++) {
        const cId = ages[i].id
        const category = await AgeCategory.findOne({ '_id': cId })
        category.order = ages[i].order
        await category.save()
        result.push(category)
      }
      return await result
    },
    // фильтрация 
    saveNewCustomFilter: async (_, args) => {
      const allFilters = await CustomFilter.find({}).sort('order')
      let maxOrder = 0
      if (allFilters.length) {
        maxOrder = allFilters[allFilters.length - 1].order
      }
      const filter = {
        _id: uuidv4(),
        title: args.title,
        order: maxOrder + 1,
        default: false,
        active: true
      }
      const res = await CustomFilter.create(filter)
      return res
    },
    updateCustomFilter: async (_, args) => {
      const filter = { _id: args.id }
      const update = {
        ...args
      }
      let cusomFilter = await CustomFilter.findOneAndUpdate(filter, update, {
        new: true
      })
      return cusomFilter
    },
    changeCustomFilterStatus: async (_, args) => {
      const filter = { _id: args.id }
      const update = {
        active: args.status
      }
      const cusomFilter = await CustomFilter.findOneAndUpdate(filter, update, {
        new: true
      })
      return cusomFilter
    },
    deleteCustomFilter: async (_, args) => {
      const custom = await CustomFilter.findOne({ _id: args.id })
      const res = await custom.deleteOne()
      return res
    },
    saveCustomFilterOrder: async (_, args) => {
      const filters = args.filters
      const cLength = filters.length
      let result = []
      for (let i = 0; i < cLength; i++) {
        const cId = filters[i].id
        const customFilter = await CustomFilter.findOne({ '_id': cId })
        customFilter.order = filters[i].order
        await customFilter.save()
        result.push(customFilter)
      }
      return await result
    },
    savePollFilters: async (_, args) => {
      console.log(args.poll);
    },
    addPoll: async (_, args) => {
      const questions = args.questions
      const topics = args.topic
      const logic = args.logic
      const qLength = questions.length
      let questionsPool = []
      const pollId = uuidv4()
      for (let i = 0; i < qLength; i++) {
        const answers = questions[i].answers
        lAnswers = answers.length
        let answersPool = []
        for (let i = 0; i < lAnswers; i++) {
          const answer = {
            _id: uuidv4(),
            poll: pollId,
            title: answers[i].title,
            code: answers[i].code,
            order: answers[i].order,
            type: answers[i].types
          }
          Answer.create(answer)
          answersPool.push(answer._id)
        }
        const question = {
          _id: uuidv4(),
          title: questions[i].title,
          limit: questions[i].limit,
          order: questions[i].order,
          type: questions[i].type,
          topic: questions[i].topic,
          poll: pollId,
          answers: answersPool
        }
        Question.create(question)
        questionsPool.push(question._id)
      }
      const pollData = {
        _id: pollId,
        ...args.poll,
        created: new Date(),
        lastModified: new Date(),
        deleted: false,
        questions: questionsPool
      }
      const poll = await Poll.create(pollData)
      for (let i = 0; i < topics.length; i++) {
        const topicData = {
          _id: topics[i].id,
          title: topics[i].title
        }
        const topic = Topic.create(topicData)
      }
      // Сохранение кофигурации в файл
      const newLineChar = process.platform === 'win32' ? '\r\n' : '\n';
      let text = ''
      for (let key in logic) {
        if (Array.isArray(logic[key])) {
          text += `[${key}]${newLineChar}`
          text += `answers = ${logic[key]}${newLineChar}`
          text += ` ${newLineChar}`
        } else {
          const obj = logic[key]
          let suffix = 1
          for (let k in obj) {
            text += `[${key}_${suffix}]${newLineChar}`
            text += `answers = ${k}${newLineChar}`
            text += `exclude = ${obj[k].restrict}${newLineChar}`
            text += `critical = 1${newLineChar}`
            text += ` ${newLineChar}`
            suffix++
          }
        }
      }
      // добавление шапки в конфиг файл
      text += '[header]'
      text += `${newLineChar}`
      text += '"АО 1508117'
      text += `${newLineChar}`
      text += "==/ОПРОС"
      text += `${newLineChar}`
      text += "00/{code}"
      text += `${newLineChar}`
      text += "02/{date}"
      text += `${newLineChar}`
      text += "UN/{int}"
      text += `${newLineChar}`
      text += '04/{city}"'
      const t = +new Date
      const logicFile = `/files/polls/pollconfig_${t}.ini`
      fs.writeFileSync(`.${logicFile}`, text)
      const logicData = {
        _id: uuidv4(),
        poll: pollId,
        path: logicFile
      }
      const res = await Logic.create(logicData)
      return poll
    },
    setPollCity: async (_, args) => {
      const pollId = args.id
      const cities = args.cities
      let poll = await Poll.findOne({ '_id': pollId })
      poll.cities.push(...cities)
      await poll.save()
      return poll
    },
    deleteCityFromActive: async (_, args) => {
      const pollId = args.id
      const cities = args.cities
      let poll = await Poll.findOne({ '_id': pollId })
      poll.cities = poll.cities.filter(id => !cities.includes(id))
      await poll.save()
      return poll
    },
    savePollStatus: async (_, args) => {
      const pollId = args.id
      const status = args.active
      return await Poll.findByIdAndUpdate({ "_id": pollId }, { "active": status }, { new: true })
    },
    deletePoll(_, args) {
      const pollId = args.id
      Poll.findById(pollId, function (err, result) {
        if (err) {
          console.log(err);
        } else {
          const questions = result.questions
          const qLength = questions.length
          for (let i = 0; i < qLength; i++) {
            const qId = questions[i]
            Question.findById(qId, function (err, result) {
              if (err) {
                console.log(err)
              } else {
                const answers = result.answers
                const aLength = answers.length
                for (let i = 0; i < aLength; i++) {
                  const aId = answers[i]
                  Answer.deleteOne({ _id: aId }, function (err) { });
                }
                result.deleteOne()
              }
            })
          }
          Logic.findOne({ "poll": pollId }, function (err, result) {
            const filePath = `.${result.path}`
            try {
              fs.unlinkSync(filePath)
              result.deleteOne()
              //file removed
            } catch (err) {
              console.error(err)
            }
          })
          result.deleteOne()
        }
      })
    },
    newLimit: async (_, args) => {
      const questionId = args.id
      const limit = args.limit
      return await Question.findByIdAndUpdate({ "_id": questionId }, { "limit": limit }, { new: true })
    },
    newOrder: async (_, args) => {
      const questions = args.neworder
      const qLength = questions.length
      let answer = true
      let result = []
      for (let i = 0; i < qLength; i++) {
        const qId = questions[i].id
        const question = await Question.findOne({ '_id': qId })
        question.order = questions[i].order
        await question.save()
        result.push(question)
      }
      return await result
    },
    saveConfig(_, args) {
      const filePath = args.path
      const text = args.text
      fs.writeFileSync(`.${filePath}`, text)
      return true
    },
    saveResult: async (_, args) => {
      const questions = args.data
      let resultPool = []
      const respondentId = uuidv4()
      for (let i = 0; i < questions.length; i++) {
        const questionId = questions[i].id
        const answers = questions[i].data
        for (let j = 0; j < answers.length; j++) {
          const result = {
            _id: uuidv4(),
            respondent: respondentId,
            question: questionId,
            answer: answers[j].answer,
            code: answers[j].code,
            text: answers[j].text
          }
          Result.create(result)
          resultPool.push(result._id)
        }
      }
      const resp = {
        _id: respondentId,
        poll: args.poll,
        city: args.city,
        user: args.user,
        created: new Date(),
        lastModified: new Date(),
        processed: false,
        data: resultPool
      }
      const res = await Respondent.create(resp)
      if (res) {
        return true
      } else {
        return false
      }
    },
    updateResult: async (_, args) => {
      const questions = args.data
      const respondentId = args.id
      const resultPool = []
      for (let i = 0; i < questions.length; i++) {
        const questionId = questions[i].id
        const answers = questions[i].data
        for (let j = 0; j < answers.length; j++) {
          const result = {
            _id: uuidv4(),
            respondent: respondentId,
            question: questionId,
            answer: answers[j].answer,
            code: answers[j].code,
            text: answers[j].text
          }
          Result.create(result)
          resultPool.push(result._id)
        }
      }
      let respondent = await Respondent.findOne({ "_id": respondentId })
      respondent.data = resultPool,
        respondent.lastModified = new Date()
      const res = await respondent.save()
      if (res) {
        return true
      } else {
        return false
      }
    },
    deleteResults: async (_, args) => {
      const respondents = args.results
      const returnResult = []
      for (let i = 0; i < respondents.length; i++) {
        const rID = respondents[i]
        const respondent = await Respondent.findOne({ "_id": rID })
        const results = respondent.data
        const rLength = results.length
        for (let i = 0; i < rLength; i++) {
          const result = Result.findOne({ "_id": results[i] })
          await result.deleteOne()
        }
        returnResult.push(respondent)
        await respondent.deleteOne()
      }
      return returnResult
    }
  },
  User: {
    status: async (parent) => {
      const result = await UserStatus.find({ "_id": parent.status })
      return result[0]
    },
    rights: async (parent) => {
      const result = await UserRights.find({ "_id": parent.rights })
      return result[0]
    }
  },
  Poll: {
    questions: async (parent) => {
      return await Question.find({ "poll": parent._id }).sort('order')
    },
    results: async (parent) => {
      return await Respondent.find({ "poll": parent._id })
    },
    files: async (parent) => {
      return await PollFile.find({ "_id": { $in: parent.files } })
    },
    liter: (parent) => {
      const reg = /\D{3}/
      return parent.code.match(reg)[0]
    },
    questionsCount: (parent) => {
      return parent.questions.length
    },
    answersCount: async (parent) => {
      return await Answer.find({ "poll": parent._id }).count()
    },
    cities: async (parent) => {
      return await City.find({ "_id": { $in: parent.cities } })
    },
    color: () => 'red',
    logic: async (parent) => {
      return await Logic.findOne({ "poll": parent._id })
    },
    filters: async (parent) => {
      return parent.filters
      //   age: [
      //     {
      //       id: '085386b5-5a8b-4427-8e62-a48e5c5fc743',
      //       code: '120',
      //       active: true
      //     },
      //     {
      //       id: '8081c304-a3cb-456a-b135-50131fcc4828',
      //       code: '121',
      //       active: true
      //     }
      //   ],
      //   sex: [
      //     {
      //       id: 'fccd212d-dbfa-4c3c-aa4a-e876e8ce18d9',
      //       code: '500',
      //       active: true
      //     },
      //     {
      //       id: '5be3a15b-a9a0-4d91-ac29-ae7ce4c15f8c',
      //       code: '501',
      //       active: false
      //     }
      //   ],
      //   custom: null
      // }
      // return await parent.filters ? parent.filters : null
    },
    startDate: parent => {
      return moment(parent.startDate).format('DD.MM.YYYY')
    },
    endDate: (parent) => {
      return moment(parent.endDate).format('DD.MM.YYYY')
    },
    resultsCount: async (parent) => {
      return await Respondent.find({ "poll": parent.id }).count()
    }
  },
  Question: {
    answers: async (parent) => {
      return await Answer.find({ "_id": { $in: parent.answers } }).sort('order')
    },
    topic: async (parent) => {
      const rr = await Topic.findOne({ "_id": parent.topic })
      return rr
    },
    codesPool: async (parent) => {
      const answers = await Answer.find({ "_id": { $in: parent.answers } }).sort('order')
      const codePool = answers.map(answer => answer.code)
      return codePool
    }
  },
  Answer: {
    results: async (parent) => {
      return await Result.find({ "answer": parent._id })
    }
  },
  Respondent: {
    poll: async (parent) => {
      return await Poll.findById(parent.poll)
    },
    city: async (parent) => {
      return await City.findById(parent.city)
    },
    user: async (parent) => {
      return await User.findById(parent.user)
    },
    created: (parent) => {
      return moment(parent.created).format('DD.MM.YYYY')
    },
    lastModified: (parent) => {
      return moment(parent.lastModified).format('DD.MM.YYYY')
    },
    result: async (parent) => {
      return await Result.find({ "_id": { $in: parent.data } })
    }
  },
  Result: {
    question: async (parent) => {
      return await Question.findById(parent.question).sort("order")
    },
    respondent: async (parent) => {
      return await Respondent.findOne({ "_id": parent.respondent })
    },
    answer: async (parent) => {
      // return await Answer.findOne({ "_id": parent.answer })
      return await Answer.findById(parent.answer)
    }
  },
  City: {
    category: async (parent) => {
      return await CityCategory.findOne({ "_id": parent.category })
      // return cityCategories.filter(({ value }) => value === parent.category)[0]
    }
  },
  PollLogic: new GraphQLScalarType({
    name: "PollLogic",
    description: "Poll logic scalar type",
    parseValue: value => value,
    serialize: value => value,
    parseLiteral: ast => ast.value
  })
}

function randomInteger(min, max) {
  // получить случайное число от (min-0.5) до (max+0.5)
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
};
