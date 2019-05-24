
//these can be changed by switchTokens. initial token value is set in HTML
var meToken = document.getElementById("me-token");
var computerToken = document.getElementById("computer-token");

//these can be changed by changeDifficulty. initial value set in HTML
var childMode = document.getElementById("child-mode");
var easyMode = document.getElementById("easy-mode");
var hardMode = document.getElementById("hard-mode");

var humanScore = 0;
var computerScore = 0;

//arrays containing human and computer moves
var humanMoves = [];
var computerMoves = [];

//call function to start the game;
startGame();

function playGame(e) {
    //set "X" in document based on where user clicks and using meToken value
    var box = e.target;
    if (box.textContent == "") {
      //this statement actually places the human token on the web page
      document.getElementById(box.id).textContent = meToken.firstChild.nodeValue;
      document.getElementById(box.id).className += "inner-shadow";
      //this places the position of human the token in an array. it places the move as a subarray like ["top", "left"]
      humanMoves.push(box.id.split("-"));
      //call function to determine if win has occurred    
      if (threeInARow(humanMoves)) {
        var winLine = winningLine(humanMoves);
        //x ms timeout function is displayWinLine argument is winLine
        setTimeout(displayWinLine, 200, winLine);
        humanScore++;
        addScore();
      } else {
        //delays execution by x milliseconds. won't work in older ie. note that this is calling the computerTurn function with the argument humanMoves
        setTimeout(computerTurn, 200, humanMoves);
      }
    }
  } //end playGame function

//calls the logic and places the token on the board
function computerTurn(humanMoves) {
  if (cat()) {
    showLines();
    addScore();
    stopGame();
  }
  if (childMode.firstChild.nodeValue == "[X]") {
    var difficulty = "child"
  } else if (easyMode.firstChild.nodeValue == "[X]") {
    var difficulty = "easy"
  } else {
    var difficulty = "hard"
  }
  placeToken(turnLogic(humanMoves,difficulty));
  if (threeInARow(computerMoves)) {
    var winLine = winningLine(computerMoves);
    //x ms timeout function is displayWinLine argument is winLine
    setTimeout(displayWinLine, 200, winLine);
    computerScore++;
    addScore();
    stopGame();
  }
}

//update sessoin scores
function addScore() {
  var humanScoreElm = document.getElementById("me-wins");
  humanScoreElm.textContent = humanScore;
  var computerScoreElm = document.getElementById("computer-wins");
  computerScoreElm.textContent = computerScore;
}

//the logic of the gameplay. accepts an array of the humans moves. returns a move in form, eg, ["top","right"]. 
function turnLogic(humanMoves,difficulty) {
  var allowedMoves = findPossibleMoves();
  var humanCorners = cornersPlayed(humanMoves);

    //play the winning move if computer has two in a row
    if (haveTwoInARow(computerMoves)) {
      //an array showing where to play.
      var winningMove = findLineWithTwo(computerMoves);
      winningMove = placeRowFirst(winningMove);
      if (hasNotBeenPlayedByAnyone(winningMove)) {
        if (difficulty == "easy" || difficulty == "hard") {
          return winningMove;
        }
        if (difficulty == "child") {        //only a 50% chance to play winning move
          if (randomWithinRange(1,4)<=2) {
            return winningMove
          }
        }
      }
    }

    //just play random stuff if difficulty is child
    if (difficulty == "child") {
      return randomMove();
    }
  
    //second block if human has two in a row
    if (haveTwoInARow(humanMoves)) {
      //an array showing where to play.
      var likelyMove = findLineWithTwo(humanMoves,difficulty);
      likelyMove = placeRowFirst(likelyMove);
      if (hasNotBeenPlayedByAnyone(likelyMove)) {
        return likelyMove;
      }
    }
    
    //if hard mode is selected block possible fork
    if (difficulty=="hard") {
      if (canFork(humanCorners)) {
        return randomOpenSide();
      }
    }
  
    //play middle if possible  
    if (canPlayMiddle(allowedMoves)) {
      var middlePlay = ["middle", "middle"];
      if (hasNotBeenPlayedByAnyone(middlePlay)) {
        return middlePlay
      }
    }

    //take opposite corner
    if (humanCorners) {
      var oppCorner = (takeOppositeCorner(humanCorners));
      if (hasNotBeenPlayedByAnyone(oppCorner)) {
        return oppCorner;
      }
    }

    //play open corner
    if (openCorners()) {
      return randomOpenCorner()
    };

    //play random open side
    return randomOpenSide();

  } //end computerTurn function

