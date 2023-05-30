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
  const userAnswers = req.body.answers; // Get the user's answers from the request body
  const categoryScores = {}; // Initialize an object to store the scores for each category

  for (const category in userAnswers) {
    if (userAnswers.hasOwnProperty(category)) {
      console.log(`Category: ${category}`);

      const categoryQuestions = jsonData.questions[category]; // Get the questions for the category from your JSON data
      const categoryUserAnswers = userAnswers[category]; // Get the user's answers for the category

      // Iterate over the questions in the category
      for (let i = 0; i < categoryQuestions.length; i++) {
        const question = categoryQuestions[i];
        const userAnswer = categoryUserAnswers[i];
        const correctAnswer = question.answer;

        // Compare the user's answer with the correct answer
        if (userAnswer === correctAnswer) {
          console.log(`Question ${question.index}: Correct`);
          categoryScores[category] = (categoryScores[category] || 0) + 1; // Increment the score for the category
        } else {
          console.log(`Question ${question.index}: Incorrect`);
        }
      }
    }
  }

  console.log("Category Scores:", categoryScores); // Print the category scores to the console
  res.send("Scores calculated!"); // You can send a response back to the client if needed
});


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
