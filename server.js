const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // 本番環境では特定のオリジンに制限してください
    methods: ["GET", "POST"]
  },
  // ★★★ データサイズの上限を上げる設定を追加 ★★★
  maxHttpBufferSize: 1e8 // 100MBまで許容 (1e8 = 100,000,000 bytes)
});

// サーバー側で家系図の状態を保持（空の状態で開始）
let serverState = {
    people: [],
    relationships: []
};

io.on('connection', (socket) => {
  console.log('a user connected');

  // 1. 新しいクライアントに現在の最新データを送信
  socket.emit('initial-state', serverState);

  // 2. クライアントからのデータ更新リクエストを待ち受ける
  socket.on('update-state', (newState) => {
 
    // サーバーのデータを更新
    serverState = newState;
    
    // 3. 更新を自分を含む全クライアントに送信
    io.emit('state-updated', serverState);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(4000, () => {
  console.log('listening on *:4000');
});