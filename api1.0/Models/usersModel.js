// 引入資料庫連線
const connectionPromise = require('../utils/database').connectionPromise;
const errorMsg = require('../utils/error');

//Set Timezone
const moment = require('moment-timezone'); 
moment.tz.setDefault("Asia/Taipei");

module.exports = {
  tasksRecord: async (my_id, type, limit) => {
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
        ORDER BY t.id DESC LIMIT ?
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
        ORDER BY t.id DESC LIMIT ?
        `;
      }
      const [results] = await connection.execute(query, [my_id, limit]);
      if (results.length == 0) {
        return error_message.taskNotExist(res);
      }else if(results.length < limit){
        nextCursor = null;
      }else{
        const lastPostId = results[results.length - 1].id;
        nextCursor = lastPostId;
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
      Promise.all(promises)
        .then(tasksResult => {
          const response = {
            data: {
              task: tasksResult,
              next_cursor: encodeCursor
            }
          };
          res.status(200).json(response);
        })
        .catch(error => {
          console.error(error);
          res.status(500).json({ error: 'Server error' });
        });
      
      return res.status(200).json(response);
    }catch (error) {
      errorMsg.query(res);
    } finally {
      console.log('connection release');
      connection.release();
    }
  },
  getProfile: async(res,targetId,my_id)=>{
    const connection = await connectionPromise;
    try {
      
    }catch (error) {
      errorMsg.query(res);
    } finally {
      console.log('connection release');
      connection.release();
    }
  }
}
