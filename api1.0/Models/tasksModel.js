const crypto = require('crypto'); // 引入 crypto 套件，用於加密處理

// 引入資料庫連線
const connectionPromise = require('../Models/mysql').connectionPromise;


module.exports = {
  tasksDetail: async (postId) => {
    const connection = await connectionPromise;
    try {
      if (!postId) return error_message.input(res);
      const Query = `SELECT t.*, u.name, u.nickname, u.picture 
      FROM tasks t
      LEFT JOIN users u ON t.poster_id = u.id
      WHERE t.poster_id = ?
      `;
      const [results] = await connection.execute(Query, [postId]);
      if (results.length == 0) return error_message.taskNotExist(res);
      const response = {
        data: {
          task: {
            id: postId,
            title: result.title,
            poster_id: result.poster_id,
            created_at: result.created_at,
            closed_at: result.closed_at,
            deadline: result.deadline,
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
      return res.status(200).json(response);
    }catch (error) {
      error_message.query(res);
    } finally {
      console.log('connection release');
      connection.release();
    }
  }
}
