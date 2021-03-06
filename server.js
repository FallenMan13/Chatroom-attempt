var express = require("express");
var bodyParser = require("body-parser");
var session = require("express-session");
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn("/");
var app = express();
var redis = require("redis");
var client = redis.createClient();
var http = require("http").createServer(app);
var io = require("socket.io").listen(http);
var pass = require("./passport");
const datetime = require("./sentDate");

client.on("error", function (err){
  console.log("Error " + err);
  client.quit();
});

client.on('connect', function() {
  console.log('Redis client connected');
});

app.set("ipaddr", "10.78.31.53");
app.set("port", (process.env.PORT || 80));
app.set("users", []);
app.use(session({
  secret: "it's a secret to everybody",
  saveUninitialized: true
}));
pass(app, io);

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.get("/", function(request, response){
  response.render("pages/entry", {redirURL: "http://" + app.get("ipaddr") + ":" + app.get("port") + "/callback"});
});

app.post("/", function(request, response){
  response.redirect("/chatroom");
});

app.get("/chatroom", ensureLoggedIn, function(request, response){
  var users = app.get("users");
  var messageData = [];
  var newUser = [];
  var newMessage = [];
  var newDate = [];
  client.lrange("message", 0, -1, function(error, reply){
    if(typeof reply === "undefined"){
      response.render("pages/chatroom", {names: newUser, messages: newMessage, dates: newDate, name: request.user.nickname, users: users});
    }
    else{
      for(var i=0;i<reply.length;i++){
        messageData.push(JSON.parse(reply[i]));
        newUser.push(messageData[i].name);
        newMessage.push(messageData[i].message);
        newDate.push(messageData[i].date);
      }
      if(request.headers.accept === "application/json"){
        response.send({names: newUser, messages: newMessage, dates: newDate, users: users});
      }
      else{
        response.render("pages/chatroom", {names: newUser, messages: newMessage, dates: newDate, name: request.user.nickname, users: users});
      }
    }
  });
});

app.post("/chatroom", ensureLoggedIn, function(request, response){
  var sentDate = datetime.createdOn();
  var newMessage = {name: request.user.nickname, message: request.body.message, date: sentDate}
  client.rpush("message", JSON.stringify(newMessage), function(){
    io.sockets.emit("newMessage");
    response.redirect("/chatroom");
  });
});

app.get("/logout", function(request, response){
  var users = app.get("users");
  users.splice(users.indexOf(request.user.nickname), 1);
  io.sockets.emit("connectedChange");
  request.logout();
  response.redirect("/");
});

http.listen(app.get("port"), app.get("ipaddr"), function(){
  console.log("Server up and running. Go to http://" + app.get("ipaddr") + ":" + app.get("port"));
});
