var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.set("port", (process.env.PORT || 5000));

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: false}));
// views is directory for all template files
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.get("/", function(request, response){
  response.render("pages/entry");
});

app.post("/", function(request, response){
  var entry = Object.assign({message: "Welcome to the chatroom, type something below to begin talking!"}, request.body);
  response.render("pages/chatroom", entry);
})

app.listen(app.get("port"), function(){
  console.log("Node app is running on port", app.get("port"));
});
