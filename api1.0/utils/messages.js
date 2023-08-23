const moment = require('moment');

function formatMessage(username, text) {
  return {
    username,
    message: text,
    time: moment().format('h:mm a')
  };
}

module.exports = formatMessage;