//displays the win line
function displayWinLine(winLine) {
  var svgParent = document.getElementById("win-lines").className;
  var svgLine = document.getElementById(winLine).className;
  svgParent.baseVal = "";
  svgLine.baseVal = "";
}

//remove all win lines
function removeLines() {
  var allLines = ["top", "middleH", "bottom", "left", "middleV", "right", "southeast", "northeast"]
  var i = 0;
  var svgParent = document.getElementById("win-lines").className;
  svgParent.baseVal = "invisible";
  while (allLines[i]) {
    var svgLine = document.getElementById(allLines[i]).className;
    svgLine.baseVal = "invisible";
    i++
  }
}

//show all win lines
function showLines() {
  var allLines = ["top", "middleH", "bottom", "left", "middleV", "right", "southeast", "northeast"]
  var i = 0;
  var svgParent = document.getElementById("win-lines").className;
  svgParent.baseVal = "";
  while (allLines[i]) {
    var svgLine = document.getElementById(allLines[i]).className;
    svgLine.baseVal = "";
    i++
  }
}

//is the game a draw? return true if eight moves are taken
function cat() {
  var allMoves = allTakenMoves();
  if (allMoves.length === 9) {
    return true;
  }
  return false;
}

//can the player (human or computer) fork? return true or false
function canFork(cornerArr) {
  if (cornerArr.length != 2) {
    return false
  }
  var i = 0;
  if (cornerArr[i][0] != cornerArr[i+1][0] && cornerArr[i][1] != cornerArr[i+1][1] ) {
    return true
  }
  return false
}

//inclusively generate a random number between within the range
function randomWithinRange(min, max) {
  var result = Math.floor(Math.random() * ((max + 1) - min)) + min;
  return result;
}

function randomMove() {
  var rows = ["top","middle","bottom"];
  var columns = ["left","middle","right"];
  var randMove = [rows[randomWithinRange(0,2)],columns[randomWithinRange(0,2)]]
  if (hasNotBeenPlayedByAnyone(randMove)) {
    return randMove;
  } else {
    computerTurn(humanMoves);
  }
}

//returns an array of available corners
function openCorners() {
  var theCorners = [
    ["top", "left"],
    ["top", "right"],
    ["bottom", "left"],
    ["bottom", "right"]
  ];
  var allMoves = allTakenMoves();
  var takenCorners = cornersPlayed(allMoves);
  var i = 0;
  var j = 0;
  while (theCorners[i]) {
    while (takenCorners[j]) {
      //replace taken corners with ""
      if (theCorners[i][0] === takenCorners[j][0] && theCorners[i][1] === takenCorners[j][1]) {
        theCorners[i] = "";
      }
      j++;
    }
    j = 0;
    i++;
  }

  //remove "" from array
  spliceEmpties(theCorners);

  //return an array of the open corners
  if (theCorners) {
    return theCorners;
  } else {
    return false;
  }
}

//returns an array of open sides same logic as open corners funciton
function openSides() {
  var theSides = [
    ["top", "middle"],
    ["middle", "left"],
    ["middle", "right"],
    ["bottom", "middle"]
  ]
  var takenSides = sidesPlayed();
  var i = 0;
  var j = 0;

  while (theSides[i]) {
    while (takenSides[j]) {
      //replace taken corners with ""
      if (theSides[i][0] === takenSides[j][0] && theSides[i][1] === takenSides[j][1]) {
        theSides[i] = "";
      }
      j++;
    }
    j = 0;
    i++;
  }

  //remove "" from array
  spliceEmpties(theSides);

  //return an array of the open corners
  if (theSides) {
    return theSides;
  } else {
    return false;
  }

}

//splices empties from array, eg ["", "hi", "", "there"] becomes ["hi", "there"]
function spliceEmpties(arr) {
  for (var i = arr.length - 1; i >= 0; i--) {
    if (!arr[i]) {
      arr.splice(i, 1);
    }
  }
  return arr;
}

