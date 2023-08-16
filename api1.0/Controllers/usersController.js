// 引入資料庫連線
const usersModel = require('../Models/usersModel');
const auth = require('../utils/auth')
const tool = require('../utils/tool')
const errorMsg = require('../utils/error');

module.exports = {
  signUp: async(req, res) => {
    const { name, email, password } = req.body;

    // 檢查必填欄位是否都有輸入
    if (!name || !password || !email) {
      return errorMsg.inputEmpty(res);
    }
  
    // 檢查 email 格式是否正確
    if (!tool.checkEmailRegex(email)) {
      return errorMsg.wrongEmail(res);
    }
    const response = await usersModel.signUp(name, email, password);
    return res.json(response);
  },
  signIn: async(req, res) => {

      const email = req.body.email;
      const password = req.body.password;

      // 檢查必填欄位是否都有輸入
      if (!email || !password) {
        return errorMsg.inputEmpty(res);
      }

      const user = await usersModel.signIn(email);

      // 驗證密碼是否正確
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
            ...user
          }
        }
      };
      res.json(response);
  },
  getRecords: async (req, res) => {
    try {
      const my_id = req.decoded.id;
      const type = req.params.type;
      if (type != 'Released' || type != 'Accepted') return error_message.input(res);
      await usersModel.tasksRecord(my_id, type);
    } catch (error) {
      console.error(error);
      errorMsg.dbConnection(res);
    }
  }
}