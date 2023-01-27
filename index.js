const express = require('express');
const app = express();
const { User } = require('./db');

const jwt = require('jsonwebtoken');
const { createPassword, createJWT, checkPassword, verifyJWTMiddleware } = require('./auth');

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/', async (req, res, next) => {
  try {
    res.send(`
      <h1>Welcome to Cyber Kittens!</h1>
      <p>Cats are available at <a href="/kittens/1">/kittens/:id</a></p>
      <p>Create a new cat at <b><code>POST /kittens</code></b> and delete one at <b><code>DELETE /kittens/:id</code></b></p>
      <p>Log in via POST /login or register via POST /register</p>
    `);
  } catch (error) {
    console.error(error);
    next(error)
  }
});

// Verifies token with jwt.verify and sets req.user
// TODO - Create authentication middleware

// POST /register
// OPTIONAL - takes req.body of {username, password} and creates a new user with the hashed password

app.post('/register', async(req, res) => {
  const password = req.body.password;
  const username = req.body.username;

  const hash = await createPassword(password)

  try {
    await User.create({
      username: username,
      password: hash,
    })

    res.send(201) // Created
  } catch (error) {
    res.send(400) // Bad request
  }

})

// POST /login
// OPTIONAL - takes req.body of {username, password}, finds user by username, and compares the password with the hashed version from the DB

app.post('/login', async(req, res) => {
  const password = req.body.password;
  const username = req.body.username;

  const hash = await createPassword(password)

  try {
    const user = await User.findOne({where: {username: username}})
    if(user == null) {
      res.send(404) // No user found
      return
    }

    // Check hash
    if(await checkPassword(password, hash) == false) {
      res.send(401) // Bad password
      return
    }

    const token = await createJWT(user.id);
    res.send({
      token: token,
    })
    return;

    // `Create jwt here
    res.send(201) // Created
  } catch (error) {
    console.log(error)
    res.send(400) // Bad request
  }

})

app.get('/me',  verifyJWTMiddleware, async (req, res) => {
  console.log(req.user)
  res.send(req.user)
})

// GET /kittens/:id
// TODO - takes an id and returns the cat with that id

// POST /kittens
// TODO - takes req.body of {name, age, color} and creates a new cat with the given name, age, and color

// DELETE /kittens/:id
// TODO - takes an id and deletes the cat with that id

// error handling middleware, so failed tests receive them
app.use((error, req, res, next) => {
  console.error('SERVER ERROR: ', error);
  if(res.statusCode < 400) res.status(500);
  res.send({error: error.message, name: error.name, message: error.message});
});

// we export the app, not listening in here, so that we can run tests
module.exports = app;
