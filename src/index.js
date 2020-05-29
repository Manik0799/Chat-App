const path= require("path")
const express = require("express");
const http= require("http")
const socketio= require("socket.io")
const Filter= require("bad-words")
const { generateMessage }= require("./utils/messages")
const {addUser, removeUser, getUser, getUsersInRoom}= require("./utils/users")


const app = express();
const server= http.createServer(app)
const io= socketio(server)

const port= process.env.PORT ||3000
const publicDirectoryPath= path.join(__dirname, "../public")

app.use(express.static(publicDirectoryPath))


io.on("connection", (socket) => {

    console.log("New Websocket connection")

    // Joining the room
    socket.on("join", ({ username, room }, callback) => {

        const {error, user}= addUser({
            id : socket.id,
            username,
            room
        })

        if(error){
            return callback(error)
        }
        socket.join(user.room)
        
        let msg= "Welcome to the chat"
        socket.emit("message", generateMessage("Chat App" , msg))
        // Sending message to everyone except who has joined the room
        socket.broadcast.to(user.room).emit("message", generateMessage("Chat App", `${user.username} has joined the chat`))

        io.to(user.room).emit("roomData", {
            room : user.room,
            users : getUsersInRoom(user.room)
        })

        callback()
    })

    // Listening to client's message
    socket.on("sendMessage", (userMessage, callback) => {
        const filter= new Filter()
        if(filter.isProfane(userMessage)){
            return callback("Use of profane language prohibited")
        }
        const user= getUser(socket.id)
        if(user){
            // Sending the message to all connected clients of that room
            io.to(user.room).emit("message", generateMessage(user.username, userMessage))
            callback()
        }
    })

    // Location receiving and then emitting
    socket.on("sendLocation", (location, callback) => {
        const coordinates= `https://google.com/maps?q=${location.lat},${location.long}`
        const user= getUser(socket.id)
        if(user){
            io.to(user.room).emit("locationmessage", generateMessage(user.username, coordinates))
            callback()
        }
    })

    // When a user disconnects from the chat
    socket.on("disconnect", () => {
        const user= removeUser(socket.id)
        if(user){
            io.to(user.room).emit("message", generateMessage("Chat App", `${user.username} has left the chat`)) 
            io.to(user.room).emit("roomData", {
                room : user.room,
                users : getUsersInRoom(user.room)
            })   
        }
        
    })

})



server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});