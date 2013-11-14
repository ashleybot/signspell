var socket = io.connect();

function addPlayer(player, pseudo) {
  if (player == 1)
  {
    $("#player1_handle").html("Welcome " + pseudo);
  }
  else
  {
    $("#player2_handle").html("Welcome " + pseudo);
  }
}


// player Joined
socket.on('playerJoined', function(data) {
  addPlayer(data['player_id'], data['psuedo']);
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