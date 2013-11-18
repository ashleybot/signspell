var socket = io.connect();
var selectedSlide = 0;

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
      $('#chatControls').show();
      $("#chatEntries").append("<h2>Welcome " + $("#pseudoInput").val() + "</h2>");
      $('#pseudoInput').hide();
      $('#pseudoSet').hide();
   }
}

function deviceMotionHandler(eventData) {
  var info, xyz = "[X, Y, Z]";

  // Grab the acceleration from the results
  var acceleration = eventData.acceleration;
  
  // Grab the acceleration including gravity from the results
  acceleration = eventData.accelerationIncludingGravity;
  
  // Rotation info
  var rotation = eventData.rotationRate;
  info = xyz.replace("X", rotation.alpha);
  info = info.replace("Y", rotation.beta);
  info = info.replace("Z", rotation.gamma);
  
  // // Grab the refresh interval from the results
  info = eventData.interval;
  
  console.log("info " + info);
  console.log("xyz " + xyz);
  
  //TODO don't emit message here, interpret it first, or create a new way to interpret it on the server
  //socket.emit('message', "CIRCLE"); // this totally worked, but sends a message every little movement
}

function deviceOrientationHandler(lr, fb, dir){
  console.log("tilt detected");
}

// message
socket.on('message', function(data) {
   addMessage(data['message'], data['pseudo']);
});

$(function() {
   $("#chatControls").hide();
   $("#pseudoSet").click(function() {setPseudo()});
   $(".handshape").click(function() {sendMessage(this)});
   
   //TODO Set a parameter to indicate which slide is selected, but wait for the shake event to send message
   $("#featured").on("orbit:after-slide-change", function(event, orbit) {
    selectedSlide = orbit.slide_number;
    console.info("after slide change");
    console.info("slide " + orbit.slide_number + " of " + orbit.total_slides);
  });
  
  if ((/iPhone|iPod|iPad|Android|BlackBerry/).test(navigator.userAgent) ) {
    if (window.DeviceMotionEvent){
      window.addEventListener('devicemotion', deviceMotionHandler, false);
    }
    if (window.DeviceOrientationEvent){
      window.addEventListener('deviceorientation', function(eventData) {
        // gamma is the left-to-right tilt in degrees, where right is positive
        var tiltLR = eventData.gamma;
    
        // beta is the front-to-back tilt in degrees, where front is positive
        var tiltFB = eventData.beta;
    
        // alpha is the compass direction the device is facing in degrees
        var dir = eventData.alpha
    
        // call our orientation event handler
        deviceOrientationHandler(tiltLR, tiltFB, dir);
        
      }, false);
    }
  }
});