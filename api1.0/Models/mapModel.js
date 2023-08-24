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
    getRegion: async (location1, location2, res) => {
    try{
      const connection = await connectionPromise;
      const bound = await getRegion(location1, location2);
      
      const query = `SELECT x_axis, y_axis
      FROM tasks 
      WHERE ((x_axis >= ?) AND (x_axis =< ?)) AND ((y_axis >= ?) AND (y_axis =< ?)) `;
      const [results] = await connection.execute(query, [bound.xMin, bound.xMax, bound.yMin, bound.yMax]);
      

      const promises = results.map(async locationResult => {
        //const taipeiDateTime = moment.utc(results.results.created_at).tz('Asia/Taipei');
        //const formattedDateTime = taipeiDateTime.format('YYYY-MM-DD HH:mm:ss');
        const location = {
            x_axis: locationResult.x_axis,
            y_axis: locationResult.y_axis
        };
        return location;
      });
      const locationList = await Promise.all(promises);
      const response = {
        data: {
          location: locationList
        }
      };
      return response;
    }
    catch (error) {
      errorMsg.query(res);
      console.error(error);
    } 
    finally {
      console.log('connection release');
    }
  }
}