//returns a random open corner
function randomOpenCorner() {
  var openC = openCorners();
  return openC[randomWithinRange(0, openC.length - 1)];
}

//returns a random open side
function randomOpenSide() {
  var openS = openSides();
  return openS[randomWithinRange(0, openS.length - 1)];
}

//function trim the possible moves based on what moves have been taken by human and computer. 
function findPossibleMoves() {
  //array containing original universe of moves
  var possibleMoves = [
    ["top", "left"],
    ["top", "middle"],
    ["top", "right"],
    ["middle", "left"],
    ["middle", "middle"],
    ["middle", "right"],
    ["bottom", "left"],
    ["bottom", "middle"],
    ["bottom", "right"]
  ];

  var allMoves = allTakenMoves();
  for (i = 0; i < allMoves.length; i++) {
    for (j = 0; j < possibleMoves.length; j++) {
      if (allMoves[i][0] == possibleMoves[j][0] && allMoves[i][1] == possibleMoves[j][1]) {
        possibleMoves.splice(j, 1);
      } //end if
    } //end inner for
  } //end outer for
  return possibleMoves;
}

//function that returns true if middle square is available
function canPlayMiddle(possibleMoves) {
  for (var i = 0; i < possibleMoves.length; i++) {
    if (possibleMoves[i][0] == "middle" && possibleMoves[i][1] == "middle")
      return true;
  }
  return false;
}

//function that creates an array of all moves taken
function allTakenMoves() {
  return humanMoves.concat(computerMoves);
}

//function to return array containing played corners. parameter is array of all moves of human or computer. returns array of playedCorners
function cornersPlayed(arr) {
  var playedCorners = [];
  for (var i = 0; i < arr.length; i++) {
    if (arr[i][0] == "top" && arr[i][1] == "left") {
      playedCorners.push([arr[i][0], arr[i][1]]);
    }
    if (arr[i][0] == "top" && arr[i][1] == "right") {
      playedCorners.push([arr[i][0], arr[i][1]]);
    }
    if (arr[i][0] == "bottom" && arr[i][1] == "left") {
      playedCorners.push([arr[i][0], arr[i][1]]);
    }
    if (arr[i][0] == "bottom" && arr[i][1] == "right") {
      playedCorners.push([arr[i][0], arr[i][1]]);
    }
  }
  return playedCorners;
}

//function to return array containing played corners. parameter is array of all moves of human or computer
function sidesPlayed() {
  var arr = allTakenMoves()
  var playedSides = [];
  for (var i = 0; i < arr.length; i++) {
    if (arr[i][0] == "top" && arr[i][1] == "middle") {
      playedSides.push([arr[i][0], arr[i][1]]);
    }
    if (arr[i][0] == "middle" && arr[i][1] == "left") {
      playedSides.push([arr[i][0], arr[i][1]]);
    }
    if (arr[i][0] == "middle" && arr[i][1] == "right") {
      playedSides.push([arr[i][0], arr[i][1]]);
    }
    if (arr[i][0] == "bottom" && arr[i][1] == "middle") {
      playedSides.push([arr[i][0], arr[i][1]]);
    }
  }
  return playedSides;
}

function takeOppositeCorner(opponentCorners) {

  for (var i = 0; i < opponentCorners.length; i++) {
    if (opponentCorners[i][0] == "top" && opponentCorners[i][1] == "left" && hasNotBeenPlayedByAnyone(["bottom", "right"])) {
      return ["bottom", "right"]
    }
    if (opponentCorners[i][0] == "top" && opponentCorners[i][1] == "right" && hasNotBeenPlayedByAnyone(["bottom", "left"])) {
      return ["bottom", "left"]
    }
    if (opponentCorners[i][0] == "bottom" && opponentCorners[i][1] == "left" && hasNotBeenPlayedByAnyone(["top", "right"])) {
      return ["top", "right"]
    }
    if (opponentCorners[i][0] == "bottom" && opponentCorners[i][1] == "right" && hasNotBeenPlayedByAnyone(["top", "left"])) {
      return ["top", "left"]
    }
  }
}

