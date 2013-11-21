var socket = io.connect();
var selectedSlide = 0;
var selectedShape = "CIRCLE";
var playerId = ""; // for this device

function addMessage(msg, pseudo) {
   $("#chatEntries").append('<div class="message"><p>' + pseudo + ' : ' + msg + '</p></div>');
}

function sendMessage(object) {
    var text = object.innerHTML;
    socket.emit('message', text); // emit to socket
    addMessage(text, "Me", new Date().toISOString(), true); // update my screen
}

// #pseudoSet calls setPseudo()
function setPseudo() {
   if ($("#pseudoInput").val() != "")
   {
      socket.emit('setPseudo', $("#pseudoInput").val());

      $('#player_setup').hide();
   }
}


// Reading the phone's input trigger
var step1a, step1b, step2a, step2b = false;
function detectTrigger(x){
    // gamma is the tilt left-to-rightl
  
  if (step1a && (x > 0)) {
    step1b = true;
  }
  if (step2a && (x > 0)) {
    socket.emit('message', selectedShape); // this works, but it might be finicky.
    step1a = false;
    step1b = false;
    step2a = false;
    step2b = false;
  }
  if (step1b && (x < -9)) {
    step2a = true;
  } else {
    if (x < -9){
      step1a = true;
    }
  }
}

function deviceMotionHandler(eventData) {
  // Grab the acceleration from the results (newer phones)
  var acceleration = eventData.acceleration;
  // Grab the acceleration including gravity from the results (older phones)
  acceleration = eventData.accelerationIncludingGravity;
  if (acceleration){
    detectTrigger(acceleration.x);
  }
}
// end of reading the phone's input trigger


// message
socket.on('message', function(data) {
   addMessage(data['message'], data['pseudo']);
});

// playerJoined, this is sent to both players, so if playerId is already set then the other player is the one joining
socket.on('playerJoined', function(data){
  if (playerId.length == 0){
    playerId = data["player_id"]; // only set if it is not already set
  }
  if (playerId == "1"){
    $('#zero').attr("src","images/red.png");
    $('#one').attr("src","images/blue.png");
    $('#two').attr("src","images/green.png");
    selectedShape = "RED";
  }
  $('#featured').show();
});

$(function() {
   $("#featured").hide();
   $("#pseudoSet").click(function() {setPseudo()});
   
   //TODO Set a parameter to indicate which slide is selected, but wait for the shake event to send message
   $("#featured").on("orbit:after-slide-change", function(event, orbit) {
    var shapes = ['CIRCLE','SQUARE','TRIANGLE'];
    var colors = ['RED','BLUE','GREEN'];
    if (playerId == '1') {
      selectedShape = colors[orbit.slide_number];
    } else {
      selectedShape = shapes[orbit.slide_number];
    }
    socket.emit('shapeChanged', selectedShape); // emit to socket
  });
  
  if ((/iPhone|iPod|iPad|Android|BlackBerry/).test(navigator.userAgent) ) {
    // This works for older model phones like iPhone 3gs (it only has an accelerometer)
    if (window.DeviceMotionEvent){
      window.addEventListener('devicemotion', deviceMotionHandler, false);
    }

  }
  
});