const moment = require('moment');
const connectionPromise = require('./database').connectionPromise;
async function formatMessage(id, username, text) {
    const connection = await connectionPromise;
    try {
        const [selectResult] = connection.execute('SELECT * FROM users WHERE id = ?',[id]);
        console.log(id);
        console.log(selectResult[0].picture);
        console.log(selectResult);
        return {
            sender_id: {
                id: id,
                picture: selectResult[0].picture
            },
            username,
            message: text,
            time: moment().format('h:mm a')
        };
    } catch (error) {
        console.log(error);
    } finally {
        console.log('connection release');
    }
}

module.exports = formatMessage;