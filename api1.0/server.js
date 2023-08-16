const express = require('express');
const cors = require('cors'); // 引入 CORS 套件，用於處理跨來源請求

const app = express();
app.use(cors());
app.use(express.json()); // 使用內建的 express.json 中間件，解析請求的 JSON 資料

const usersRouter = require('./Routers/usersRouter')
const tasksRouter = require('./Routers/tasksRouter');

app.use('/api/1.0/users', usersRouter);
app.use('/api/1.0/tasks', tasksRouter);
app.get('/api/1.0/', (req, res) => {
  res.status(200).send('connected')
})

module.exports = app