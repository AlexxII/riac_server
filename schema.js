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
    sample: Int!,
    complete: Int,
    questionsCount: Int,
    answersCount: Int,
    type: Int!,
    way: Int!,
    comment: String!,
    color: String!,
    questions: [Question]!,
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
    answers: [Answer]
  }

  type Answer {
    id: ID!,
    title: String!,
    shortTitle: String!,
    code: String!,
    parentPool: ID!,
    order: Int!
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

  type Query {
    currentUser: User,
    polls: [Poll],
    poll(id: ID!): Poll,
    questions: [Question],
    answers: [Answer],
    logics: [Logic],
    cities: [City],
    question(id: ID!): Question,
    logicById(id:ID!): Logic,
    pollLogic(id:ID!): Logic,

    result(id:ID!): [Respondent],
    pollResults(id:String!): [Respondent],
    
    city(id: ID!): City,
    cityCategories: [CityCategory]
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
    population: Int!,
    category: CityCategory!
  }

  type CityCategory {
    value: String!,
    label: String!
  }

  input ReorderedArray {
    id: ID!,
    order: Int!
  }

  type Respondent {
    id: String!,
    poll: Poll!,
    city: City,
    result: [Result]!
  }

  type Result {
    id: String!,
    respondent: Respondent!,
    question: Question!,
    code: String!,
    text: String
  }

  type Mutation {
    logout: Boolean,
    signin(username: String!, password: String!): AuthPayload,
    signup(username: String!, password: String!): AuthPayload,

    newCity(title: String!, population: Int!, category: String!): City!,
    cityEdit(id: String!, title: String!, population: Int!, category: String!): City!,
    deleteCity(id: String!): Boolean,

    addPoll(poll: PollWithConfig, questions: [QuestionInput], logic: LogicInput, topic: [TopicInput]): Poll,
    deletePoll(id: ID!): Poll,
    newLimit(id: ID!, limit: Int!): Boolean,
    newOrder(neworder: [ReorderedArray]): Boolean,
    saveConfig(path: String!, text: String!): Boolean,

    saveResult(poll: String!, city: String!, user: String!, pool: [String], data: [ResultData]): Boolean
  }

  input ResultData {
    id: String!,
    data: [resultInput]
  }

  input resultInput {
    code: String!
    text: String
  }

  input CityType {
    value: String!
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

  "======= USERS ========"
  type User {
    id: String,
    username: String,
    password: String,
  }

  enum Role {
    SUPERADMIN
    ADMIN
    USER
    GUEST
  }

  type AuthPayload {
    user: User
  }

`
module.exports = typeDefs;