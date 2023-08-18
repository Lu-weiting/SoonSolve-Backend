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
            await connection.execute('DELETE FROM user_task WHERE id = ?',[user_taskId]);
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
    }
}