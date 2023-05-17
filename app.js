const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.set("view engine", "html");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/QuizDB");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    college: String
});

const Users = mongoose.model("Users", userSchema) 

app.get('/', function(req, res) {
    res.render("index")
});

app.post("/", function(req, res) {
    var user = new Users({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        college: req.body.college,
    });
    res.redirect("/")
    user.save();
});

app.get("/question", function(req, res){
    res.render("question");
})


app.listen(3000, function(req, res) {
    console.log("server is running on port 3000");
})