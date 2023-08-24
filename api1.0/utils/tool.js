const CryptoJS = require('crypto-js');
const multer = require('multer'); // 引入 multer 套件，用於處理上傳檔案
const path = require('path');
//import dotenv from 'dotenv'
const dotenv = require('dotenv');
dotenv.config()

module.exports = {

    encryptCursor: async (cursor) => {
        const encrypted = CryptoJS.AES.encrypt(cursor.toString(), process.env.SECRET).toString();
        return encrypted;
    },
    decryptCursor: async (encryptedCursor) => {
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedCursor, process.env.SECRET);
      const decryptedCursor = decryptedBytes.toString(CryptoJS.enc.Utf8);
      return parseInt(decryptedCursor, 10);
    },
    getTaiwanDateTime: ()=>{
        const now = new Date();
        const taiwanOffset = 8 * 60; // 台灣是 UTC+8 時區
        const taiwanTime = new Date(now.getTime() + taiwanOffset * 60 * 1000);
        return taiwanTime.toISOString().slice(0, 19).replace('T', ' '); // 格式化為 'YYYY-MM-DD HH:mm:ss'
      },
    checkEmailRegex: (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return false;
      }
      return true;
    },
    uploadPicture: () => {
      const storage = multer.diskStorage({
        // /home/ubuntu/my-member-system/students/wei-ting/Canchu/static/
        destination: '/soonsolve/static',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}${path.extname(file.originalname)}`);
        }
      });
      const upload = multer({ storage: storage });
      return upload;
    }
}