const express = require('express');
const cors = require('cors'); // 引入 CORS 套件，用於處理跨來源請求

const app = express();

require('dotenv').config(); // 載入 .env 檔案中的環境變數

app.use(cors());
app.use('/static', express.static('/soonsolve/static'));
app.use(express.json()); // 使用內建的 express.json 中間件，解析請求的 JSON 資料

const usersRouter = require('./Routers/usersRouter')
const tasksRouter = require('./Routers/tasksRouter');
const tasksReqRouter = require('./Routers/tasksReqRouter');
const eventsRouter = require('./Routers/eventsRouter')

app.use('/api/1.0/users', usersRouter);
app.use('/api/1.0/tasks', tasksRouter);
app.use('/api/1.0/task_req', tasksReqRouter);
app.use('/api/1.0//events/', eventsRouter);
app.get('/api/1.0/', (req, res) => {
  res.status(200).send('connected')
})

module.exports = app