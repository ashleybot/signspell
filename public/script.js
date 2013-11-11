var socket = io.connect();

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
   $("#submit").click(function() {sendMessage();});
});