const usersModel = require('../Models/usersModel');
const auth = require('../utils/auth')
const tool = require('../utils/tool')
const crypto = require('crypto'); // 引入 crypto 套件，用於加密處理
const errorMsg = require('../utils/error');


module.exports = {
  getEvent: async (req, res) => {
    try{
      const connection = await connectionPromise;
      const my_id = req.decoded.id;

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
      const [notification] = await connection.execute(eventQuery, [my_id]);

      const notification_result = notification.map((notification) => {
        let summary = '';
        if (notification.type === 'friend request') {
          summary = 'invited you to be friends.';
        } else {
          summary = 'has accepted your friend request.';
        }
        return {
          id: notification.events_id,
          type: notification.type,
          is_read: Boolean(notification.is_read),
          image: notification.picture,
          created_at: notification.formatted_created_at,
          summary: `${notification.name} ${summary}`,
        };
      });
      const response = {
        "data": {
          "events": notification_result
        }
      };
      return res.json(response);
    }
    catch(error){
      errorMsg.controllerProblem(res);
      console.error(error);
    }
  },
}
