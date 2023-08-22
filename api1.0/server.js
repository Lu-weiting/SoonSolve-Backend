const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const fs = require('fs');
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

app.use('/api/1.0/users', usersRouter);
app.use('/api/1.0/tasksReqRouter', tasksReqRouter);
app.use('/api/1.0/tasks', tasksRouter);
app.use('/api/1.0/task_req', tasksReqRouter);
app.get('/api/1.0/', (req, res) => {
    res.status(200).send('connected')
});

// const options = {
//     key: fs.readFileSync('./private/private.key'),
//     cert: fs.readFileSync('./private/certificate.crt')
//   };

const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "http://52.64.240.159",
    },
});

io.use((socket, next) => {
    const token = socket.handshake.headers.authorization
    console.log("socket test token:", token)
    if (!token || !token.startsWith('Bearer ')) {
        return { error: 'No token provided' };
    }
    try {
        next();
    } catch (error) {
        return { error: 'Invalid token' };
    }
});
io.on("connection", (socket) => {
    const token = socket.handshake.headers.authorization
    console.log("socket test token:", token)
    const accessToken = token.split(' ')[1];
    const decoded = jwt.verify(accessToken, 'process.env.SECRET');
    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

    });
    socket.on("newMessage", async(msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username, msg.message));
        const connection = await connectionPromise;
        try {
            const sql = "INSERT INTO message (message, sender_id, receiver_id , room_id) VALUES (?, ?, ? ,?)";
            const [insertChat] = await connection.execute(sql, [msg.message, decoded.id, msg.id, user.room]);

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