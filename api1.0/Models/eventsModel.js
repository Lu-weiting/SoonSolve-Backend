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
  getEvent: async (id, res) => {
    try{
      const connection = await connectionPromise;
      const eventQuery = 
      `
      SELECT 
        events.id AS events_id, 
        type, is_read, 
        DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', '+08:00'), "%Y-%m-%d %H:%i:%s") AS formatted_created_at, 
        name, picture 
      FROM users JOIN events 
      ON users.id = events.sender_id 
      WHERE receiver_id = ? 
      ORDER BY created_at DESC
      `;
      const [notification] = await connection.execute(eventQuery, [id]);
      return notification;
    }
    catch (error) {
      errorMsg.query(res);
      console.error(error);
    } 
    finally {
      console.log('connection release');
    }
  },
  readEvent: async (event_id, res) => {
    try{
      const connection = await connectionPromise;
      const readQuery = 'UPDATE events SET is_read = TRUE WHERE id = ?';
      const [event] = await connection.execute(readQuery, [event_id]);
      return event;
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
