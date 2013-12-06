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
  var statement = $(tagId).text();
  var currentScore = +statement.substr(statement.length - 1, 1);
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

// The player can grab another players levitating object if it is a match
function objectMatchesAlreadySelectedObjects(possibleShape, player_id){
  if (player_id == '1'){
    if (player2_selectedShapeData.toString().indexOf(possibleShape) > -1){
      return true;
    }
  } else {
    if (player1_selectedShapeData.toString().indexOf(possibleShape) > -1){
      return true;
    }
  }
}

// Make objects levitate
// As players win objects then their slot in the shapes and colors arrays should be empty
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
        player1_selectedShapeData.push(shapes[index]);
        if (child){
          var clickTween = createjs.Tween.get(child, {override:true,loop:false})
                 .to({y:canvas.height-(canvas.height*.9), rotation:360}, 2500, createjs.Ease.bounceOut);
        }
      }
     });
     
  }
}

// Add object to player's collection and remove it from the board
// This should be called after a "win"
// So we know there is already a match
function grabObjectForPlayer(shapeAttribute, playerId){
  var indexOfShape = -1;
  var shapeEndPosition = 55;
  if ('CIRCLESQUARETRIANGLE'.indexOf(shapeAttribute) > -1){
  // if it is a circlesquaretriangle it is player 2 who won
  for (i =0; i < shapes.length; i++){
      if (shapes[i] == shapeAttribute){
        indexOfShape = i;
        shapes[i] = ""; //remove it
        colors[i] = "";
        break; // stop at the first one
      }
  }
  } else {
    // otherwise it is a color and it is player 1
    for (i = 0; i < colors.length; i++){
      if (colors[i] == shapeAttribute){
        indexOfShape = i;
        colors[i] = ""; //remove it
        shapes[i] = "";
        shapeEndPosition = canvas.width;
        break; // stop at the first one
      }
    }
  }
  // now look in the stage for the object
  var stageObject = stage.getChildAt(indexOfShape); // because the indexes should match up for n
  
  var clickTween = createjs.Tween.get(stageObject, {override:true,loop:false})
         .to({x:canvas.width-shapeEndPosition, rotation:360}, 2500, createjs.Ease.bounceOut)
         .wait(500)
         .to({scaleX:1.5, scaleY:1.5, y:canvas.height-(canvas.height*.5), rotation:360}, 500, createjs.Ease.bounceOut);
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
       // grab object for player's collection, possible object is a color or shape
       grabObjectForPlayer(possibleShape, playerId);
       //clear board
       var noMoreShapes = true;
       for (i = 0; i < shapes.length; i++){
         if (shapes[i] != ""){
           noMoreShapes = false;
           break;
         }
       }
       if (noMoreShapes){
         shapes = [];
         colors = [];
         
         loadNextLevel("1");
       } else {
         dropObjects(1);
         dropObjects(2);
       }
     } else {
      selectObjectsForPlayer(playerId, possibleShape);
     }
   } else {
     selectObjectsForPlayer(playerId, possibleShape);
   }
});

function dropObjects(player_id) {  
  if (player_id == 1){
    if (player1_selectedShapes) {
      $.each(player1_selectedShapes, function(index, shape) {
        
        if (shape){
            var tween = createjs.Tween.get(shape, {loop:false})
                  .to({x:shape.x, y:canvas.height - 55}, 500, createjs.Ease.bounceOut);
        }
      });
    }
    player1_selectedShapes = [];
    player1_selectedShapeData = [];
  } else {
    if (player2_selectedShapes) {
      $.each(player2_selectedShapes, function(index, shape){
        if (shape){
          var tween = createjs.Tween.get(shape, {loop:false})
                  .to({x:shape.x, y:canvas.height - 55}, 500, createjs.Ease.bounceOut);
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

function loadNextLevel(nextLevelNumber){
  
  stage.removeAllChildren();
  stage.update();
  
  
  $.getJSON( "data/test.json", function( data ) {
    $.each( data, function( level, levelData) {
      if (level == nextLevelNumber) {
        $.each(levelData, function(key, val){
          var shapeType = val.Shape;
          var shapeColor = val.Color;
          
          shapes.push(shapeType); // for data indexing, player 1 gets shapes
          colors.push(readableColor(shapeColor)); // for data indexing, player 2 gets colors
        });
      }
    });
    
   
    for (i = 0; i < shapes.length; i++) {
    
      var ball;
      var shapeType = shapes[i];
      var shapeColor = colors[i];
      if (shapeType == "SQUARE"){
        ball = createBox(shapeColor);
      } else if (shapeType == "CIRCLE"){
        ball = createBall(shapeColor);
      } else{
        ball = createTriangle(shapeColor);
      }
      ball.x = 200 + (i * 80);
      ball.y = -50; // so that it falls from above
      var tween = createjs.Tween.get(ball, {loop:false})
            .to({x:ball.x, y:canvas.height - 55}, 1500, createjs.Ease.bounceOut);
      stage.addChild(ball);
    }
    
  }); 
}

function initializeShapes(){
  player1_selectedShapes = [];
  player1_selectedShapeData = [];
  player2_selectedShapes = [];
  player2_selectedShapeData = [];
  
  canvas = document.getElementById("testCanvas");
  stage = new createjs.Stage(canvas);
  stage.autoClear = true;

  shapes = [];
  colors = [];
  loadNextLevel("0");

  createjs.Ticker.addEventListener("tick", stage);
  
}

$(function() {
  setTimeout(initializeShapes, 2500);
}); //function end