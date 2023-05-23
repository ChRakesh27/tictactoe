const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()
const app = express()
app.use(cors())
let serverList = {};
let roomId = 0;

const Port = process.env.PORT || 5000;
const server = app.listen(Port, console.log("server run in port : " + Port))

const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
    }
})

io.on("connection", (socket) => {
    console.log("user connected : ", socket.id);

    socket.on("create_room", (username) => {
        roomId = String(parseInt(Math.random() * 900000 + 100000))
        serverList[roomId] = true;
        socket.join(roomId);

        socket.emit("create_successful", { username, roomId });
    })

    socket.on("exit_room", (data) => {
        const { roomId, isHost } = data;
        if (isHost) {
            socket.to(roomId).emit("exit");
            delete serverList[roomId]
        } else {
            serverList[roomId] = true
            socket.to(roomId).emit("pause");
        }
        socket.emit("exit", true);
    })

    socket.on("join_room", (data) => {
        const { roomId, username } = data;
        if (serverList[roomId]) {
            socket.join(roomId)
            socket.emit("join_successfully");
            socket.to(roomId).emit("enable_start_btn")
            serverList[roomId] = false
        }
    })

    socket.on("start_game", (roomId) => {
        socket.emit("game_started")
        socket.to(roomId).emit("game_started")
    })

    socket.on("game_over", (data) => {
        const { roomId } = data
        console.log("🚀 ~ roomId:", roomId)
        console.log("play_agin")
        socket.to(roomId).emit("playAgin", roomId)
    })
    socket.on("btnSet", (data) => {
        const { roomId, btnNo, btnVal } = data
        socket.to(roomId).emit("PressBtn", { btnNo, btnVal });
    })
})
