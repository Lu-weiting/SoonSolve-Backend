const usersModel = require('../Models/usersModel');
const auth = require('../utils/auth')
const tool = require('../utils/tool')
const crypto = require('crypto'); // 引入 crypto 套件，用於加密處理
const errorMsg = require('../utils/error');


module.exports = {
  signUp: async (req, res) => {
    try{
      const { name, email, password } = req.body;

      // 檢查必填欄位是否都有輸入
      if (!name || !password || !email) {
        return errorMsg.inputEmpty(res);
      }

      // 檢查 email 格式是否正確
      if (!tool.checkEmailRegex(email)) {
        return errorMsg.wrongEmail(res);
      }
      const response = await usersModel.signUp(name, email, password, res);
      return res.json(response);
    }
    catch(error){
      errorMsg.controllerProblem(res);
      console.error(error);
    }
  },
  signIn: async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // 檢查必填欄位是否都有輸入
    if (!email || !password) {
      return errorMsg.inputEmpty(res);
    }

    try{
      // 驗證密碼是否正確
      const user = await usersModel.signIn(email, res);
      if(user == undefined){
        return;
      }
      const PASSWORD = user.password;
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      if (PASSWORD !== hashedPassword) {
        return errorMsg.wrongPassword(res);
      }

      // 回傳登入成功的回應，包含 JWT 和使用者資訊
      const response = {
        'data': {
          'access_token': auth.generateJWTToken(user.id),
          "user": {
            'id': user.id,
            'name': user.name
          }
        }
      };
      res.json(response);
    }
    catch(error){
      errorMsg.controllerProblem(res);
      console.error(error);
    }
  },
  getRecords: async (req, res) => {
    try {
      const my_id = req.decodedToken.id;
      const type = req.params.type;
      const cursor = req.query.cursor;
      let limit = 10;
      if (type != 'Released' && type != 'Accepted') return errorMsg.inputEmpty(res);
      const result = await usersModel.tasksRecord(res, my_id, type, cursor ? cursor : null, limit);
      res.status(200).json(result);
    } 
    catch (error) {
      errorMsg.controllerProblem(res);
      console.error(error);
    }
  },
  getProfile: async (req, res) => {
    try {
      const my_id = req.decodedToken.id;
      const targetId = Number(req.params.id);
      if (!targetId) return errorMsg.inputEmpty(res);
      const result = await usersModel.getProfile(res, targetId, my_id);
      return res.status(200).json(result);
    } 
    catch (error) {
      errorMsg.controllerProblem(res);
      console.error(error);
    }
  },
  pictureUpdate: async (req, res) => {
    try {
      if (!req.headers['content-type']) return errorMsg.inputEmpty(res);
      if (!req.headers['content-type'].includes('multipart/form-data')) return errorMsg.contentType(res);
      const my_id = req.decodedToken.id;

      // const { redisClient } = req;
      console.log(req.file.filename);
      console.log(__dirname);
      const result = await usersModel.pictureUpdate(res, my_id, req.file.filename);
      res.status(200).json(result);
    } 
    catch (error) {
      errorMsg.controllerProblem(res);
      console.error(error);
    }
  },
  profileUpdate: async (req, res) => {
    try {
      if (req.headers['content-type'] != 'application/json') return errorMsg.contentType(res);
      const { sex } = req.body;
      const my_id = req.decodedToken.id;
      const result = await usersModel.profileUpdate(res,sex,my_id);
      return res.status(200).json(result);
    } 
    catch (error) {
      errorMsg.controllerProblem(res);
      console.error(error);
    }
  },
  createComment: async(req,res)=>{
    try {
      const my_id = req.decodedToken.id;
      const task_poster_id = Number(req.params.task_poster_id);
      const {content} = req.body;
      if(!task_poster_id||!content) return errorMsg.inputEmpty(res);
      const result = await usersModel.createComment(res,content,task_poster_id,my_id);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      errorMsg.controllerProblem(res);
    }
  }
}
