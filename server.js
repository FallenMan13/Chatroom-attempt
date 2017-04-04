var express = require("express");
var bodyParser = require("body-parser");
var session = require("express-session");
var app = express();
var redis = require("redis");
var client = redis.createClient();
var http = require("http").createServer(app);
var io = require("socket.io").listen(http);
var users = [];
var i = 1;

client.on("error", function (err){
  console.log("Error " + err);
  client.quit();
});

client.on('connect', function() {
  console.log('Redis client connected');
});

app.set("ipaddr", "10.78.31.53");
app.set("port", (process.env.PORT || 80));

app.use(session({
  secret: "it's a secret to everybody",
  saveUninitialized: true
}));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.get("/", function(request, response){
  if(request.session.name !== undefined){ // If a user has signed out, destroy the session to prevent them from entering the chatroom by adding "/chatroom" to the end of the url
    users.splice(users.indexOf(request.session.name), 1);
    io.sockets.emit("connectedChange");
    request.session.destroy();
  }
    response.render("pages/entry");
});

app.post("/", function(request, response){
  if(users.includes(request.body.name)){
    request.session.name = request.body.name + "(" + i++ + ")";
    users.push(request.session.name);
  }
  else{
    request.session.name = request.body.name;
    users.push(request.body.name);
  }
  io.sockets.emit("connectedChange");
  response.redirect("/chatroom");
});

app.get("/chatroom", function(request, response){
  if(request.session.name === undefined){ // Attempt to prevent a crash from a server restart causing the username to be lost
    response.redirect("/"); // Send the user back to the name entry page
  }
  else{
    client.lrange("message", 0, -1, function(error, reply){
      if(request.headers.accept === "application/json"){
        response.send({messages: reply, users: users});
      }
      else{
        response.render("pages/chatroom", {messages: reply, name: request.session.name, users: users});
      }
    });
  }
});

app.post("/chatroom", function(request, response){
  if(request.session.name === undefined){
    io.sockets.emit("noUsername");
    response.redirect("/");
  }
  else{
    client.lrange("message", 0, -1, function(error, reply){
      client.rpush(["message", request.session.name + ": " + request.body.message], function(){
        io.sockets.emit("newMessage");
        response.redirect("/chatroom");
      })
    })
  }
})

http.listen(app.get("port"), app.get("ipaddr"), function(){
  console.log("Server up and running. Go to http://" + app.get("ipaddr") + ":" + app.get("port"));
});
