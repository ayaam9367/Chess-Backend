const {WebSocketServer} = require('ws');

//create a standalone websocket server
const wss = new WebSocketServer({port : process.env.WEBSOCKET_PORT});

wss.on('connection', (ws, req)=>{

    const ip = req.socket.remoteAddress;
    console.log(`🔌 New connection from ${ip}`);

    ws.send('Welcome to the standalone WebSocket server !');

    ws.on('message', (message)=>{
        console.log(`📩 Received: ${message}`);
        ws.send(`Message received : ${message} `);
    });

    ws.on('close', ()=>{
        console.log(`❌ Connection closed from: ${ip}`);
    });
});

console.log(`🔌 WebSocket server running on : ws://localhost:${process.env.WEBSOCKET_PORT}`);

module.exports = {
    wss
}