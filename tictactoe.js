$(document).ready(function() {



	/* *******************
		SETUP VARIABLES
	******************* */

	var winner;

	// Winning combinations
	var wins = [
		[1, 2, 3],
		[4, 5, 6],
		[7, 8, 9],
		[1, 4, 7],
		[2, 5, 8],
		[3, 6, 9],
		[1, 5, 9],
		[3, 5, 7]
	];

	// Scorebord variables
	var gameNumber = 1;
	var Xwins = 0;
	var Owins = 0;





	/* *******************
		GENERAL FUNCTIONS
	******************* */



	/* Clear the Board */

	function clearBoard() {
		$('.square').removeClass('Xplayed');
		$('.square').removeClass('Oplayed');
		$('.square').removeClass('played');

		$('.square').data("played", false);
		$('.square').data("player", "");
	}
	$('.reset-board-button').click(function() {
		clearBoard();
	})



	/* Check if the Square has Already Been Played */

	function checkIfSquareFree(squareNumber) {
		if ( $('.square[data-square="'+squareNumber+'"]').data("played") === true ) {
			return false; // Square is not free
		} else {
			return true; // Square is free
		}
	}



	/* Manage the Win Table */

	function addWinToTable() {

		if (winner === 'X') {
			Xwins++

			// Add new row to table
			$('.scores tbody').append('<tr><td>'+gameNumber+'</td><td>Win</td><td>Lose</td></tr>');
		} else {
			Owins++

			// Add new row to table
			$('.scores tbody').append('<tr><td>'+gameNumber+'</td><td>Lose</td><td>Win</td></tr>');
		}

		// Update total wins
		$('.x-wins').html(Xwins);
		$('.o-wins').html(Owins);

		gameNumber++;
	}



	/* Register if winning combination has happened */

	function registerWin(x, y, z) {

		if (

			// All three winning squares played
			$('.square[data-square="'+x+'"]').data("played") === true &&
			$('.square[data-square="'+y+'"]').data("played") === true &&
			$('.square[data-square="'+z+'"]').data("played") === true

			&&

			// All three squares played by the same player
			$('.square[data-square="'+x+'"]').data("player") === $('.square[data-square="'+y+'"]').data("player")
			&& $('.square[data-square="'+x+'"]').data("player") === $('.square[data-square="'+z+'"]').data("player") )

		{

			winner = $('.square[data-square="'+x+'"]').data("player");
			return true;

		} else {
			return false;
		}

	} // end registerWin


	/* Check if there is a draw */

	function checkDraw() {

		if ( $('.square.played').length === 9 ) {
			alert("Draw! Try again");
			clearBoard();
		}

	}


	/* Check if there is a win */

	function checkWin() {

		// Loop through all winning combinations
		for (i = 0; i < wins.length; i++) {

			var w = registerWin(wins[i][0], wins[i][1], wins[i][2]);

			if (w) {

				alert(winner+ " won!");
				addWinToTable();
				clearBoard();
			}

			if ( !w && i === (wins.length - 1) ) {
				checkDraw();
			}
		} // end loop
	} // end checkWin




	/* *******************
		O PLAY
	******************* */

  // Set difficulty
  var difficulty = $('#difficulty').val();

  $('#difficulty').on('change', function () {
    difficulty = $('#difficulty').val();
  });

  // Temp board for AI
  var board = [];

  function OPlay() {
    fillBoard();
    var move = minMax(difficulty, "O", -Infinity, Infinity)[1];

    $('.square[data-square="'+move+'"').addClass("Oplayed");
    $('.square[data-square="'+move+'"').addClass("played");
    $('.square[data-square="'+move+'"').data("played", true);
    $('.square[data-square="'+move+'"').data("player", "O");

    board = [];

    checkWin();
  }

  // fill temp board for AI
  function fillBoard() {
    for (var i = 1; i <= 9; i++) {
      if ($('.square[data-square="'+i+'"]').data("played") === true) {
        var player = $('.square[data-square="'+i+'"]').data("player");
        board.push(player);
      } else {
        board.push("");
      }
    }
  }

  /** Min Max algorith with alpha, beta prunning
   *  Return best possible move.
   *  use dept to determine game difficulty
   */
  function minMax(dept, player, alpha, beta) {
    var bestMove = -1;
    var score = 0;

    if (over() || dept === 0) {
      score = scoreBoard();
      return [score, bestMove];
    }

    var validMOves = possibleMoves();

    for (var i = 0; i < validMOves.length; i++) {
      board[validMOves[i] - 1] = player; // Account for array index

      if (player === "O") { // If AI's turn
        score = minMax(dept-1, "X", alpha, beta)[0];
        if (score > alpha) {
          alpha = score;
          bestMove = validMOves[i];
        }
      } else { // If opponet's turn
        score = minMax(dept-1, "O", alpha, beta)[0]
        if (score < beta) {
          beta = score;
          bestMove = validMOves[i];
        }
      }

      board[validMOves[i] - 1] = ""; // Undo move

      // Prune: stop iteration if alpha >= beta
      if (alpha >= beta) break;
    }

    score = (player === "O")? alpha : beta;

    return [score, bestMove]
  }

  // Check if game is won or board is full
  function over() {
    return (won() || board.indexOf("") === -1)
  }

  // Check board for winning combination
  function won() {
    for (var i = 0; i < wins.length; i++) {
      if (board[wins[i][0] - 1] !== "") {
        if (board[wins[i][0] - 1] === board[wins[i][1] - 1] &&
            board[wins[i][1] - 1] === board[wins[i][2] - 1]) {
              return true;
            }
      }
    }
    return false;
  }

  // Return an array of possible/unplayed moves
  function possibleMoves() {
    var moves = [];
    for (var i = 1; i <= 9; i++) {
      if (board[i - 1] === "") moves.push(i);
    }
    return moves;
  }

  // Evaluate and score a possible move.
  function scoreBoard() {
    score = 0;
    for (var i = 0; i < wins.length; i++) {
      score += evaluateCombo(wins[i])
    }
    return score;
  }

  /** Evaluate a win combination
   * Return +100, +10, +1 for 3, 2, 1 in a row for AI
   * Return -100, -10, -1 for 3, 2, 1 in a row for opponet
   */
  function evaluateCombo(combo) {
    score = 0;

    // one in a row
    if (board[combo[0] - 1] === "O")  score = 1;
    else if (board[combo[0] - 1] === "X") score = -1;

    // two in a row
    if (board[combo[1] - 1] === "O") {
      if (score === 1) score = 10; // two in a row for AI
      else if (score === -1) return 0;
      else score = 1;
    } else if (board[combo[1] - 1] === "X") {
      if (score === -1) score = -10; // two in a row for opponet
      else if (score == 1) return 0;
      else score = -1;
    }

    // Three in a row
    if (board[combo[2] - 1] === "O") {
      if (score > 0) score *= 10; // three in a row for AI
      else if (score < 0) return 0;
      else score = 1;
    } else if (board[combo[1] - 1] === "X") {
      if (score < 0) score *= 10; // three in a row for opponet
      else if (score > 1) return 0;
      else score = -1;
    }

    return score;
  }


	/* *******************
		X PLAY
	******************* */

	$(".square").on("click", function() {

		if ( checkIfSquareFree( $(this).data("square") ) ) {

			$(this).addClass("Xplayed");
			$(this).addClass("played");

			$(this).data("played", true);
			$(this).data("player", "X");

			checkWin();

			OPlay();

		} else {
			alert("Square already played. Please try again.")
		}


	})









})