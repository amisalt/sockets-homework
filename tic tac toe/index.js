const express = require("express")
const http = require("http")
const {Server} = require("socket.io")
const { markAsUntransferable } = require("worker_threads")
const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.get("/", (req,res)=>{
    res.sendFile(__dirname+"/index.html")
})
let users = []
io.on("connection", (socket)=>{
    socket.emit("users list", users)
    if(!users.includes(socket.id)) users.push(socket.id)
    socket.broadcast.emit("new user", socket.id)
    let gameroom
    let matrix = [0,0,0,0,0,0,0,0,0]
    const winVariants = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]]
    function checkWin(){
        for(let variant of winVariants){
            if(matrix[variant[0]] == matrix[variant[1]] && matrix[variant[1]] == matrix[variant[2]]) return matrix[variant[0]]
        }
    }
    socket.on("opp choice", oppId=>{
        gameroom = `room-${socket.id}-${oppId}`
        socket.join(gameroom)
        socket.to(oppId).emit("join room", [gameroom, socket.id])
    })
    socket.on("join room", room=>{
        console.log(123);
        gameroom = room[0]
        socket.join(gameroom)
        socket.emit("wait", matrix)
        socket.broadcast.to(gameroom).emit("move", matrix)
    })
    socket.on("moved", matrixS=>{
        matrix = matrixS
        let win = checkWin()
        console.log(win);
        if(win > 0)io.to(gameroom).emit("win", gameroom)
        else{
            socket.emit("wait", matrixS)
            socket.broadcast.to(gameroom).emit("move", matrixS)
        }
    })
    socket.on("leave", room=>{
        socket.leave(room)
    })
})
server.listen(3001)