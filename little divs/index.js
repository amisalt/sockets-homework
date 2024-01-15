let express = require('express');
let app = express();
let http = require('http');
let server = http.createServer(app);
let { Server } = require("socket.io");
let io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
let users = {}
io.on('connection', (socket) => {
  console.log(`user connected ${socket.id}`);
  socket.emit("yourID", socket.id)
  for(let user of Object.keys(users)){
    socket.emit("movementData",{"xRatio":users[user].xRatio, "yRatio":users[user].yRatio, "id":user})
  }
  users[socket.id] = {"xRatio":0.5,"yRatio":0.5}
  socket.broadcast.emit("movementData",{"xRatio":users[socket.id].xRatio, "yRatio":users[socket.id].yRatio, "id":socket.id})
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on("mousemove", data=>{
    users[socket.id] = {"xRatio":data.xRatio, "yRatio":data.yRatio}
    socket.broadcast.emit("movementData",{"xRatio":data.xRatio, "yRatio":data.yRatio, "id":socket.id})
  })
});
server.listen(3001, () => {
  console.log('listening on *:3001');
});