//function to determine if there are two in a row
function haveTwoInARow(arr) {
  counter(arr);
  if (arr.length > 1) {
    if (tops == 2 || middles == 2 || bottoms == 2 || lefts == 2 || middlesV == 2 || rights == 2 || diagSouthEast == 2 || diagNorthEast == 2) { //reset counters
      tops = middles = bottoms = lefts = middlesV = rights = diagSouthEast = diagNorthEast = 0;
      return true
    }
  }
  return false
}

//function  to find a line with two in a row and an opening if one exists. parameter is an array of moves by human 
function findLineWithTwo(arr1,difficulty) {
    var whatsMissingArr = [];
    //send passed array to counter.
    var linesArr = counter(arr1);
    //a helper array for the for loop
    var linesArrFeeder = ["top", "middle", "bottom", "left", "middle", "right"]
      //go through linesArr but not the diagonals
    for (var i = linesArr.length-3; i >= 0; i--) {
      //and look for any item with at least two (close to a win)
      whatsMissingArr = [];
      if (linesArr[i] == 2) {
        //if you find one, loop through the array of moves and find the commonality of the moves that make up the row (e.g. "top" meaning two in top row)
        for (var j = 0; j < arr1.length; j++) {
          //this if looks for two matching rows (eg top, middle, or bottom)
          if (arr1[j][0] == linesArrFeeder[i]) {
            //push the existing moves to an array. this will always be two of three moves.
            whatsMissingArr.push(arr1[j][1])
          }
          //this if looks for two matching columns (eg left, middle, or right)
          if (arr1[j][1] == linesArrFeeder[i]) {
            //push the existing moves to an array. this will always be two of three moves.
            whatsMissingArr.push(arr1[j][0])
          }
        }
        //remove duplicates from array because sometimes the above gives two middles
        whatsMissingArr = removeDups(whatsMissingArr);

        //send out the array of two of three moves to findTheThird and return what's missing preceded by the stored row or column
        var suggestedMove = [linesArrFeeder[i], findTheThird(whatsMissingArr)];
        if (hasNotBeenPlayed(suggestedMove)) {
                return suggestedMove;
            } else {
                var suggestedMove = [
                    linesArrFeeder[i],
                    findTheThirdVertical(whatsMissingArr)
                ];
                if (hasNotBeenPlayed(suggestedMove) && (difficulty=="hard")) {
                    return suggestedMove;
                }
            }
      } //end if linesArr[i] == 2
    } //end outer for loop
    //if we haven't return anything yet, there are no straight lines so we will look for a diagonal. note that //linesArr[6] is southEastDiag
    if (linesArr[6] == 2) {
      return missingSouthEastDiag(diagMoves(arr1)) //returns in form of ["top","left"]
    }
    if (linesArr[7] == 2) {
      return missingNorthEastDiag(diagMoves(arr1)) //returns in form of ["bottom","left"]
    }
    return false;
  } //end findLineWithTwo function

//determined if a move has been played by computer
function hasNotBeenPlayed(suggestedMove) {
  suggestedMove = placeRowFirst(suggestedMove)
  for (var i = 0; i < computerMoves.length; i++) {
    if (computerMoves[i][0] == suggestedMove[0] && computerMoves[i][1] == suggestedMove[1]) {
      return false;
    }
  }
  return true;
}

//determined if a move has been played by anyone
function hasNotBeenPlayedByAnyone(suggestedMove) {
  if (!suggestedMove) {
    return false
  }
  var allMoves = allTakenMoves();
  for (var i = 0; i < allMoves.length; i++) {
    if (allMoves[i][0] == suggestedMove[0] && allMoves[i][1] == suggestedMove[1]) {
      return false;
    }
  }
  return true;
}

//remove duplicates from an array
function removeDups(arr) {
  for (i = 0; i < arr.length; i++) {
    var j = 0;
    while (arr[j]) {
      if (j != i) {
        if (arr[i] == arr[j]) {
          arr.splice(i, 1);
        }
      }
      j++
    }
  }
  return arr;
}

//splice any elements beyond [1] from array
function arrSplice(arr){
  var i = arr.length
  while (i < 2) {
    arr = arr.splice(i,1);
    i--;
  }
  return arr;  
}

