const { wss } = require("./server.js"); //require the wss from its server file

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

        //clear the waiting slot
        waiting = null;

        //store game if needed
        const gameId = Date.now().toString();
        games.set(gameId, { player1, player2, moves: [] });

        //notify the players
        player1.send(
          JSON.stringify({
            type: "game_start",
            message: `Opponent matched: ${player2}`,
            color: `white`,
            opponent: player2,
            gameId,
          })
        );
        player2.send(
          JSON.stringify({
            type: "game_start",
            message: `Opponent matched: ${player1}`,
            color: `black`,
            opponent: player1,
            gameId,
          })
        );

        // attach metadata for future reference
        player1.gameId = gameId;
        player2.gameId = gameId;
      }
    } else if (msg.type === generalSocketMessages.MOVE) {
      const { gameId, move } = msg;
      const game = games.get(gameId);
      if (!game) {
        ws.send(JSON.stringify({ type: "error", message: "Game not found" }));
        return;
      }

      (game.moves ??= []).push(move);

      //relay the move to the opponent
      const opponent = game.player1 === ws ? game.player2 : game.player1;
      opponent.send(JSON.stringify({ type: "opponent_move", move }));

      console.log(`♟️ Move in game ${gameId}: ${move}`);
    }
  });

  ws.on("close", () => {
    console.log("❌ A player disconnected");

    // If the waiting player disconnects, reset waiting
    if (waiting === ws) waiting = null;
  });
});
