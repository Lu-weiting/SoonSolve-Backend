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
    getMessage: async (res, roomId) => {
    try{
      const connection = await connectionPromise;
      const query = `
      SELECT * 
      FROM messages m JOIN users 
      ON users.id IN (m.sender_id, m.receiver_id)
      WHERE room_id = ? 
      ORDER BY created_at DESC
      `;
      const [result] = await connection.execute(query, [roomId]);
      return result;
    }
    catch (error) {
      errorMsg.query(res);
    } 
    finally {
      console.log('connection release');
    }
  }
}