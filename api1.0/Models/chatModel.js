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
      SELECT 
        m.id,
        m.message,
        m.created_at,
        u.id AS sender_id,
        u.name AS sender_name,
        u.picture AS sender_picture,
        r.id AS receiver_id,
        r.name AS receiver_name,
        r.picture AS receiver_picture
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      LEFT JOIN users r ON m.receiver_id = r.id
      WHERE room_id = ?
      ORDER BY created_at DESC;
      `;
      const [results] = await connection.execute(query, [roomId]);
      console.log(results);
      const promises = results.map(async messagesResult => {
        const messages = {
          id: messagesResult.id,
          message: messagesResult.message,
          sender_id: {
            id: messagesResult.sender_id,
            name: messagesResult.sender_name,
            picture: messagesResult.sender_picture
          },
          receiver_id: {
            id: messagesResult.receiver_id,
            name: messagesResult.receiver_name,
            picture: messagesResult.receiver_picture
          },
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
      console.error(error);
    } 
    finally {
      console.log('connection release');
    }
  },
  deleteMessage: async (res, roomId) => {
    try{
      const connection = await connectionPromise;
      const query = `DELETE FROM rooms WHERE id = ?`;
      await connection.execute(query, [roomId]);
      const response = {
        "data": {
          "room_id": roomId
        }
      };
      return response;
    }
    catch (error) {
      errorMsg.query(res);
      console.error(error);
    } 
    finally {
      console.log('connection release');
    }
  }
}