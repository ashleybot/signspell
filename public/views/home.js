var socket = io.connect();

function addPlayer(player, pseudo) {
  console.log("adding player 1 at " + pseudo);
  if (player == 1)
  {
    $("#player1").html(pseudo);
  }
  else
  {
    $("#player2").html(pseudo);
  }
}

// player Joined
socket.on('playerJoined', function(data) {
  console.log("front end playerJoined");
  addPlayer(1,data);
});

function addMessage(msg, pseudo) {
   $("#chatEntries").append('<div class="message"><p>' + pseudo + ' : ' + msg + '</p></div>');
}

function sendMessage() {
   if ($('#messageInput').val() != "") 
   {
      socket.emit('message', $('#messageInput').val());
      addMessage($('#messageInput').val(), "Me", new Date().toISOString(), true);
      $('#messageInput').val('');
   }
}


// message
socket.on('message', function(data) {
   addMessage(data['message'], data['pseudo']);
});

$(function() {
   //$("#chatControls").hide();
   //$("#pseudoSet").click(function() {setPseudo()});
   //$("#submit").click(function() {sendMessage();});

});