//create array of moves played by owner of parameter if diagonal run has two
function diagMoves(arr) {
  var whatsMissingArr = [];
  //if we are looking at a southEast diagonal near-win, make an array of the moves already played
  if (diagSouthEast == 2) {
    for (var i = 0; i < arr.length; i++) {
      if ((arr[i][0] == "top" && arr[i][1] == "left") || (arr[i][0] == "bottom" && arr[i][1] == "right") || (arr[i][0] == "middle" && arr[i][1] == "middle")) {
        whatsMissingArr.push([arr[i][0], arr[i][1]])
      }
    }
    return whatsMissingArr;
  }
  //same but for a northeast diag line
  if (diagNorthEast == 2) {
    for (var j = 0; j < arr.length; j++) {
      if ((arr[j][0] == "top" && arr[j][1] == "right") || (arr[j][0] == "bottom" && arr[j][1] == "left") || (arr[j][0] == "middle" && arr[j][1] == "middle")) {
        whatsMissingArr.push([arr[j][0], arr[j][1]])
      }
    }
    return whatsMissingArr;
  }

}

//function to find which space is missing, eg 'left, right' returns 'middle'
function findTheThird(arr) {
    if (arr.indexOf("left") >= 0 && arr.indexOf("middle") >= 0) {
      return "right"
    }
    if (arr.indexOf("middle") >= 0 && arr.indexOf("right") >= 0) {
      return "left"
    }
    if (arr.indexOf("right") >= 0 && arr.indexOf("left") >= 0) {
      return "middle"
    }
    if (arr.indexOf("top") >= 0 && arr.indexOf("middle") >= 0) {
      return "bottom"
    }
    if (arr.indexOf("middle") >= 0 && arr.indexOf("bottom") >= 0) {
      return "top"
    }
    if (arr.indexOf("top") >= 0 && arr.indexOf("bottom") >= 0) {
      return "middle"
    }
  } //end findTheThird function

//alternative version of the above that tends to return vertical rows if possible.
function findTheThirdVertical(arr) {
    if (arr.indexOf('top') >= 0 && arr.indexOf('middle') >= 0) {
        return 'bottom';
    }
    if (arr.indexOf('middle') >= 0 && arr.indexOf('bottom') >= 0) {
        return 'top';
    }
    if (arr.indexOf('top') >= 0 && arr.indexOf('bottom') >= 0) {
        return 'middle';
    }
    if (arr.indexOf('left') >= 0 && arr.indexOf('middle') >= 0) {
        return 'right';
    }
    if (arr.indexOf('middle') >= 0 && arr.indexOf('right') >= 0) {
        return 'left';
    }
    if (arr.indexOf('right') >= 0 && arr.indexOf('left') >= 0) {
        return 'middle';
    }
}

//find missing piece of south east diagonal
function missingSouthEastDiag(arr) {
  var firstMoves = [];
  //create array of move row
  for (i = 0; i < arr.length; i++) {
    firstMoves.push(arr[i][0]);
  }
  //return the appropriate move
  if (firstMoves.indexOf("middle") < 0) {
    return ["middle", "middle"]
  }
  if (firstMoves.indexOf("top") < 0) {
    return ["top", "left"]
  }
  if (firstMoves.indexOf("bottom") < 0) {
    return ["bottom", "right"]
  }
}

//find missing piece of south east diagonal
function missingNorthEastDiag(arr) {
  var firstMoves = [];
  //create array of move row
  for (i = 0; i < arr.length; i++) {
    firstMoves.push(arr[i][0]);
  }
  //return the appropriate move
  if (firstMoves.indexOf("middle") < 0) {
    return ["middle", "middle"]
  }
  if (firstMoves.indexOf("top") < 0) {
    return ["top", "right"]
  }
  if (firstMoves.indexOf("bottom") < 0) {
    return ["bottom", "left"]
  }
}

//this function places a token in the format [row, column] in the web page
function placeToken(arr) {
  arr = placeRowFirst(arr);
  //join the array into what will equal the div id
  var tokenPlace = arr.join("-");
    //place the computer token within the div id
  document.getElementById(tokenPlace).textContent = computerToken.firstChild.nodeValue;
  //log the move to the computer moves array
  computerMoves.push(arr);
}

