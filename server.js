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

app.get('/mobile', function(req, res){
  res.render('mobile.jade');
});

var playerNumber = 0;

// WebSocket connected

io.sockets.on('connection', function (socket) {
  
  // setPseudo
   socket.on('setPseudo', function (data) {
    //TODO I need to assign the pseudonym to the client object
    socket.set('pseudo', data); 
    playerNumber = playerNumber + 1; // this will only work for one page load each.... it increments too high
    socket.set('player_id', playerNumber);
    
    var pseudoData = {psuedo : data, 'player_id' : playerNumber}
    io.sockets.emit('playerJoined', pseudoData); // this is sent to the other mobile device, so it might be why it is not successful
   });
   
  
  // message 
  socket.on('message', function (message) {
    socket.get('pseudo', function (error, name) {
      socket.get('player_id', function (error, id){
        var data = { 'message' : message, pseudo : name, player_id : id };
        socket.broadcast.emit('message', data);
      });
    })
  });
   
  // shape changed
  socket.on('shapeChanged', function (newShapeName) {
    socket.get('player_id', function (error, id){
      socket.set('player_shapes', null);
      var data = {'player_id' : id, 'shape_name' : newShapeName};
      socket.broadcast.emit('shapeChanged', data);
    });
  });
  
});


