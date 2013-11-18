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
      $('#featured').show();
      $('#player_setup').hide();
   }
}

function deviceMotionHandler(eventData) {
  var info, xyz = "[X, Y, Z]";

  if (eventData){
    
    // Grab the acceleration from the results
    var acceleration = eventData.acceleration;
    if (acceleration){
      console.log("acceleration detected"); // this does not work
    }
    // Grab the acceleration including gravity from the results
    acceleration = eventData.accelerationIncludingGravity;
    if (acceleration){
      //console.log("acceleration with gravity detected"); // this works on iOS
      detectTrigger(acceleration.x);
      xyz = xyz.replace("X", acceleration.x);
      xyz = xyz.replace("Y", acceleration.y);
      xyz = xyz.replace("Z", acceleration.z);
      
    }
    // Rotation info
    var rotation = eventData.rotationRate;
    if (rotation){
      console.log("rotation detected"); // this does not work
      xyz = xyz.replace("X", rotation.alpha);
      xyz = info.replace("Y", rotation.beta);
      xyz = info.replace("Z", rotation.gamma);
      
      if (rotation.gamma < -45){
        socket.emit('message', rotation.gamma);
      }
    }
    
    // // Grab the refresh interval from the results
    info = eventData.interval; // on iOS, this logs something
    
    //console.log("info " + info); 
    //console.log("xyz " + xyz); 
  }
  
}

var step1a, step1b, step2a, step2b = false;
function detectTrigger(x){
    // gamma is the tilt left-to-rightl
   //socket.emit('message', 'gamma rotation ' + x);
  
  if (step1a && (x > 0)) {
    step1b = true;
  }
  if (step2a && (x > 0)) {
    socket.emit('message', "CIRCLE"); // this works, but it might be finicky.
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
function deviceOrientationHandler(lr, fb, dir){
  // gamma is the tilt left-to-rightl
   //socket.emit('message', 'gamma rotation ' + lr); // this works for more modern devices
  
  if (step1a && (lr > 0)) {
    step1b = true;
  }
  if (step2a && (lr > 0)) {
    socket.emit('message', "CIRCLE");
    step1a = false;
    step1b = false;
    step2a = false;
    step2b = false;
  }
  if (step1b && (lr < -45)) {
    step2a = true;
  } else {
    if (lr < -45){
      step1a = true;
    }
  }
}

// message
socket.on('message', function(data) {
   addMessage(data['message'], data['pseudo']);
});

$(function() {
   $("#featured").hide();
   $("#pseudoSet").click(function() {setPseudo()});
   $(".handshape").click(function() {sendMessage(this)});
   
   //TODO Set a parameter to indicate which slide is selected, but wait for the shake event to send message
   $("#featured").on("orbit:after-slide-change", function(event, orbit) {
    selectedSlide = orbit.slide_number;
    console.info("after slide change");
    console.info("slide " + orbit.slide_number + " of " + orbit.total_slides);
  });

    if (window.DeviceOrientationEvent){
      window.addEventListener('deviceorientation', function(eventData) {
        // gamma is the left-to-right tilt in degrees, where right is positive
        var tiltLR = eventData.gamma;
    
        // beta is the front-to-back tilt in degrees, where front is positive
        var tiltFB = eventData.beta;
    
        // alpha is the compass direction the device is facing in degrees
        var dir = eventData.alpha
    
        // call our orientation event handler
        //deviceOrientationHandler(tiltLR, tiltFB, dir);
        
      }, false);
      
      window.addEventListener('orientationchange', function(eventData){
        //console.log("orientationchange detected"); // this works (it fires when the browser obviously changes orientation)
      });
    }
  
  if ((/iPhone|iPod|iPad|Android|BlackBerry/).test(navigator.userAgent) ) {
    if (window.DeviceMotionEvent){
      window.addEventListener('devicemotion', deviceMotionHandler, false);
      console.log("event listener added");
    }

  }
  
});