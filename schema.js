const { gql } = require('apollo-server-express')

const typeDefs = gql`

  scalar PollLogic

  type Poll {
    id: ID!,
    title: String!,
    shortTitle: String!,
    startDate: String!,                                "// объявить собственный ТИП Date"
    endDate: String!,
    code: String!,
    liter: String!,
    sample: Int!,                                      "// Выборка"
    complete: Int,                                     "// Сколько закончено"
    questionsCount: Int,
    answersCount: Int,
    type: Int!,                                        "// Тип опроса"
    way: Int!,                                         "// Метод проведения"
    comment: String!,
    color: String!,
    cities: [City],                                    "// Города проведения"
    questions: [Question]!,
    results: [Respondent],
    files: [PollFile],
    logic: Logic,
    active: Boolean!,
    created: String!,                                  "// DATE"
    lastModified: String!,                             "// DATE"
    deleted: Boolean!
  }

  type Question {
    id: ID!,
    title: String!,
    shortTitle: String!,
    limit: Int,
    type: Int,
    order: Int,
    parentPool: ID!,
    topic: Topic,
    answers: [Answer]
  }

  type Answer {
    id: ID!,
    title: String!,
    shortTitle: String!,
    code: String!,
    parentPool: ID!,
    order: Int!,
    results: [Result],
  }

  type PollFile {
    id: ID!,
    title: String!,
    originalFile: String!,
    pdfClone: String!,
    path: String!,
    created: String!,                                  "// DATE"
    deleted: Boolean!
  }

  type Topic {
    id: String!,
    title: String!
  }

  type Logic {
    id: ID!,
    poll: String!,
    path: String!
  }

  type City {
    id: ID!,
    title: String!,
    population: Int,
    type: String,
    order: Int,
    category: CityCategory
  }

  type CityCategory {
    id: String!,
    title: String!,
    order: Int,
    default: Boolean,
    active: Boolean
  }

  input ReorderedArray {
    id: ID!,
    order: Int!
  }

  type Respondent {
    id: String!,
    poll: Poll!,
    city: City,
    user: User,
    created: String,
    lastModified: String,
    timestamp: Int,
    processed: Boolean,
    result: [Result]!
  }

  type Result {
    id: String!,
    respondent: Respondent!,
    question: Question!,
    answer: String!,
    code: String!,
    text: String
  }

  type Status {
    value: String,
    title: String
  }

  type Sex {
    value: String,
    title: String
  }

  type Age {
    value: String,
    title: String
  }

  type Query {
    users: [User],
    userRights: [UserRights],
    userStatus: [UserStatus],
    currentUser: User,

    polls: [Poll],
    archivePolls: [Poll],
    poll(id: ID!): Poll,
    questions: [Question],
    answers: [Answer],
    logics: [Logic],

    topics: [Topic],

    cities: [City],
    city(id: ID!): City,
    cityCategories: [CityCategory],
    pollCities(id: String!): [City]

    intervievers: [User],
    status: [Status],
    sex: [Sex],
    age: [Age],

    question(id: ID!): Question,
    logicById(id:ID!): Logic,
    pollLogic(id:ID!): Logic,

    result(id:ID!): [Respondent],
    pollResults(id:String!): [Respondent]
  }

  type Mutation {
    addNewUser(user: UserDataCreate): User,
    deleteUsers(users: [String]): [User],
    updateUser(id: String, data: UserDataUpdate): User,
    signin(login: String!, password: String!): AuthPayload,
    resetPassword(id: String, password: String): Boolean,
    logout: Boolean,
    
    newCity(title: String!, type: String!, population: Int, category: String!): City!,
    newCities(cities: [CityInput]): [City],
    cityEdit(id: String!, type: String, title: String!, population: Int!, category: String!): City!,
    deleteCity(id: String!): City,

    setPollCity(id: ID!, cities: [String]): Poll,
    deleteCityFromActive(id: ID!, cities: [String]): Poll,

    addPoll(poll: PollWithConfig, questions: [QuestionInput], logic: LogicInput, topic: [TopicInput]): Poll,
    savePollStatus(id: ID!, active:Boolean!): Poll,
    deletePoll(id: ID!): Poll,

    newLimit(id: ID!, limit: Int!): Question,
    newOrder(neworder: [ReorderedArray]): [Question],

    saveConfig(path: String!, text: String!): Boolean,

    saveResult(poll: String!, city: String!, user: String!, pool: [String], data: [ResultData]): Boolean,
    deleteResults(results: [String]): [Respondent]
  }

  input UserDataCreate {
    username: String!,
    login: String!,
    password: String!,
    status: String!,
    rights: String
  }

  input UserDataUpdate {
    username: String,
    login: String,
    status: String,
    rights: String
  }

  input ResultData {
    id: String!,
    data: [resultInput]
  }

  input resultInput {
    answer: String!,
    code: String!,
    text: String
  }

  input PollWithConfig {
    title: String!,
    shortTitle: String,
    startDate: String!,
    endDate: String!,
    code: String!,
    sample: Int!,
    type: Int!,
    way: Int!,
    comment: String,
    active: Boolean!
  }

  input QuestionInput {
    title: String!,
    shortTitle: String,
    limit: Int,
    type: Int,
    topic: Int,
    order: Int,
    answers: [AnswerInput]
  }

  input AnswerInput {
    title: String!,
    shortTitle: String,
    code: String!,
    order: Int!,
    type: Int
  }

  input TopicInput {
    id: String!,
    title: String!
  }

  input LogicInput {
    diffUniq: [String],
    difficult: [String],
    exclude: PollLogic,
    freeAnswers: [String],
    unique: [String]
  }

  input CityInput {
    title: String!,
    order: Int!,
    type: String!,
    population: Int,
    category: String
  }

  "======= USERS ========"
  type User {
    id: String,
    username: String,
    login: String,
    password: String,
    status: UserStatus,
    rights: UserRights
  }

  type UserStatus {
    id: String,
    title: String,
    order: Int,
    default: Boolean,
    active: Boolean
  }

  type UserRights {
    id: String,
    title: String,
    order: Int,
    default: Boolean,
    root: Boolean,
    active: Boolean
  }

  enum Rights {
    SUPERADMIN
    ADMIN
    OPERATOR
    USER
    GUEST
  }

  type AuthPayload {
    user: User
  }

`
module.exports = typeDefs;