//make sure that row is named first
function placeRowFirst(arr) {
  if (arr[0] == "left" || arr[0] == "right" || arr[0] == "middle" && arr[1] != "middle" && arr[1] != "left" && arr[1] != "right") {
    arr = [arr[1], arr[0]]
  }
  return arr;
}

//figure out the winning line so it can be drawn on. parameter is array of either human or computer moves
function winningLine(arr) {
  var allMoves = allTakenMoves();
  //an array of the html ids of the different lines that corresponds with the order of the array allMoves
  var lineArrHtmlIds= ["top", "middleH", "bottom", "left", "middleV", "right", "southeast", "northeast"]
  var lineArr = counter(arr);
  var i = 0;
  while (lineArr[i] >=0) {
    if (lineArr[i] === 3) {
      return lineArrHtmlIds[i]
    }
    i++;
  }
  return false;
}

//defining a win. relies on counter function.
function threeInARow(arr) {
    //we need the counter function to show number in each variable
    counter(arr);
    //because can't win without at least three plays
    if (arr.length > 2) {
      if (tops == 3 || middles == 3 || bottoms == 3 || lefts == 3 || middlesV == 3 || rights == 3 || diagSouthEast == 3 || diagNorthEast == 3) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    } //end if arr.length > 2
  } //end threeInARow

//this function counts progress towards a win. global variables are used in other functions doing more specific things. returns array in form of [tops, middles, bottoms, lefts, middlesV, rights, diagSouthEast, diagNorthEast]
function counter(arr) {
    //i don't know about this //set player object
    tops = 0;
    middles = 0;
    bottoms = 0;
    lefts = 0;
    middlesV = 0; //vertical middles
    rights = 0;
    diagSouthEast = 0;
    diagNorthEast = 0;

    for (i = 0; i < arr.length; i++) {
      //each if statement describes one of the 9 ways to win
      if (arr[i][0] == "top") {
        tops++
        if (arr[i][1] == "left") {
          diagSouthEast++;
        }
        if (arr[i][1] == "right") {
          diagNorthEast++;
        }
      }
      if (arr[i][0] == "middle") {
        middles++;
        if (arr[i][1] == "middle") {
          diagSouthEast++;
          diagNorthEast++;
        }
      }
      if (arr[i][0] == "bottom") {
        bottoms++;
        if (arr[i][1] == "right") {
          diagSouthEast++;
        }
        if (arr[i][1] == "left") {
          diagNorthEast++;
        }
      }
      if (arr[i][1] == "left") {
        lefts++;
      }
      if (arr[i][1] == "middle") {
        middlesV++;
      }
      if (arr[i][1] == "right") {
        rights++;
      }
    } //end for loop

    return [tops, middles, bottoms, lefts, middlesV, rights, diagSouthEast, diagNorthEast];

  } //end counter function

//function to set game difficulty
function changeDifficulty() {
    if (easyMode.firstChild.nodeValue == "[X]") {
      easyMode.firstChild.nodeValue = "[ ]";
      hardMode.firstChild.nodeValue = "[X]";
    } else {
      hardMode.firstChild.nodeValue = "[ ]";
      easyMode.firstChild.nodeValue = "[X]";
    }
  } //end changeDifficulty

function childDifficulty() {
  childMode.firstChild.nodeValue = "[X]"
  easyMode.firstChild.nodeValue = "[ ]";
  hardMode.firstChild.nodeValue = "[ ]";
}

function easyDifficulty() {
  childMode.firstChild.nodeValue = "[ ]"
  easyMode.firstChild.nodeValue = "[X]";
  hardMode.firstChild.nodeValue = "[ ]";
}

function hardDifficulty() {
  childMode.firstChild.nodeValue = "[ ]"
  easyMode.firstChild.nodeValue = "[ ]";
  hardMode.firstChild.nodeValue = "[X]";
}

//function to swap X and O
function switchTokens() {
    if (meToken.firstChild.nodeValue == "X") {
      swapGameBoardTokens("O");
      meToken.firstChild.nodeValue = "O";
      computerToken.firstChild.nodeValue = "X";
    } else {
      swapGameBoardTokens("X");
      meToken.firstChild.nodeValue = "X";
      computerToken.firstChild.nodeValue = "O";
    }
  } //end switchTokens

