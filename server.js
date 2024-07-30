const express = require("express");
const session = require('express-session')
const mongoose = require("mongoose");
const Task = require("./Schemas/taskSchema");
const Note = require("./Schemas/noteSchema");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const auth = require('./Routers/authRouter')
const oauth = require('./Routers/oauth.js')
const calendar = require('./Routers/calendarRouter')
const dotenv = require('dotenv')
dotenv.config()
require('./Strategies/auth.js')

// function isLoggedIn(req, res, next){
//  if  (req.user) {next()} else {res.sendStatus(401); console.log(req.user)}
// }


const app = express();
app.use(session({secret:"cats"}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/api/auth', auth)
app.use('/api/oauth', oauth)
app.use('/api/calendar', calendar)

mongoose.connect("mongodb://localhost:27017/productify").then(() => {
  console.log("connected to db");
});
app.use(cors({
  origin:'http://localhost:3000',
  credentials: true
}));
app.listen(process.env.PORT, () => {
  console.log("Server Started on Port 5000");
});

 
//task requests
app.get("/api/task", async (req, res) => {
  const sorted = await Task.find().sort({ id: -1 }).limit(1);
  res.status(200).send(sorted);
});

app.get("/api/alltasks", async (req, res) => {
  Task.find({})
    .then((tasks) => {
      res.status(200).send(tasks);
      console.log("Reloaded Tasks Succesfully");
    })
    .catch((err) => console.log(err));
});
app.post("/api/tasks", bodyParser.json(), async (req, res) => {
  //     console.log(req.body)
  //    res.send(req.body)
  const { name, id, order } = req.body;
  const newTask = await Task.create({ name, id, order });
  newTask.save();
  res.status(200).send(newTask);
});
app.post("/api/deltask", bodyParser.json(), async (req, res) => {
  Task.deleteOne({ id: req.body.id })
    .then(function () {
      res.sendStatus(200); // Success
    })
    .catch(function (error) {
      console.log(error); // Failure
    });
});
app.post("/api/replacetask", bodyParser.json(), async (req, res) => {
  const { id, name, order } = req.body;
  Task.deleteOne({ id: id })
    .then(() => {
      console.log("deleted");
    })
    .catch((err) => {
      console.log(err);
    });
  const newTask = await Task.create({ name, id, order });
  console.log("finished Replace");
  newTask.save();
  res.sendStatus(200);
});

//note requests
app.post("/api/newnote", bodyParser.json(), async (req, res) => {
  const { id, content, title } = req.body;
  const newNote = await Note.create({ id, content, title });
  newNote.save();
  console.log(" " + id + " " + content + " " + title);
  res.sendStatus(200);
});
app.post("/api/removenote", bodyParser.json(), async (req, res) => {
  Note.deleteOne({ id: req.body.id })
    .then(function () {
      res.sendStatus(200); // Success
    })
    .catch(function (error) {
      console.log(error); // Failure
    });
});
app.get("/api/notelist", (req, res) => {
  Note.find({})
    .then((notes) => {
      res.status(200).send(notes);
      console.log(notes);
    })
    .catch((err) => console.log(err));
});
app.post("/api/replaceNote", bodyParser.json(), async (req, res) => {
  const { title, content, id } = req.body;
  Note.deleteOne({ id: id })
    .then(() => {
      console.log("deleted");
    })
    .catch((err) => {
      console.log(err);
    });
  const newNote = await Note.create({ title, content, id });
  console.log("finished Replace");
  newNote.save();
  res.sendStatus(200);
});

// app.get("/api/auth/login", (req, res) => {
//   res.status(200).send('<a href="/api/auth/google"> Authenticate with Google </a>' )
// })
// app.get("/api/auth/google", 
//   passport.authenticate('google', {scope: ['email', 'profile']})


// )
// app.get('/api/auth/callback', 
//   passport.authenticate('google', {
//       successRedirect: '/api/auth/success',
//       failureRedirect: '/api/auth/failure'
//   })
// )


// app.get('/api/auth/success', (req, res) => {res.redirect('http://localhost:3000')})
// // app.get('/api/auth/success', (req, res) => {res.redirect('/api/auth/isloggedin')})
// app.get('/api/auth/failure', (req, res) => {res.status(401)})
// app.get('/api/auth/isloggedin', (req, res) => {
//   console.log(req.session)
//   res.send('boop')
// })
