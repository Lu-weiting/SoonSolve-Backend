// 引入資料庫連線
const connectionPromise = require('../utils/database').connectionPromise;
const errorMsg = require('../utils/error');

//Set Timezone
const moment = require('moment-timezone'); 
moment.tz.setDefault("Asia/Taipei");

module.exports = {
  tasksDetail: async (postId) => {
    const connection = await connectionPromise;
    try {
      
      const query = `SELECT t.*, u.name, u.nickname, u.picture 
      FROM tasks t
      LEFT JOIN users u ON t.poster_id = u.id
      WHERE t.id = ?
      `;

      const result = await connection.execute(query, [postId]);
      if (result.length == 0) return errorMsg.taskNotExist(res);
      const response = {
        data: {
          task: {
            id: postId,
            title: result.title,
            poster_id: result.poster_id,
            created_at: moment.utc(taskResult.created_at).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
            closed_at: moment.utc(taskResult.closed_at).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
            deadline: moment.utc(taskResult.deadline).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
            task_vacancy: result.task_vacancy,
            approved_count: result.approved_count,
            location: result.location,
            reward: result.reward,
            content: result.content,
            name: result.name,
            nickname: result.nickname,
            picture: result.picture,
            status: result.status,
          }
        }
      };
      return response;
    }catch (error) {
      errorMsg.query(res);
    } finally {
      console.log('connection release');
      connection.release();
    }
  }
}
