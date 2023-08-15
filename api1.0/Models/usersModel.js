// 引入資料庫連線
const connectionPromise = require('../utils/database').connectionPromise;
const errorMsg = require('../utils/error');
module.exports = {
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
