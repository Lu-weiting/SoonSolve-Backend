const moment = require('moment');

function formatMessage(id, username, text) {
  return {
    sender_id: {
        id: id
    },
    username,
    message: text,
    time: moment().format('h:mm a')
  };
}

module.exports = formatMessage;