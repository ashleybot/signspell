var socket = io.connect();
var canvas, stage, shapes;
var player1_selectedShapes;

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
  if (player_id == 1)
  {
    $("#player1").append('<div class="message"><p>' + pseudo + ' : ' + msg + '</p></div>');
  }
  else{
    $("#player2").append('<div class="message"><p>' + pseudo + ' : ' + msg + '</p></div>');
  }
}

// message
socket.on('message', function(data) {
   addMessage(data['message'], data['pseudo'], data['player_id']);
   // TODO if the message is a shape, then make some objects levitate
   var possibleShape = data['message'];
   if ('CIRCLESQUARETRIANGLE'.indexOf(possibleShape) > -1){
    
    var child = null;
    if (possibleShape == 'CIRCLE') {
      child = stage.getChildAt(1);
    } else if (possibleShape == 'SQUARE') {
      child = stage.getChildAt(2);
    }
    player1_selectedShapes.push(child);
    if (child){
      var clickTween = createjs.Tween.get(player1_selectedShapes[0], {override:true,loop:false})
             .to({y:canvas.height-(canvas.height*.9), rotation:360}, 2500, createjs.Ease.bounceOut);
    }
   }
});

function dropObjects(player_id) {
  //TODO Get player's selected objects and drop them
  player1_selectedShapes.pop();
}

// shape Changed
socket.on('shapeChanged', function(data) {
  dropObjects(data['player_id']);
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

function createBox() {
  var ball = new createjs.Shape();
  ball.graphics.setStrokeStyle(5, 'round', 'round');
  ball.graphics.beginStroke(('#000000'));
  ball.graphics.beginFill("#FF0000").drawRect(0,0,100,100);
  ball.graphics.endStroke();
  ball.graphics.endFill();
  return ball;
}

function createTriangle() {
  
}

$(function() {
  player1_selectedShapes = [];
  
  canvas = document.getElementById("testCanvas");
  stage = new createjs.Stage(canvas);
  stage.autoClear = true;

  shapes = [];
  $.getJSON( "data/asl.json", function( data ) {
    
    $.each( data, function( key, val) {
      var ball;
      if ((key.length % 2) === 0){
        ball = createBox();
      } else{
        ball = createBall();
      }
      shapes.push(ball);
  
    }); //each
  
    $.each(shapes, function(index, ball){
      ball.x = 200 + (index * 80);
      ball.y = -50; // so that it falls from above
      var tween = createjs.Tween.get(ball, {loop:false})
            .to({x:ball.x, y:canvas.height - 55}, 1500, createjs.Ease.bounceOut);
             //.to({x:ball.x, y:canvas.height - 55, rotation:-360}, 1500, createjs.Ease.bounceOut);
             /*.wait(1000)
             .to({x:canvas.width-55, rotation:360}, 2500, createjs.Ease.bounceOut)
             .wait(1000 + (500 * index)).call(handleComplete)
             .to({scaleX:2, scaleY:2, x:canvas.width - 110, y:canvas.height-110}, 2500, createjs.Ease.bounceOut)
             .wait(1000)
             .to({scaleX:.5, scaleY:.5, x:30, rotation:-360, y:canvas.height-30}, 2500, createjs.Ease.bounceOut);*/
      
      stage.addChild(ball);
    });
    createjs.Ticker.addEventListener("tick", stage);
  }); // getJSON
  
  $("#logo").click( function(){
    var child = stage.getChildAt(0);
    if (child){
      var clickTween = createjs.Tween.get(child, {override:true,loop:false})
             .to({y:canvas.height-(canvas.height*.9), rotation:360}, 2500, createjs.Ease.bounceOut);
    }
  });

}); //function end