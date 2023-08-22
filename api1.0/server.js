const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
// 
// const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const connectionPromise = require('./utils/database').connectionPromise;
const dotenv = require('dotenv');
dotenv.config();
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
} = require("./utils/users");

const app = express();

require('dotenv').config();

app.use(cors());
app.use('/static', express.static('/soonsolve/static'));
app.use(express.json());
const usersRouter = require('./Routers/usersRouter');
const tasksRouter = require('./Routers/tasksRouter');
const tasksReqRouter = require('./Routers/tasksReqRouter');
const eventsRouter = require('./Routers/eventsRouter')
const friendsRouter = require('./Routers/friendsRouter');
const chatRouter = require('./Routers/chatRouter');

app.use('/api/1.0/users', usersRouter);
app.use('/api/1.0/tasks', tasksRouter);
app.use('/api/1.0/task_req', tasksReqRouter);
app.use('/api/1.0/friends', friendsRouter);
app.use('/api/1.0/events', eventsRouter);
app.use('/api/1.0/chat', chatRouter);
app.get('/api/1.0/', (req, res) => {
    res.status(200).send('connected')
});

const options = {
    key: fs.readFileSync('./private/private.key'),
    cert: fs.readFileSync('./private/certificate.crt')
  };
const server = http.createServer(app);

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
    },
});

io.use((socket, next) => {
    const token = socket.handshake.headers.authorization
    console.log("socket test token:", token)
    if (!token || !token.startsWith('Bearer ')) {
        console.log("No token provided")
        return { error: 'No token provided' };
      }
      try {
        const accessToken = token.split(' ')[1];
        // 'WeShare' 之後要移去.env
        const decoded = jwt.verify(accessToken, process.env.SECRET);
        console.log("Decoded:",decoded)
        next();
      } catch (error) {
        console.log("error:",error)
        return { error: 'Invalid token' };
      }
});
io.on("connection", (socket) => {
    const token = socket.handshake.headers.authorization
    console.log("socket test token:", token)
    const accessToken = token.split(' ')[1];
    const decoded = jwt.verify(accessToken, process.env.SECRET);
    console.log(decoded);
    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        console.log(socket.id);
        socket.join(user.room);
        console.log("join success");

    });
    socket.on("newMessage", async(msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username, msg.message));
        const connection = await connectionPromise;
        try {
            const sql1 = "INSERT INTO rooms (id) VALUES (?)";
            const sql2 = "INSERT INTO messages (message, sender_id, receiver_id , room_id) VALUES (?, ?, ? ,?)";
            const [insertChat1] = await connection.execute(sql1, [user.room]);
            const [insertChat2] = await connection.execute(sql2, [msg.message, decoded.id, msg.id, user.room]);

        } catch (error) {
            console.log(error);
        } finally {
            console.log('connection release');
        }
    });
    // Runs when client disconnects
    socket.on("userDisconnect", () => {
        const user = userLeave(socket.id);
    });

});


const PORT = 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// module.exports = server;