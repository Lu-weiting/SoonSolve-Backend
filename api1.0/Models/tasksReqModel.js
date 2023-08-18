// const { POOL, QUERY } = require('../utils/database');
const errorMsg = require('../utils/error');
const tool = require('../utils/tool');
const connectionPromise = require('../utils/database').connectionPromise;
const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Taipei");


module.exports = {
    getTaskReqList: async (res, userId, cursor, limit) => {
        const connection = await connectionPromise;
        let decodeCuser = null;
        try {
            if (cursor == null) {
                decodeCuser = Math.pow(2, 64);
              } else {
                decodeCuser = await tool.decryptCursor(cursor);
              }
            const query = `SELECT ut.id, ut.ask_count, ut.status, u.id AS user_id , u.name, u.picture 
            FROM tasks t
            LEFT JOIN user_task ut ON t.id = ut.task_id
            LEFT JOIN users u ON ut.taker_id = u.id
            WHERE t.poster_id = ?
            ORDER BY t.id DESC LIMIT ${limit}
            `;

            const [results] = await connection.execute(query, [userId]);
            if (results.length == 0) {
                return error_message.taskReqNotExist(res);
              } else if (results.length < limit) {
                nextCursor = null;
              } else {
                const lastPostId = results[results.length - 1].id;
                nextCursor = await tool.encryptCursor(lastPostId);
                nextCursor = encodeURIComponent(nextCursor);
              }
              const promises = results.map(async taskReqResult => {
                const users = {
                  id: taskReqResult.user_id,
                  name: taskReqResult.name,
                  picture: taskReqResult.picture,
                  user_task : {
                    id: taskReqResult.id,
                    ask_count: taskReqResult.ask_count,
                    status: taskReqResult.status
                  }
                };
                return users;
              });
              try {
                const tasksReqResult = await Promise.all(promises);
                const response = {
                  data: {
                    users: tasksReqResult,
                    next_cursor: nextCursor
                  }
                };
                return response;
              } catch (error) {
                console.error(error);
                throw new Error('Server error');
              }
        } catch (error) {
            console.log(error);
            errorMsg.query(res);
        } finally {
            console.log('connection release');
            connection.release();
        }
    }
}