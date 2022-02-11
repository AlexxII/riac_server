const express = require('express')
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const mongoose = require('mongoose')
const path = require('path');
const cors = require('cors')
const session = require('express-session')
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const passport = require('passport');
const { GraphQLLocalStrategy, buildContext } = require('graphql-passport');
const User = require('./models/common/user')

// mongoose.connect('mongodb://182.11.57.111:27017/poll', { useNewUrlParser: true });
mongoose.connect('mongodb://127.0.0.1:27017/poll', { useNewUrlParser: true });
const dbConnection = mongoose.connection
dbConnection.on('error', err => console.log(`Connsetcion error: ${err}`))
dbConnection.once('open', () => console.log('Connected to DB!'))

const SESSION_SECRET = 'sdkhflkwjqheflkjhJHGKJHG231223487$#%@asdfjkashdasdfhKGKJHGjhgl2342jghkjGHJHKG'
const PORT = 4000

const corsOptions = {
  origin: 'http://localhost:8080',
  credentials: true,
};

const app = express()

app.use(cors(corsOptions))

app.use(session({
  genid: (req) => uuidv4(),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user)
  })
});

// REDIS!!!!!!! нужно добавить
passport.use(
  new GraphQLLocalStrategy((login, password, done) => {
    User.findOne({ login: login }, (err, user) => {
      return err
        ? done(err)
        : user
          ? password === user.password
            ? done(null, user)
            : done(null, false, { message: 'Неправильный пароль.' })
          : done(null, false, { message: 'Неправильный логин' })
    });
  }),
);

app.use(passport.initialize());
app.use(passport.session());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => buildContext({ req, res, User })
})

app.use(express.static(path.join(__dirname, 'asset')));

app.get('/files*', function (req, res) {
  const filePath = `.${req.originalUrl}`
  res.download(filePath)
})

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'asset', 'index.html'));
});

app.get('/vks', function (req, res) {
  res.sendFile(path.join(__dirname, 'vks', 'index.html'));
});

server.applyMiddleware({
  app,
  cors: false,
  bodyParserConfig: {
    limit: '100mb'
  }
})

app.listen({ port: PORT }, () =>
  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
)