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

function addMessage(msg, pseudo, player_id) {
  if (player_id ==1)
  {
    $("#player1").append('<div class="message"><p>' + pseudo + ' : ' + msg + '</p></div>');
  }
  else{
    $("#player2").append('<div class="message"><p>' + pseudo + ' : ' + msg + '</p></div>');
  }
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
   addMessage(data['message'], data['pseudo'], data['player_id']);
});

function handleComplete(tween) {
  var ball = tween._target;
  
}

function createBall() {
  var ball = new createjs.Shape();
  ball.graphics.setStrokeStyle(5, 'round', 'round');
  ball.graphics.beginStroke(('#000000'));
  ball.graphics.beginFill("#FF0000").drawCircle(0,0,50);
  ball.graphics.endStroke();
  ball.graphics.endFill();
  ball.graphics.setStrokeStyle(1, 'round', 'round');
  ball.graphics.beginStroke(('#000000'));
  ball.graphics.moveTo(0,0);
  ball.graphics.lineTo(0,50);
  ball.graphics.endStroke();
  return ball;
}

$(function() {
    
  var canvas = document.getElementById("testCanvas");
  var stage = new createjs.Stage(canvas);
  stage.autoClear = true;

  var balls = [];
  $.getJSON( "data/asl.json", function( data ) {
    
    $.each( data, function( key, val) {
      var ball = createBall();
      balls.push(ball);
  
    }); //each
  
    $.each(balls, function(index, ball){
      ball.x = 200 + (index * 80);
      ball.y = -50; // so that it falls from above
      var tween = createjs.Tween.get(ball, {loop:false})
             .to({x:ball.x, y:canvas.height - 55, rotation:-360}, 1500, createjs.Ease.bounceOut)
             .wait(1000)
             .to({x:canvas.width-55, rotation:360}, 2500, createjs.Ease.bounceOut)
             .wait(1000 + (500 * index)).call(handleComplete)
             .to({scaleX:2, scaleY:2, x:canvas.width - 110, y:canvas.height-110}, 2500, createjs.Ease.bounceOut)
             .wait(1000)
             .to({scaleX:.5, scaleY:.5, x:30, rotation:-360, y:canvas.height-30}, 2500, createjs.Ease.bounceOut);
      console.log(ball);
      stage.addChild(ball);
    });
    createjs.Ticker.addEventListener("tick", stage);
  }); // getJSON

}); //function end