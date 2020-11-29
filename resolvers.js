const { AuthenticationError } = require('apollo-server-express')
const { v4: uuidv4 } = require('uuid');
const fs = require('fs')
const ini = require('ini')

const Poll = require('./models/polls/poll')
const Question = require('./models/polls/question')
const Answer = require('./models/polls/answer')
const PollFile = require('./models/polls/pollfile')
const Topic = require('./models/polls/topic')
const Logic = require('./models/polls/logic')
const City = require('./models/polls/city');
const User = require('./models/common/user');
const Respondent = require('./models/polls/respondent');
const Result = require('./models/polls/result')

const cityCategories = require('./config/poll_constants')
const { userStatus, userRights } = require('./config/auth')
// const userRights = require('./config/auth')

const { GraphQLScalarType } = require('graphql');
const moment = require('moment')

module.exports = {
  Query: {
    users: () => User.find({ rights: { $ne: userRights[0].value }}).select('id username login status rights'),
    currentUser: (_, __, context) => context.getUser(),
    userRights: () => userRights.slice(1),
    userStatus: () => userStatus,

    polls: () => Poll.find({}),
    poll: (_, args) => Poll.findById(args.id),
    questions: () => {
      return Question.find({});
    },
    answers: () => {
      return Answer.find({});
    },
    logics: () => {
      return Logic.find({})
    },
    cities: () => {
      return City.find({})
    },
    intervievers: async () => {
      return await User.find({})
    },
    cityCategories: () => {
      return cityCategories
    },
    pollCities: (_, args) => {
      return City.find({})
    },
    question: (_, args) => Question.findById(args.id),
    logicById: (_, args) => Logic.findById(args.id),
    pollLogic: async (_, args) => {
      const res = await Logic.findOne({ "poll": args.id }).exec()
      return res
    },
    result: async (_, args) => {
      const res = await Respondent.find({ "poll": args.id }).exec()
      return res
    },
    pollResults: async (_, args) => {
      let res = await Respondent.find({ "poll": args.id }).exec()
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
      }
      const res = await User.create(user)
      return res
    },
    deleteUsers: async (_, args) => {
      const users = args.users
      let result = []
      for (let i = 0; i < users.length; i++) {
        const userId = users[i]
        const user = await User.findOne({ "_id": userId })
        if (user.rights !== userRights[0].value) {
          user.deleteOne()
          result.push(user)
        }
      }
      console.log(result);
      return result
    },
    updateUser: async (_, args) => {
      const userId = args.id
      console.log(args.data);
    },
    signup: async (_, { username, password }, context) => {
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
      const city = {
        _id: uuidv4(),
        title: args.title,
        population: args.population,
        category: args.category
      }
      const res = await City.create(city)
      return res
    },
    cityEdit: async (_, args) => {
      const filter = { _id: args.id }
      const update = {
        title: args.title,
        population: args.population,
        category: args.category
      }
      let city = await City.findOneAndUpdate(filter, update, {
        new: true
      })
      return city
    },
    deleteCity: async (_, args) => {
      const city = await City.findOne({ _id: args.id })
      const res = await city.deleteOne()
      return res._id === args.id
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
    status: (parent) => {
      return userStatus.filter(({ value }) => value === parent.status)[0]
    },
    rights: (parent) => {
      return userRights.filter(({ value }) => value === parent.rights)[0]
    }
  },
  Poll: {
    questions: (parent) => {
      return Question.find({ "poll": parent._id }).sort('order')
    },
    files: (parent) => {
      return PollFile.find({ "_id": { $in: parent.files } })
    },
    liter: (parent) => {
      const reg = /\D{3}/
      return parent.code.match(reg)[0]
    },
    complete: () => 0,
    questionsCount: (parent) => {
      return parent.questions.length
    },
    answersCount: (parent) => {
      return Answer.find({ "poll": parent._id }).count()
    },
    cities: (parent) => {
      return City.find({ "_id": { $in: parent.cities } })
    },
    color: () => 'red',
    logic: async (parent) => {
      const res = await Logic.findOne({ "poll": parent._id })
      return res
    },
    startDate: parent => {
      return moment(parent.startDate).format('DD.MM.YYYY')
    },
    endDate: (parent) => {
      return moment(parent.endDate).format('DD.MM.YYYY')
    }
  },
  Question: {
    answers: (parent) => {
      return Answer.find({ "_id": { $in: parent.answers } }).sort('order')
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
      return await Question.findById(parent.question)
    }
  },
  City: {
    category: async (parent) => {
      return cityCategories.filter(({ value }) => value === parent.category)[0]
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
