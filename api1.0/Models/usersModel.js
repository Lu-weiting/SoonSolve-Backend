// 引入資料庫連線
const connectionPromise = require('../utils/database').connectionPromise;
const crypto = require('crypto'); // 引入 crypto 套件，用於加密處理
const auth = require('../utils/auth')
const errorMsg = require('../utils/error');

//Set Timezone
const moment = require('moment-timezone'); 
moment.tz.setDefault("Asia/Taipei");

module.exports = {
  signUp: async (name, email, password) => {
    const connection = await connectionPromise;
    console.log('test');
    // 檢查是否已經有相同的 email 註冊過
    const userQuery = 'SELECT email FROM users WHERE email = ?';
    const [rows] = await connection.execute(userQuery, [email]);
    if (rows.length != 0) {
      return errorMsg.duplicateEmail(res);
    }
    // 使用 crypto 加密密碼
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // 執行註冊的 SQL 
    const signupQuery = 'INSERT INTO users(name, email, password, picture, provider) VALUES(?,?,?,?)';
    const [results] = await connection.execute(signupQuery, [name, email, hashedPassword, null]);

    const id = results.insertId;

    // 創建包含註冊資訊和 JWT 的回應
    const response = {
      'data': {
        'access_token': auth.generateJWTToken(id),
        "user": {
          "id": id,
          "name": name,
          "email": email,
          "picture": null
        }
      }
    };
    return response;
  },
  signIn: async (email) => {
    // 查詢使用者是否存在
    const signinQuery = 'SELECT * FROM users WHERE email = ?';
    const [is_exist] = await connection.execute(signinQuery, [email]);
    if (is_exist.length === 0) {
      return errorMsg.noUser(res);
    }
    const user = is_exist[0];
    return user;
  },
  tasksRecord: async (res, my_id, type, cursor, limit) => {
    const connection = await connectionPromise;
    let decodeCuser = null;
    let query;
    try {
      if(cursor == null){
        decodeCuser = Math.pow(2, 64);
      }else {
        decodeCuser = await tool.decryptCursor(cursor);
      }
      
      if(type == 'Released')
      {
        query  = `SELECT t.*, u.name, u.nickname, u.picture 
        FROM tasks t
        LEFT JOIN users u ON t.poster_id = u.id
        WHERE t.poster_id = ? AND t.id < ?
        ORDER BY t.id DESC LIMIT ?
        `;
      }else if (type == 'Accepted'){
        query  = `SELECT ut.status,
        t.id,
        t.poster_id,
        t.created_at,
        t.closed_at,
        t.deadline,
        t.task_vacancy,
        t.approved_count,
        t.content,
        t.location,
        t.reward,
        t.picture,
        u.name,
        u.nickname,
        u.picture 
        FROM user_task ut
        LEFT JOIN tasks t ON ut.task_id = t.id
        LEFT JOIN users u ON t.poster_id = u.id
        WHERE ut.taker_id = ? AND t.id < ?
        ORDER BY t.id DESC LIMIT ?
        `;
      }
      const [results] = await connection.execute(query, [my_id, decodeCuser, limit]);
      if (results.length == 0) {
        return error_message.taskNotExist(res);
      }else if(results.length < limit){
        nextCursor = null;
      }else{
        const lastPostId = results[results.length - 1].id;
        nextCursor = await tool.encryptCursor(lastPostId);
        nextCursor = encodeURIComponent(nextCursor);
      }
      const promises = results.map(async taskResult => {
        //const taipeiDateTime = moment.utc(results.results.created_at).tz('Asia/Taipei');
        //const formattedDateTime = taipeiDateTime.format('YYYY-MM-DD HH:mm:ss');
        const content = {
          id: taskResult.id,
          title: taskResult.title,
          poster_id: taskResult.poster_id,
          created_at: moment.utc(taskResult.created_at).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
          closed_at: moment.utc(taskResult.closed_at).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
          deadline: moment.utc(taskResult.deadline).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
          task_vacancy: taskResult.task_vacancy,
          approved_count: taskResult.approved_count,
          location: taskResult.location,
          reward: taskResult.reward,
          content: taskResult.content,
          name: taskResult.name,
          nickname: taskResult.nickname,
          picture: taskResult.picture,
          status: taskResult.status,
        };
        return content;
      });
      try {
        const tasksResult = await Promise.all(promises);
        const response = {
          data: {
            task: tasksResult,
            next_cursor: nextCursor
          }
        };
        return response;
      } catch (error) {
        console.error(error);
        throw new Error('Server error');
      }
    }catch (error) {
      errorMsg.query(res);
    } finally {
      console.log('connection release');
      connection.release();
    }
  },
  getProfile: async(res,targetId,my_id)=>{
    const connection = await connectionPromise;
    try {
      
    }catch (error) {
      errorMsg.query(res);
    } finally {
      console.log('connection release');
      connection.release();
    }
  }
}
