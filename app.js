require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const fs = require("fs");

const app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);

mongoose.connect("mongodb://localhost:27017/QuizDB");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  college: String,
});

const Users = mongoose.model("Users", userSchema);

app.get("/", function (req, res) {
  res.render("index");
});

app.post("/", function (req, res) {
  var user = new Users({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    college: req.body.college,
  });
  res.redirect("/");
  user.save();
});

app.get("/questions", function (req, res) {
  // Read the content of the "question.json" file
  fs.readFile("question.json", "utf8", function (err, data) {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    // Parse the JSON data
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return;
    }

    let randomQuestions = req.session.randomQuestions;
    if (!randomQuestions) {
      randomQuestions = getRandomQuestions(jsonData, 10);
      req.session.randomQuestions = randomQuestions;
    }
    res.render("question", { questions: randomQuestions });
  });
});

app.post("/questions", function (req, res) {
  const userAnswers = req.body.answers; // Get the submitted form data

  // Iterate over the user's answers and check them against the correct answers
  let score = 0;
  for (const questionIndex in userAnswers) {
    if (userAnswers.hasOwnProperty(questionIndex)) {
      const userAnswerArray = Array.isArray(userAnswers[questionIndex])
        ? userAnswers[questionIndex]
        : [userAnswers[questionIndex]]; // Convert single value to array if needed

      // Retrieve the corresponding question and correct answer
      const question = req.session.randomQuestions[questionIndex];
      const correctAnswerArray = question.answer; // Array of correct options

      // Compare the user's answer with the correct answer
      if (arraysEqual(userAnswerArray, correctAnswerArray)) {
        score++;
      }
    }
  }

  // Do something with the score (e.g., save it to the database, display it to the user, etc.)
  console.log("User score:", score);

  res.send("Score calculated: " + score); // Send the score back to the client
});

// Helper function to compare arrays for equality
function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}


function getRandomQuestions(jsonData, count) {
  const subjects = Object.keys(jsonData.questions);
  const randomQuestions = [];

  subjects.forEach((subject) => {
    const questions = jsonData.questions[subject];
    const randomIndexes = getRandomIndexes(questions.length, count);
    randomIndexes.forEach((index) => {
      const question = questions[index];
      question.category = subject;
      randomQuestions.push(question);
    });
  });

  return randomQuestions;
}

function getRandomIndexes(max, count) {
  const indexes = [];
  while (indexes.length < count) {
    const randomIndex = Math.floor(Math.random() * max);
    if (!indexes.includes(randomIndex)) {
      indexes.push(randomIndex);
    }
  }
  return indexes;
}

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
