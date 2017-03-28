var express = require("express");
var bodyParser = require("body-parser");
var session = require("express-session");
var app = express();

app.set("port", (process.env.PORT || 5000));

app.use(session({
  secret: "it's a secret to everybody",
  saveUninitialized: true
}));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: false}));
// views is directory for all template files
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.get("/", function(request, response){
  response.render("pages/entry");
});

app.post("/", function(request, response){
  request.session.name = request.body;
  response.redirect("/chatroom");
});

app.get("/chatroom", function(request, response){
  if(request.session.name === undefined){ // Attempt to prevent a crash from a server restart causing the username to be lost
    response.redirect("/"); // Send the user back to the name entry page
  }
  else{
    var message = Object.assign({message: "Welcome to the chatroom, type something below to get started!"}, request.session.name);
    response.render("pages/chatroom", message);
  }
});

app.post("/chatroom", function(request, response){
  // Code to update textarea with sent message
})

app.listen(app.get("port"), function(){
  console.log("Node app is running on port", app.get("port"));
});
