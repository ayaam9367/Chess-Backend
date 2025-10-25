const { wss } = require("./server.js"); //require the wss from its server file
const { v7: uuidv7 } = require("uuid");
const { Chess } = require("chess");

let waiting = null;
let games = new Map();
const socketMessages = require("../messages/en/socketMessages.js");

const generalSocketMessages = socketMessages.general;

wss.on("connection", (ws, req) => {
  let game;
  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch (error) {
      console.error("Invalid JSON message:", error.message);
      return;
    }

    if (msg.type === generalSocketMessages.INIT_GAME) {
      if (!waiting) {
        console.log("👤 Player is waiting for an opponent...");
        waiting = ws;
        ws.send(
          JSON.stringify({
            type: "waiting",
            message: "Waiting for an opponent...",
          })
        );
      } else {
        console.log("🎮 Pairing two players!");
        const player1 = waiting;
        const player2 = ws;

        const chess = new Chess();
        board = chess.board();
        const gameId = uuidv7();

        //clear the waiting slot
        waiting = null;

        //store game if needed
        const start_time = Date.now().toString();
        const game = {
          gameId,
          player1,
          player2,
          chess,
          start_time,
        };
        games.set(gameId, game);

        [player1, player2].forEach((p) => {
          p.send(
            JSON.stringify({
              type: "game_start",
              fen: chess.fen(),
            })
          );
        });

        //notify the players
        player1.send(
          JSON.stringify({
            type: "game_start",
            color: `white`,
            fen: chess.fen(),
            opponent: player2,
            gameId,
          })
        );
        player2.send(
          JSON.stringify({
            type: "game_start",
            color: `black`,
            fen: chess.fen(),
            opponent: player1,
            gameId,
          })
        );

        // attach metadata for future reference
        // player1.gameId = gameId;
        // player2.gameId = gameId;
      }
    } else if (msg.type === generalSocketMessages.MOVE) {
      const { move, gameId } = msg;
      makeMove(ws, gameId, move);

      console.log(`♟️ Move in game ${gameId}: ${move}`);
    }
  });

  ws.on("close", () => {
    console.log("❌ A player disconnected");

    // If the waiting player disconnects, reset waiting
    if (waiting === ws) waiting = null;
  });
});

/**
 * Do the following things here :
 * 1. Validate the move
 * 2. Is it this users move
 * 3. Update the board, push the move in the game object, update games Object
 *
 * 4. Check if the game is over
 *
 * 5. Send updated board to both the players
 */

const makeMove = (ws, gameId = "", move = "") => {
  const game = games.get(gameId);

  if (!game) {
    ws.send(JSON.stringify({ type: "error", message: "Game not found" }));
    return;
  }
  const { player1, player2 } = game;
  //check if it is this user's move
  const isWhiteMove = chess.turn() === "w";
  const isPlayer1 = ws === player1;

  if ((!isWhiteMove && isPlayer1) || (isWhiteMove && !isPlayer1)) {
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Not your turn!",
      })
    );
    return;
  }

  const { chess } = game;
  // attempt the move
  let moveResult;
  try {
    moveResult = chess.move(move);
  } catch (err) {
    ws.send(JSON.stringify({ type: "error", message: "Invalid move" }));
    return;
  }

  //check if the game is draw by 50-move rule, insufficient material
  const isDraw = chess.isDraw();
  if (isDraw) {
    const reason = chess.isDrawByFiftyMoves()
      ? "Draw By 50 moves rule"
      : "Draw by Insuffiecient Material Rule";

    [player1, player2].forEach((p) => {
      p.send(
        JSON.stringify({
          type: "game_draw",
          reason,
        })
      );
    });

    //cleanup
    games.delete(gameId);
    return;
  }

  //check if the game is over by Checkmate, Stalemate, or ThreefoldRepititon
  const isGameOver = chess.isCheckmate()
    ? "Checkmate"
    : chess.isStalemate()
    ? "Stalemate"
    : chess.isThreefoldRepitition()
    ? "Threefold Repition Rule"
    : "";

  if (isGameOver !== "") {
    [player1, player2].forEach((p) => {
      p.send(
        JSON.stringify({
          type: "game_over",
          reason: isGameOver,
          winner : chess.turn() === 'w' ? 'Black' : 'White'
        })
      );
    });

    //cleanup
    games.delete(gameId);
    return;
  }

  [player1, player2].forEach((p) => {
    p.send(
      JSON.stringify({
        type: "move_made",
        move: moveResult,
        fen: chess.fen(),
      })
    );
  });
};
