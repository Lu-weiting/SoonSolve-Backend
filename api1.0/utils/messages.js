const moment = require('moment');

function formatMessage(id, picture, username, text) {
    console.log(id);
    // console.log(selectResult[0].picture);
    console.log(selectResult);
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