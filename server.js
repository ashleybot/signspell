var express = require('express');
var jade = require('jade');

var app = express()
  , http = require('http')
  , server = http.createServer(app);
  
var io = require('socket.io').listen(server);
  
var port = process.env.PORT || 3000;

server.listen(port);

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set("view options", { layout: false });

app.configure(function() {
   app.use(express.static(__dirname + '/public'));
   app.use(express.bodyParser());
});

// Get

app.get('/', function(req, res){
  res.render('home.jade');
});

// WebSockets


io.sockets.on('connection', function (socket) {

  // setPseudo
   socket.on('setPseudo', function (data) {
    socket.set('pseudo', data);
    console.log("name set to " + data);
   });
   
  
  // message 
  socket.on('message', function (message) {
   socket.get('pseudo', function (error, name) {
        var data = { 'message' : message, pseudo : name };
        socket.broadcast.emit('message', data);
        console.log("user " + name + " send this : " + message);
     })
   });
});


