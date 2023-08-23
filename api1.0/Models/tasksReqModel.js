const errorMsg = require('../utils/error');
const tool = require('../utils/tool');
const connectionPromise = require('../utils/database').connectionPromise;
const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Taipei");
module.exports = {
    sendRequest: async (res, ask_count, taskId, userId) => {
        const connection = await connectionPromise;
        try {
            const [insertResult]=await connection.execute("INSERT INTO user_task (status,task_id,taker_id,ask_count) VALUES (?,?,?,?)",['pending',taskId,userId,ask_count]);
            const data = {
                data:
                {
                    user_task:{
                        id: insertResult.insertId
                    }
                }
            };
            const taskQuery = `SELECT poster_id from tasks WHERE id = ?`;
            const [task] = await connection.execute(taskQuery, [taskId]);
            const type = 'task_request'
            const eventQuery = 'INSERT INTO events(sender_id, receiver_id, type, is_read) VALUES(?,?,?,?)';
            await connection.execute(eventQuery, [userId, task[0].poster_id, type, false]);
            return data;
        } catch (error) {
            console.log(error);
            errorMsg.query(res);
        } finally {
            console.log('connection release');
        }
    },
    deleteRequest: async(res,user_taskId)=>{
        const connection = await connectionPromise;
        try {
            const deleted = await connection.execute('DELETE FROM user_task WHERE id = ?',[user_taskId]);
            if(deleted.affectedRows === 0) return errorMsg.taskNotExist(res);
            const data = {
                data:
                {
                    user_task:{
                        id: user_taskId
                    }
                }
            };
            return data;
        } catch (error) {
            console.log(error);
            errorMsg.query(res);
        } finally {
            console.log('connection release');
        }
    },
    getTaskReqList: async (res, userId, cursor, limit) => {
        const connection = await connectionPromise;
        let decodeCuser = null;
        try {
            if (cursor == null) {
                decodeCuser = Math.pow(2, 64);
              } else {
                decodeCuser = await tool.decryptCursor(cursor);
              }
            const query = 
            `
            SELECT ut.id, ut.ask_count, ut.status, u.id AS user_id , u.name, u.picture 
            FROM user_task ut 
            LEFT JOIN tasks t ON t.id = ut.task_id
            LEFT JOIN users u ON ut.taker_id = u.id
            WHERE t.poster_id = ?
            ORDER BY t.id DESC LIMIT ${limit}
            `;

            const [results] = await connection.execute(query, [userId]);
            if (results.length == 0) {
                return errorMsg.taskReqNotExist(res);
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
            const tasksReqResult = await Promise.all(promises);
            const response = {
                data: {
                users: tasksReqResult,
                next_cursor: nextCursor
                }
            };
            return response;
        } catch (error) {
            errorMsg.query(res);
            console.error(error);
        } finally {
            console.log('connection release');
        }
    },
    updateTaskReq: async (res, status, user_taskId) => {
        const connection = await connectionPromise;
        try {
          await connection.execute('UPDATE user_task SET status = ? WHERE id = ?', [status, user_taskId]);
          const output = { user_task: user_taskId };
          const data = {
            data: {
              output
            }
          }
          if(status === 'Accepted'){
            const taskQuery = 
            `
            SELECT tasks.poster_id, user_task.taker_id, user_task.ask_count, tasks.id AS taskId
            FROM user_task
            INNER JOIN tasks ON user_task.task_id = tasks.id
            WHERE user_task.id = ?;
            `;
            const [task] = await connection.execute(taskQuery, [user_taskId]);
            const type = 'task_reqAccept'
            const eventQuery = 'INSERT INTO events(sender_id, receiver_id, type, is_read) VALUES(?,?,?,?)';
            await connection.execute(eventQuery, [task[0].taker_id, task[0].poster_id, type, false]);
            await connection.execute(`UPDAT tasks SET approved_count = approved_count + ${task[0].ask_count} WHERE id = ?`, [task[0].taskId]);
          }
          return data;
        } catch (error) {
          errorMsg.query(res);
        } finally {
          console.log('connection release');
        }
    }
}