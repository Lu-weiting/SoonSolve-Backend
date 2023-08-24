const moment = require('moment');

function formatMessage(id, picture, username, text) {
    return {
        sender_id: {
            id: id,
            picture: picture
        },
        username,
        message: text,
        time: moment().format('h:mm a')
    };
}

module.exports = formatMessage;