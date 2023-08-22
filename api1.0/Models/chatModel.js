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
      FROM messages
      WHERE room_id = ?
      ORDER BY created_at DESC;
      `;
      const [results] = await connection.execute(query, [roomId]);
      const promises = results.map(async messagesResult => {
        const messages = {
          id: messagesResult.id,
          message: messagesResult.message,
          sender_id: messagesResult.sender_id,
          receiver_id: messagesResult.receiver_id,
          created_at: moment.utc(messagesResult.created_at).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
        };
        return messages;
      });
      const msgResult = await Promise.all(promises);
      const response = {
        data: {
            messages: msgResult,
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
  }
}