//swap any existing tokens on gameboard. parameter is the token to switch to
function swapGameBoardTokens(switchTo) {
    //this loops through the three sibling elements in the top row ('top-left', 'top-middle', and 'top-right)
    if (switchTo == "X") {
      var otherToken = "O"
    } else {
      var otherToken = "X"
    }
    //call the function that will swap
    swapLoop("top", switchTo, otherToken);
    swapLoop("middle", switchTo, otherToken);
    swapLoop("bottom", switchTo, otherToken);
  } //end swapGameboardTokens

//function that will loop through rows and swap tokens
function swapLoop(rowName, token1, token2) {
  var squareToChange = document.getElementById(rowName + "-left");
  while (squareToChange) {
    if (squareToChange.textContent == token1) {
      squareToChange.textContent = token2
    } else if (squareToChange.textContent == token2) {
      squareToChange.textContent = token1
    }
    squareToChange = squareToChange.nextSibling;
  }
}

//function to add help text describing the swap of player tokens
function tokenHelpText() {
  var popup = document.getElementById("popup");
  if (popup.className == "invisible") {
    popup.className = ""; //remove 'invisible' class
  } else {
    popup.className = "invisible";
  }
}

//function to add help text describing changing difficulty
function difficultyHelpText() {
  var popup = document.getElementById("popup-difficulty");
  if (popup.className == "invisible") {
    popup.className = ""; //remove 'invisible' class
  } else {
    popup.className = "invisible";
  }
}

//passes all three row names to resetRow function
function resetRows() {
  resetARow("top")
  resetARow("middle")
  resetARow("bottom")
}

//clears all values of row name passed. expects "top", "middle", or "bottom"
function resetARow(rowName) {
  var resetSquare = document.getElementById(rowName + "-left");
  while (resetSquare) {
    resetSquare.textContent = "";
    resetSquare = resetSquare.nextSibling;
  }
}

function startGame() {
  //add event listener to 'game-board' table
gameBoardEventListener = document.getElementById("game-board");
gameBoardEventListener.addEventListener("click", playGame, false);
}

function stopGame() {
   gameBoardEventListener.removeEventListener("click", playGame, false)
}

//function to reset board
function reset() {
  humanMoves = [];
  computerMoves = [];
  resetRows();
  if (!isSvgVisible()) {
      computerScore++;
      addScore();
      }
  removeLines();
  startGame();
  
}

//returns true if SVG is visible on screen
function isSvgVisible() {
  var svgParent = document.getElementById("win-lines").className;
  if (svgParent.baseVal == "invisible") {
    return false
  } else {
    return true
  };
}

//function to reset session
function resetSession() {
  reset();
  humanScore = 0;
  computerScore = 0;
  addScore();
}

//add event listener to table 'player-token-assignment'
tokenEventListener = document.getElementById("player-token-assignment");
tokenEventListener.addEventListener("click", switchTokens, false);

//add event listeners to change difficulty
childDifEventListener = document.getElementById("child-mode");
childDifEventListener.addEventListener("click", childDifficulty, false);
easyDifEventListener = document.getElementById("easy-mode");
easyDifEventListener.addEventListener("click", easyDifficulty, false);
hardDifEventListener = document.getElementById("hard-mode");
hardDifEventListener.addEventListener("click", hardDifficulty, false);

//add event listener to offer popup box on mouseover of who is X and who is O
popupEventListener = document.getElementById("player-token-assignment");
popupEventListener.addEventListener("mouseenter", tokenHelpText, false);
popupEventListener.addEventListener("mouseleave", tokenHelpText, false);

//add event listener to offer popup on setting difficulty
popupDifficultyEventListener = document.getElementById("game-difficulty");
popupDifficultyEventListener.addEventListener("mouseenter", difficultyHelpText, false);
popupDifficultyEventListener.addEventListener("mouseleave", difficultyHelpText, false);

//event listener to reset table
resetGameEventListener = document.getElementById("reset-game");
resetGameEventListener.addEventListener("click", reset, false);

//event listener to reset session
resetSessionEventListener = document.getElementById("reset-session");
resetSessionEventListener.addEventListener("click", resetSession, false);