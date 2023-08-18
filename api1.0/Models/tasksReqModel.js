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
    }
}