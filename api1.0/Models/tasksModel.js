// const { POOL, QUERY } = require('../utils/database');
const errorMsg = require('../utils/error');
const tool = require('../utils/tool');
const connectionPromise = require('../utils/database').connectionPromise;
const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Taipei");


module.exports = {
    createTask: async (res, userId, context) => {
        const connection = await connectionPromise;
        try {
            const query = 'INSERT INTO tasks (title, content, deadline, task_vacancy, location, reward, status, poster_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            const {title, content, deadline, task_vacancy, location, reward} = context;
            const [result] = await connection.execute(query, [title, content, deadline, task_vacancy, location, reward, "pending", userId]) ;
            const response = {
                data: {
                    task: {
                        id: result.insertId
                    }
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
    deletetask: async (res, taskId, userId) => {
        const connection = await connectionPromise;
        try {
            const query = 'DELETE FROM tasks WHERE id = ? AND poster_id = ?';
            const result = await connection.execute(query, [taskId, userId]);
            console.log(result);
            if (result.affectedRows > 0){
                const response = {
                    data: {
                        task: {
                            id: taskId
                        }
                    }
                };
                return response;
            }
        } catch (error) {
            errorMsg.query(res);
            console.error(error);
        } finally {
            console.log('connection release');
        }
    },
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
            const my_friend_query_string = `SELECT F.sender_id AS friend_id
                                                FROM friendship AS F LEFT JOIN users AS U
                                                ON F.sender_id = U.id
                                                WHERE status = ? AND receiver_id = ?
                                                UNION
                                                SELECT F.receiver_id AS friend_id
                                                FROM friendship AS F LEFT JOIN users AS U
                                                ON F.receiver_id = U.id
                                                WHERE status = ? AND sender_id = ?`
            let filter_query = `
                                    SELECT 
                                        T.id, 
                                        T.title, 
                                        T.content, 
                                        DATE_FORMAT(T.created_at, "%Y-%m-%d %H:%i:%s") AS task_created_at, 
                                        T.deadline,DATE_FORMAT(T.closed_at, "%Y-%m-%d %H:%i:%s") AS task_closed_at, 
                                        T.task_vacancy, T.approved_count, 
                                        T.location, T.reward, 
                                        T.status, T.poster_id,U.picture, 
                                        U.name, U.id AS user_id, U.nickname, U.sex
                                    FROM tasks AS T LEFT JOIN users AS U
                                    ON T.poster_id = U.id
                                    WHERE T.status = ? AND 
                                `;
            finalParam.push('pending');
            const data = [];
            if (location == null && friend == null && title == null && sex == null) {
                const [result] = await connection.execute(
                    `
                    SELECT 
                        T.id AS id, 
                        T.title, 
                        T.content, 
                        DATE_FORMAT(T.created_at, "%Y-%m-%d %H:%i:%s") AS task_created_at, 
                        T.deadline,DATE_FORMAT(T.closed_at, "%Y-%m-%d %H:%i:%s") AS task_closed_at, 
                        T.task_vacancy, T.approved_count, 
                        T.location, T.reward, 
                        T.status, T.poster_id, U.picture, 
                        U.name, U.id AS user_id, 
                        U.nickname, U.sex
                    FROM tasks AS T LEFT JOIN users AS U
                    ON T.poster_id = U.id 
                    WHERE T.status = ? AND T.id < ${decodeCuser}
                    ORDER BY T.id DESC LIMIT ${limit}
                    `, 
                    ['pending']);
                let len = result.length;
                if (result.length >= limit) len = result.length - 1;

                if (result.length != 0) {
                    for (let i = 0; i < len; i++) {
                        const post = {
                            id: result[i].id,
                            poster_id: result[i].poster_id,
                            created_at: moment.utc(result[i].task_created_at).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
                            closed_at: moment.utc(result[i].task_closed_at).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
                            deadline: moment.utc(result[i].deadline).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
                            task_vacancy: result[i].task_vacancy,
                            approved_count: result[i].approved_count,
                            title: result[i].title,
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
                        tasks: data,
                        next_cursor: result.length < limit ? null : next_cursor
                    }
                }
                return output;
            }
            const selected = [null, null, null, null];
            const matched = [false, false, false, false];


            if (location != null) {
                matched[0] = true;
                // const multipleLocation= location.split(',');
                // console.log(multipleLocation);
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
                finalParam.push(`%${title}%`);
                selected[2] = `T.title LIKE ?`;
            }
            if (sex != null) {
                matched[3] = true;
                finalParam.push(sex);
                selected[3] = `U.sex = ?`;
            }
            const trueIndexes = matched.map((value, index) => ({ value, index }))
                .filter(item => item.value === true)
                .map(item => item.index);
            for (let i = 0; i < trueIndexes.length; i++) {

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
            console.log(result);
            console.log(finalParam);
            const finalData = [];
            let len = result.length;
            if (result.length >= limit) len = result.length - 1;

            if (result.length != 0) {
                for (let i = 0; i < len; i++) {
                    const post = {
                        id: result[i].id,
                        poster_id: result[i].poster_id,
                        created_at: moment.utc(result[i].task_created_at).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
                        closed_at: moment.utc(result[i].task_closed_at).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
                        deadline: moment.utc(result[i].deadline).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
                        task_vacancy: result[i].task_vacancy,
                        approved_count: result[i].approved_count,
                        title: result[i].title,
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
            const cusr= result.length < limit ? null : String(result[result.length - 2].id);
            // const cusr = String(result[result.length - 2].id);
            let next_cursor = null;
            if(cusr != null){
                next_cursor = await tool.encryptCursor(cusr);
                next_cursor = encodeURIComponent(next_cursor);
            }
            const output2 = {
                data: {
                    tasks: finalData,
                    next_cursor: next_cursor
                }
            };
            return output2;
        } catch (error) {
            errorMsg.query(res);
            console.error(error);
        } finally {
            console.log('connection release');
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
            const query_user_task = `SELECT id, status 
                                    FROM user_task
                                    WHERE task_id = ?
                                    `;
            const [result] = await connection.execute(query, [postId]);
            if (result.length == 0) return errorMsg.taskNotExist(res);
            const [result_user_task] = await connection.execute(query_user_task, [postId]);
            const promises = result_user_task.map(async taskReqResult => {
                const user_task = {
                    id: taskReqResult.id,
                    status: taskReqResult.status
                };
                return user_task;
              });
            const taskReqResults = await Promise.all(promises);
            const response = {
                data: {
                    task: {
                        id: postId,
                        title: result[0].title,
                        poster_id: result[0].poster_id,
                        created_at: moment.utc(result[0].created_at).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
                        closed_at: moment.utc(result[0].closed_at).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
                        deadline: moment.utc(result[0].deadline).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
                        task_vacancy: result[0].task_vacancy,
                        approved_count: result[0].approved_count,
                        location: result[0].location,
                        reward: result[0].reward,
                        content: result[0].content,
                        name: result[0].name,
                        nickname: result[0].nickname,
                        picture: result[0].picture,
                        status: result[0].status,
                        user_task: taskReqResults
                    }
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
    updateTask: async(res,requestBody,taskId,userId)=>{
        const connection = await connectionPromise;
        try {
            const [findTask] = await connection.execute('SELECT * FROM tasks WHERE id = ?', [taskId]);
            if(findTask.length == 0) return errorMsg.taskNotExist(res);
            if (findTask[0].poster_id != userId) return errorMsg.cannotUpdateTask(res);
            const updateQuery = 
            `
            UPDATE tasks 
            SET
                title = ?,
                content = ?,
                deadline = ?,
                task_vacancy = ?,
                approved_count = ?,
                location = ?,
                reward = ?
            WHERE id = ?
            `;
            const {title, content, deadline, task_vacancy, approved_count, location, reward} = requestBody
            await connection.execute(updateQuery, [title, content, deadline, task_vacancy, approved_count, location, reward, taskId]);
            const data = {
                data: {
                    task: {
                        id: taskId
                    }
                }
            };
            return data
        } catch (error) {
            errorMsg.query(res);
            console.error(error);
        } finally {
            console.log('connection release');
        }
    },
    updateTaskstatus: async(res,status,taskId)=>{
        const connection = await connectionPromise;
        try {
            const updateQuery = 'UPDATE tasks SET status = ? WHERE id = ?';
            const [task] = await connection.execute(updateQuery, [status, taskId]);
            console.log(task);
            if(task.changedRows === 0) return errorMsg.taskNotExist(res);
            const data = {
                data: {
                    task: {
                        id: taskId
                    }
                }
            };
            return data
        } catch (error) {
            errorMsg.query(res);
            console.error(error);
        } finally {
            console.log('connection release');
        }
    }
}
