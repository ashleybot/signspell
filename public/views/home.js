var socket = io.connect();
var canvas, stage, shapes, colors;
var player1_selectedShapes, player1_selectedShapeData;
var player2_selectedShapes, player2_selectedShapeData;


function addPlayer(player, pseudo) {
  if (player == 1)
  {
    $("#player1_handle").html("Welcome " + pseudo);
    $('#player1_score').html("Score: 0");
  }
  else
  {
    $("#player2_handle").html("Welcome " + pseudo);
    $('#player2_score').html("Score: 0");
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

function increaseScore(player_id){
  var tagId = "#player1_score";
  if (player_id == 2){
    tagId =  '#player2_score';
  }
  var statement = $(tagId).innerHTML;
  var currentScore = +statement.substr(statement.length - 1, 1);
  console.log(currentScore);
  $(tagId).html("Score: " + (currentScore + 1));
  
}

function otherPlayerHasSelectedObjects(player_id){
  if (player_id == '1'){
    if (player2_selectedShapes.length > 0){
      return true;
    }
  } else {
    if (player1_selectedShapes.length > 0){
      return true;
    }
  }
  return false;
}

function objectMatchesAlreadySelectedObjects(possibleShape, player_id){
  if (player_id == '1'){
    // opposite player's shapes are names
    console.log("player 1");
    if (player2_selectedShapeData.toString().indexOf(possibleShape) > -1){
      console.log("shape matches");
      return true;
    }
  } else {
    console.log("player 2");
    // opposite player's shapes are colors
    if (player1_selectedShapeData.toString().indexOf(possibleShape) > -1){
      console.log("shape matches");
      return true;
    }
  }
}

function selectObjectsForPlayer(player_id, possibleShape){
  if ('CIRCLESQUARETRIANGLE'.indexOf(possibleShape) > -1){
    $.each(shapes, function(index){
      var child = null;
      if (shapes[index] == possibleShape){
        child = stage.getChildAt(index); // because the indexes should match up for now
        player2_selectedShapes.push(child);
        player2_selectedShapeData.push(colors[index]);
        if (child){
          var clickTween = createjs.Tween.get(child, {override:true,loop:false})
                 .to({y:canvas.height-(canvas.height*.9), rotation:360}, 2500, createjs.Ease.bounceOut);
        }
      }
    });
    
   } else if ('REDBLUEGREEN'.indexOf(possibleShape) > -1){
     $.each(colors, function(index){
      var child = null;
      if (colors[index] == possibleShape){
        child = stage.getChildAt(index); // because the indexes should match up for now
        player1_selectedShapes.push(child);
        player1_selectedShapes.push(shapes[index]);
        if (child){
          var clickTween = createjs.Tween.get(child, {override:true,loop:false})
                 .to({y:canvas.height-(canvas.height*.9), rotation:360}, 2500, createjs.Ease.bounceOut);
        }
      }
     });
     
  }
}

// message
socket.on('message', function(data) {
   addMessage(data['message'], data['pseudo'], data['player_id']);
   
   var possibleShape = data['message'];
   var playerId = data['player_id'];
   
   if ( otherPlayerHasSelectedObjects(playerId) ){
     if ( objectMatchesAlreadySelectedObjects(possibleShape, playerId) ){
        //win!
       increaseScore(playerId);
       //clear board
       dropObjects(1);
       dropObjects(2);
     } else {
      selectObjectsForPlayer(playerId, possibleShape);
     }
   } else {
     selectObjectsForPlayer(playerId, possibleShape);
   }
   console.log("end message");
});

function dropObjects(player_id) {  
  if (player_id == 1){
    if (player1_selectedShapes) {
      $.each(player1_selectedShapes, function(index, shape) {
        
        if (shape){
            var tween = createjs.Tween.get(shape, {override:true,loop:false})
                  .to({x:shape.x, y:canvas.height - 55}, 1500, createjs.Ease.bounceOut);
        }
      });
    }
    player1_selectedShapes = [];
    player1_selectedShapeData = [];
  } else {
    if (player2_selectedShapes) {
      $.each(player2_selectedShapes, function(index, shape){
        if (shape){
          var tween = createjs.Tween.get(shape, {override:true,loop:false})
                  .to({x:shape.x, y:canvas.height - 55}, 1500, createjs.Ease.bounceOut);
        }
      });
    }
    player2_selectedShapes = [];
    player2_selectedShapeData = [];
  }
}

// shape Changed
socket.on('shapeChanged', function(data) {
  dropObjects(data['player_id']);
});


function handleComplete(tween) {
  var ball = tween._target;
  
}

function createBall(color) {
  var ball = new createjs.Shape();
  ball.graphics.setStrokeStyle(5, 'round', 'round');
  ball.graphics.beginStroke(('#000000'));
  ball.graphics.beginFill(color).drawCircle(0,0,50);
  ball.graphics.endStroke();
  ball.graphics.endFill();
  ball.graphics.setStrokeStyle(1, 'round', 'round');
  ball.graphics.beginStroke(('#000000'));
  ball.graphics.moveTo(0,0);
  ball.graphics.lineTo(0,50);
  ball.graphics.endStroke();
  return ball;
}

function createBox(color) {
  var ball = new createjs.Shape();
  ball.graphics.setStrokeStyle(5, 'round', 'round');
  ball.graphics.beginStroke(('#000000'));
  ball.graphics.beginFill(color).drawRect(0,-50,100,100);
  ball.graphics.endStroke();
  ball.graphics.endFill();
  return ball;
}

function createTriangle(color) {
  var ball = new createjs.Shape();
  ball.graphics.setStrokeStyle(5, 'round', 'round');
  ball.graphics.beginStroke(('#000000'));
  ball.graphics.beginFill(color);
  ball.graphics.moveTo(-50,-50);
  ball.graphics.lineTo(50,50);
  ball.graphics.lineTo(-50,50);
  ball.graphics.lineTo(-50,-50);
  ball.graphics.endStroke();
  ball.graphics.endFill();
  return ball;
  
}

function readableColor(hex){
  if (hex.indexOf("FF0000") > -1){
    return 'RED';
  } else if (hex.indexOf("0000FF") > -1) {
    return 'BLUE';
  } else {
    return 'GREEN';
  }
}

$(function() {
  player1_selectedShapes = [];
  player2_selectedShapes = [];
  
  canvas = document.getElementById("testCanvas");
  stage = new createjs.Stage(canvas);
  stage.autoClear = true;

  shapes = [];
  colors = [];
  $.getJSON( "data/test.json", function( data ) {
    
    $.each( data, function( key, val) {
      var shapeType = val.Shape;
      var shapeColor = val.Color;

      var ball;
      if (shapeType == "SQUARE"){
        ball = createBox(shapeColor);
      } else if (shapeType == "CIRCLE"){
        ball = createBall(shapeColor);
      } else{
        ball = createTriangle(shapeColor);
      }
      
      shapes.push(shapeType); // for data indexing, player 1 gets shapes
      colors.push(readableColor(shapeColor)); // for data indexing, player 2 gets colors
      
      ball.x = 200 + (key * 80);
      ball.y = -50; // so that it falls from above
      var tween = createjs.Tween.get(ball, {loop:false})
            .to({x:ball.x, y:canvas.height - 55}, 1500, createjs.Ease.bounceOut);
      stage.addChild(ball);
  
    }); //each
  
    // Here are some tween examples
             /*.to({x:ball.x, y:canvas.height - 55, rotation:-360}, 1500, createjs.Ease.bounceOut);
             .wait(1000)
             .to({x:canvas.width-55, rotation:360}, 2500, createjs.Ease.bounceOut)
             .wait(1000 + (500 * index)).call(handleComplete)
             .to({scaleX:2, scaleY:2, x:canvas.width - 110, y:canvas.height-110}, 2500, createjs.Ease.bounceOut)
             .wait(1000)
             .to({scaleX:.5, scaleY:.5, x:30, rotation:-360, y:canvas.height-30}, 2500, createjs.Ease.bounceOut);*/

    createjs.Ticker.addEventListener("tick", stage);
  }); // getJSON

}); //function end