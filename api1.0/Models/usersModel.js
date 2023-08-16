// 引入資料庫連線
const connectionPromise = require('../utils/database').connectionPromise;
const crypto = require('crypto'); // 引入 crypto 套件，用於加密處理
const auth = require('../utils/auth')
const errorMsg = require('../utils/error');

module.exports = {
  signUp: async (name, email, password) => {
    const connection = await connectionPromise;
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
  tasksRecord: async (my_id, type) => {
    const connection = await connectionPromise;
    try {
      let nextCursor = null;
      let query;
      if(type == 'Released')
      {
        query  = `SELECT t.*, u.name, u.nickname, u.picture 
        FROM tasks t
        LEFT JOIN users u ON t.poster_id = u.id
        WHERE t.id = ?
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
        WHERE ut.taker_id = ?
        `;
      }

      const [results] = await connection.execute(query, [my_id]);
      if (results.length == 0) return error_message.taskNotExist(res);
      const response = {
        data: {
          task: {
            id: postId,
            title: results.title,
            poster_id: results.poster_id,
            created_at: results.created_at,
            closed_at: results.closed_at,
            deadline: results.deadline,
            task_vacancy: results.task_vacancy,
            approved_count: results.approved_count,
            location: results.location,
            reward: results.reward,
            content: results.content,
            name: results.name,
            nickname: results.nickname,
            picture: results.picture,
            status: results.status,
          }
        }
      };
      return res.status(200).json(response);
    }catch (error) {
      errorMsg.query(res);
    } finally {
      console.log('connection release');
      connection.release();
    }
  }
}
