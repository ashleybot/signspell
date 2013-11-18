var socket = io.connect();

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
    console.info("after slide change");
    console.info("slide " + orbit.slide_number + " of " + orbit.total_slides);
  });
});