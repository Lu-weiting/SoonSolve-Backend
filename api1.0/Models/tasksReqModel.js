const errorMsg = require('../utils/error');
const tool = require('../utils/tool');
const connectionPromise = require('../utils/database').connectionPromise;
const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Taipei");
module.exports = {
    sendRequest: async (res, ask_count, taskId, userId) => {
        const connection = await connectionPromise;
        try {
            const [insertResult]=await connection.execute("INSERT INTO user_task (status,task_id,taker_id,ask_count) VALUES (? ,?,?,?)",['pending',taskId,userId,ask_count]);
            const data = {
                data:
                {
                    user_task:{
                        id: insertResult.insertId
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
    deleteRequest: async(res,user_taskId)=>{
        const connection = await connectionPromise;
        try {
            const deleted = await connection.execute('DELETE FROM user_task WHERE id = ?',[user_taskId]);
            if(deleted.changeRows === 0) return errorMsg.taskNotExist;
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
            errorMsg.query(res);
        } finally {
            console.log('connection release');
            connection.release();
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
          return data;
        } catch (error) {
          errorMsg.query(res);
        } finally {
          console.log('connection release');
        }
    }
}