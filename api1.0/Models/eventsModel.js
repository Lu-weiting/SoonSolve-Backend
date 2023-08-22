// 引入資料庫連線
const connectionPromise = require('../utils/database').connectionPromise;
const crypto = require('crypto'); // 引入 crypto 套件，用於加密處理
const auth = require('../utils/auth')
const tool = require('../utils/tool');
const errorMsg = require('../utils/error');

//Set Timezone
const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Taipei");

module.exports = {
  signUp: async (name, email, password, res) => {
    try{
      const connection = await connectionPromise;
      
      return response;
    }
    catch (error) {
      errorMsg.query(res);
    } 
    finally {
      console.log('connection release');
    }
  },
}
