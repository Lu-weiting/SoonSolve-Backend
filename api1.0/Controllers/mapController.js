const mapModel = require('../Models/mapModel');
const auth = require('../utils/auth')
const tool = require('../utils/tool')
const crypto = require('crypto'); // 引入 crypto 套件，用於加密處理
const errorMsg = require('../utils/error');


module.exports = {
    getRegion: async (req, res) => {
    try{
      const { location1, location2 } = req.query;

      // 檢查必填欄位是否都有輸入
      if (!location1 || !location2) {
        return errorMsg.inputEmpty(res);
      }

      const response = await mapModel.getRegion(location1, location2, res);
      return res.json(response);
    }
    catch(error){
      errorMsg.controllerProblem(res);
      console.error(error);
    }
  },
}