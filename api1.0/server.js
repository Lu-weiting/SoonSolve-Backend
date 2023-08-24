const express = require('express');
const cors = require('cors');
const http = require('http');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const rbq = require('./utils/rbqWorker');
const mailer = require('./utils/mail');

const token = 'MTE0NDA4MzM0MzkyMzc0MDc4Mw.GTq7OX.O0MRVD_HBBKe6NTDhF5k5h_T_scMPQN7Sq3opA'; // 替換成您的 Bot 令牌
const guildId = '1144086033504423996'; // 您的伺服器 ID
const channelId = '1144089064971194408'; // 您想要發送訊息的頻道 ID

const headers = {
  Authorization: `Bot ${token}`,
};
const apiUrl = `https://discord.com/api/v10/channels/${channelId}/messages`;
const messageContent = 'Hello from my Discord bot!'; // 您想要發送的訊息內容

axios.post(apiUrl, { content: messageContent }, { headers })
.then(response => {
console.log('Message sent:', response.data);
})
.catch(error => {
console.error('Error sending message:', error.message);
});



const formatMessage = require("./utils/messages");
const connectionPromise = require('./utils/database').connectionPromise;
const dotenv = require('dotenv');
dotenv.config();

const {
    userJoin,
    getCurrentUser,
    userLeave,
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
const mapRouter = require('./Routers/mapRouter');

app.use('/api/1.0/users', usersRouter);
app.use('/api/1.0/tasks', tasksRouter);
app.use('/api/1.0/task_req', tasksReqRouter);
app.use('/api/1.0/friends', friendsRouter);
app.use('/api/1.0/events', eventsRouter);
app.use('/api/1.0/chat', chatRouter);
app.use('/api/1.0/map', mapRouter);
app.get('/api/1.0/', (req, res) => {
    res.status(200).send('connected')
});


const server = http.createServer(app);
console.log("call start head");
rbq.startWorker.catch(console.error);
console.log("start fail");
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
    socket.on("joinRoom", async({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        console.log(socket.id);
        socket.join(user.room);
        console.log("join success");
        const connection = await connectionPromise;

        try {
            const sql = "SELECT * FROM rooms WHERE id = ?"
            const [selectResult] = await connection.execute(sql, [user.room]);
            if(selectResult.length==0){
                const sql1 = "INSERT INTO rooms (id) VALUES (?)";
                await connection.execute(sql1, [user.room]);
            }
        } catch (error) {
            console.log(error);
        } finally {
            console.log('connection release');
        }
    });
    socket.on("newMessage", async(msg) => {
        const user = getCurrentUser(socket.id);
        const connection = await connectionPromise;
        try {
            const sql2 = "INSERT INTO messages (message, sender_id, receiver_id , room_id) VALUES (?, ?, ? ,?)";
            const sql3 = "SELECT * FROM users WHERE id = ?"
            const [pictureResult] = await connection.execute(sql3,[decoded.id])
            io.to(user.room).emit("message", formatMessage(decoded.id,pictureResult[0].picture,user.username, msg.message));
            console.log(pictureResult[0].email);
            console.log(pictureResult[0].name);
            const mailOptions = {
                from: 'howard369369@gmail.com', // 使用你的 Gmail 帳號
                to: pictureResult[0].email, // 收件人
                subject: 'Soon Solve', // 郵件主題
                text: `You got a new message from ${pictureResult[0].name}` // 郵件內容
            };
            mailer.enqueueMail(mailOptions).catch(console.error);
            console.log(`${msg.message},${decoded.id},${msg.id},${user.room}`);
            await connection.execute(sql2, [msg.message, decoded.id, msg.id, user.room]);
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