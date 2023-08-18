// 引入資料庫連線
const connectionPromise = require('../utils/database').connectionPromise;
const crypto = require('crypto'); // 引入 crypto 套件，用於加密處理
const auth = require('../utils/auth')
const tool = require('../utils/tool');
const errorMsg = require('../utils/error');

//Set Timezone
const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Taipei");

module.exports = {
  signUp: async (name, email, password, res) => {
    try{
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
      const signupQuery = 'INSERT INTO users(name, email, password, picture) VALUES(?,?,?,?)';
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
    }
    catch (error) {
      errorMsg.query(res);
    } 
    finally {
      console.log('connection release');
    }
  },
  signIn: async (email, res) => {
    try{
      const connection = await connectionPromise;
      // 查詢使用者是否存在
      const signinQuery = 'SELECT * FROM users WHERE email = ?';
      const [is_exist] = await connection.execute(signinQuery, [email]);
      if (is_exist.length === 0) {
        return errorMsg.noUser(res);
      }
      const user = is_exist[0];
      return user;
    }
    catch (error) {
      errorMsg.query(res);
    } 
    finally {
      console.log('connection release');
    }
  },
  tasksRecord: async (res, my_id, type, cursor, limit) => {
    const connection = await connectionPromise;
    let decodeCuser = null;
    let query;
    try {
      if (cursor == null) {
        decodeCuser = Math.pow(2, 64);
      } 
      else {
        decodeCuser = await tool.decryptCursor(cursor);
      }

      if (type == 'Released') {
        query = 
        `
        SELECT t.*, u.name, u.nickname, u.picture 
        FROM tasks t
        LEFT JOIN users u ON t.poster_id = u.id
        WHERE t.poster_id = ? AND t.id < ?
        ORDER BY t.id DESC LIMIT ${limit}
        `;
      } 
      else if (type == 'Accepted') {
        query = 
        `
        SELECT ut.status,
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
          u.name,
          u.nickname,
          u.picture 
        FROM user_task ut
        LEFT JOIN tasks t ON ut.task_id = t.id
        LEFT JOIN users u ON t.poster_id = u.id
        WHERE ut.taker_id = ? AND t.id < ?
        ORDER BY t.id DESC LIMIT ${limit}
        `;
      }
      const [results] = await connection.execute(query, [my_id, decodeCuser]);
      if (results.length == 0) {
        return errorMsg.taskNotExist(res);
      } 
      else if (results.length < limit) {
        nextCursor = null;
      } 
      else {
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
      const tasksResult = await Promise.all(promises);
      const response = {
        data: {
          task: tasksResult,
          next_cursor: nextCursor
        }
      };
      return response;
    } 
    catch (error) {
      errorMsg.query(res);
    } 
    finally {
      console.log('connection release');
    }
  },
  getProfile: async (res, targetId, my_id) => {
    const connection = await connectionPromise;
    try {
      const getProfileQuery = 
      `
      SELECT
        u.id AS user_id,
        u.name AS user_name,
        u.picture AS user_picture,
        u.credit AS user_credit,
        c.id AS comment_id,
        c.content AS comment_content,
        c.created_at AS comment_created_at,
        p.id AS poster_id,
        p.name AS poster_name,
        p.picture AS poster_picture
      FROM users u
      LEFT JOIN comments c ON u.id = c.user_id
      LEFT JOIN users p ON c.poster_id = p.id
      WHERE u.id = ?;
  
      `
      const [targetProfile] = await connection.execute(getProfileQuery, [targetId]);

      if (targetProfile.length === 0) {
        return errorMsg.userNotFound(res);
      }
      const friendshipQuery = 'SELECT * FROM friendship WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)';
      const [findFriendshipResult] = await connection.execute(friendshipQuery, [targetId, my_id, my_id, targetId]);
      let friendship = null;
      if (findFriendshipResult.length > 0) {
        friendship = {
          id: findFriendshipResult[0].id,
          status: findFriendshipResult[0].status
        }
      }

      const comments = targetProfile.map(row => ({
        id: row.comment_id,
        content: row.comment_content,
        created_at: moment.utc(row.comment_created_at).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
        poster: {
          id: row.poster_id,
          name: row.poster_name,
          picture: row.poster_picture
        }
      }));

      const data = {
        user: {
          id: targetProfile[0].uid,
          name: targetProfile[0].name,
          picture: targetProfile[0].picture,
          credit: targetProfile[0].credit,
          comment: comments,
          friendship
        }
      };
      return data;
    } 
    catch (error) {
      errorMsg.query(res);
    } 
    finally {
      console.log('connection release');
    }
  },

  pictureUpdate: async (res, my_id, filename) => {
    const connection = await connectionPromise;
    try {
      const baseUrl = 'https://52.64.240.159';
      const pictureUrl = `${baseUrl}/static/${filename}`;
      console.log(`${pictureUrl}!~~`);
      await connection.execute('UPDATE users SET picture = ? WHERE id = ?', [pictureUrl, my_id]);
      console.log('update~~');
      const data = {
        data:
        {
          picture: pictureUrl
        }
      }
      return data;

    } 
    catch (error) {
      errorMsg.query(res);
    } 
    finally {
      console.log('connection release');
    }
  },
  profileUpdate: async (res, sex, userId) => {
    const connection = await connectionPromise;
    try {
      await connection.execute('UPDATE users SET sex = ? WHERE id = ?', [sex, userId]);
      const output = { id: userId };
      const data = {
        data: {
          output
        }
      }
      return data;
    } 
    catch (error) {
      errorMsg.query(res);
    } 
    finally {
      console.log('connection release');
    }
  },
  


}
