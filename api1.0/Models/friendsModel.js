const errorMsg = require('../utils/error');
const tool = require('../utils/tool');
const connectionPromise = require('../utils/database').connectionPromise;
const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Taipei");


module.exports = {
    getFriends: async (res, status, userId) => {
        const connection = await connectionPromise;
        try {
            const query = `SELECT u.id, u.name, u.picture, f.id AS friendship_id, f.status
            FROM users u
            LEFT JOIN friendship f ON u.id IN (f.sender_id, f.receiver_id)
            WHERE (f.status = ? AND (f.sender_id = ? OR f.receiver_id = ?))
            AND u.id <> ?`;
            const [results] = await connection.execute(query, [status, userId, userId, userId]) ;
            const friends = [];
            results.forEach((result) => {
                const friend = {
                  id: result.id,
                  name: result.name,
                  picture: result.picture,
                  friendship: {
                    id: result.friendship_id,
                    status: result.status
                  }
                };
    
                friends.push(friend);
              });
            const response = {
                data: {
                    users: friends
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
    getPending: async (res, status, userId) => {
        const connection = await connectionPromise;
        try {
            const query = `SELECT u.id, u.name, u.picture, f.id AS friendship_id, f.status
            FROM users u
            LEFT JOIN friendship f ON u.id IN f.sender_id
            WHERE (f.status = ? AND f.receiver_id = ?)
            AND u.id <> ?`;
    
            const [results] = await connection.execute(query, [status, userId, userId, userId]) ;
            const friends = [];
            results.forEach((result) => {
                const Id = parseInt(result.sender_id, 10);
                const friend = {
                  id: result.id,
                  name: result.name,
                  picture: result.picture,
                  friendship: {
                    id: result.friendship_id,
                    status: result.status
                  }
                };
    
                friends.push(friend);
              });
            const response = {
                data: {
                    users: friends
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
    friendRequest: async (res, status, senderId, receiverId) => {
        const connection = await connectionPromise;
        try {
            const query = `INSERT INTO friendship (sender_id, receiver_id, status) VALUES (?, ?, ?)`;
            const [result] = await connection.execute(query, [senderId, receiverId, status]) ;
            const response = {
                data: {
                    friendship: {
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
    agreeFriendRequest: async (res, friendshipId) => {
        const connection = await connectionPromise;
        try {
            const query = `UPDATE friendship SET status = "friend" \
            WHERE id = ?`;
            const [result] = await connection.execute(query, [friendshipId]) ;
            const response = {
                data: {
                    friendship: {
                        id: friendshipId
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
}