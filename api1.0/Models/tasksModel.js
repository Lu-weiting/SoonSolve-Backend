// const { POOL, QUERY } = require('../utils/database');
const errorMsg = require('../utils/error');
const tool = require('../utils/tool');
const connectionPromise = require('../utils/database').connectionPromise;
const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Taipei");


module.exports = {
    homeSearch: async (res, cursor, location, friend, title, sex, userId) => {
        // undo db set
        // const connection = await user.poolConnection();
        const connection = await connectionPromise;
        const limit = 11;
        const finalParam = [];
        let decodeCuser = 0;
        if (cursor == null) {
            decodeCuser = Math.pow(2, 64);
        } else {
            decodeCuser = await tool.decryptCursor(cursor);
        }
        try {
            const my_friend_query_string = `SELECT F.senderId AS friend_id
                                                FROM friendship AS F LEFT JOIN users AS U
                                                ON F.senderId = U.id
                                                WHERE status = ? AND receiverId = ?
                                                UNION
                                                SELECT F.receiverId AS friend_id
                                                FROM friendship AS F LEFT JOIN users AS U
                                                ON F.receiverId = U.id
                                                WHERE status = ? AND senderId = ?`
            let filter_query = `
                                    SELECT T.id, T.title, T.content, DATE_FORMAT(T.created_at, "%Y-%m-%d %H:%i:%s") AS task_created_at, T.deadline,DATE_FORMAT(T.closed_at, "%Y-%m-%d %H:%i:%s") AS task_closed_at, T.task_vacancy, T.approved_count, T.location, T.reward, T.status, T.poster_id,U.picture, U.name, U.id AS user_id, U.nickname, U.sex
                                    FROM tasks AS T LEFT JOIN users AS U
                                    ON T.poster_id = U.id
                                    WHERE T.status = ? AND 
                                `;
            finalParam.push('pending');
            const data = [];
            if (location == null && friend == null && title == null && sex == null) {
                const [result] = await connection.execute(
                    `
                        SELECT T.id, T.title, T.content, DATE_FORMAT(T.created_at, "%Y-%m-%d %H:%i:%s") AS task_created_at, T.deadline,DATE_FORMAT(T.closed_at, "%Y-%m-%d %H:%i:%s") AS task_closed_at, T.task_vacancy, T.approved_count, T.location, T.reward, T.status, T.poster_id,U.picture, U.name, U.id AS user_id, U.nickname, U.sex
                        FROM tasks AS T LEFT JOIN users AS U
                        ON T.poster_id = U.id 
                        WHERE T.status = ?
                        ORDER BY T.id DESC LIMIT ?
                    `, ['pending', limit]);
                let len = result.length;
                if (result.length >= limit) len = result.length - 1;

                if (result.length != 0) {
                    for (var i = 0; i < len; i++) {
                        const post = {
                            id: result[i].id,
                            poster_id: result[i].poster_id,
                            created_at: moment.utc(result[i].task_created_at).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
                            closed_at: moment.utc(result[i].task_closed_at).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
                            deadline: moment.utc(result[i].deadline).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
                            task_vacancy: result[i].task_vacancy,
                            approved_count: result[i].approved_count,
                            content: result[i].content,
                            location: result[i].location,
                            reward: result[i].reward,
                            picture: result[i].picture,
                            name: result[i].name,
                            nickname: result[i].nickname,
                            sex: result[i].sex,
                            status: result[i].status
                        }
                        data.push(post);
                    }
                }
                const cusr = String(result[result.length - 2].id);
                let next_cursor = await tool.encryptCursor(cusr);
                next_cursor = encodeURIComponent(next_cursor);
                const output = {
                    data: {
                        posts: data,
                        next_cursor: result.length < limit ? null : next_cursor
                    }
                }
                return output;
                // res.status(200).json({
                //     data: {
                //         posts: data,
                //         next_cursor: result.length < limit ? null : next_cursor
                //     }
                // });
            }
            const selected = [null, null, null, null];
            const matched = [false, false, false, false];


            if (location != null) {
                matched[0] = true;
                selected[0] = `T.location in (?)`;
                finalParam.push(location);
            }
            if (friend != null) {
                matched[1] = true;
                const [user_ids] = await connection.execute(my_friend_query_string, ['friend', userId, 'friend', userId]);
                let user_id_array = [userId];
                user_ids.forEach(e => user_id_array.push(e.friend_id));
                finalParam.push(user_id_array);
                selected[1] = `T.poster_id in (?)`;
            }
            if (title != null) {
                matched[2] = true;
                finalParam.push(title);
                selected[2] = `T.title = ?`;
            }
            if (sex != null) {
                matched[3] = true;
                finalParam.push(sex);
                selected[3] = `T.sex = ?`;
            }
            const trueIndexes = matched.map((value, index) => ({ value, index }))
                .filter(item => item.value === true)
                .map(item => item.index);
            for (var i = 0; i < trueIndexes.length; i++) {
                // if(i == trueIndexes.length-1 ) {
                //     filter_query = `${filter_query}${selected[trueIndexes[i]]}`
                // }
                filter_query = `${filter_query}${selected[trueIndexes[i]]} AND `;
            }
            filter_query += `T.id < ${decodeCuser} ORDER BY T.id DESC LIMIT ${limit}`;
            const query_string = `WITH
                                    task_with_user_data AS (
                                        ${filter_query}
                                    )
                                    SELECT *
                                    FROM task_with_user_data
                                    `
            const [result] = await connection.execute(query_string, finalParam);
            const finalData = [];
            let len = result.length;
            if (result.length >= limit) len = result.length - 1;

            if (result.length != 0) {
                for (var i = 0; i < len; i++) {
                    const post = {
                        id: result[i].id,
                        poster_id: result[i].poster_id,
                        created_at: moment.utc(result[i].task_created_at).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
                        closed_at: moment.utc(result[i].task_closed_at).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
                        deadline: moment.utc(result[i].deadline).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
                        task_vacancy: result[i].task_vacancy,
                        approved_count: result[i].approved_count,
                        content: result[i].content,
                        location: result[i].location,
                        reward: result[i].reward,
                        picture: result[i].picture,
                        name: result[i].name,
                        nickname: result[i].nickname,
                        sex: result[i].sex,
                        status: result[i].status
                    }
                    finalData.push(post);
                }
            }
            const cusr = String(result[result.length - 2].id);
            let next_cursor = await tool.encryptCursor(cusr);
            next_cursor = encodeURIComponent(next_cursor);
            const output2 = {
                data: {
                    posts: data,
                    next_cursor: result.length < limit ? null : next_cursor
                }
            };
            // res.status(200).json({data: {
            //     posts: data,
            //     next_cursor: result.length < limit ? null : next_cursor
            // }});           
            return output2;
        } catch (error) {
            console.log(error);
            errorMsg.query(res);
        } finally {
            console.log('connection release');
            // connection.release();
        }
    },
    tasksDetail: async (res, postId) => {
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
        } catch (error) {
            console.log(error);
            errorMsg.query(res);
        } finally {
            console.log('connection release');
            connection.release();
        }
    },
    updateTask: async(res,requestBody,taskId,userId)=>{
        const connection = await connectionPromise;
        try {
            const [findTask] = await connection.execute('SELECT * FROM tasks WHERE id = ?', [taskId]);
            if(findTask.length == 0) return errorMsg.taskNotExist(res);
            if (findTask[0].poster_id != userId) return errorMsg.cannotUpdateTask(res);
            await connection.execute('UPDATE tasks SET ? WHERE id = ?', [requestBody, taskId]);
            const data = {
                data: {
                    task: {
                        id: taskId
                    }
                }
            };
            return data
        } catch (error) {
            console.log(error);
            errorMsg.query(res);
        } finally {
            console.log('connection release');
            connection.release();
        }
    }
}
