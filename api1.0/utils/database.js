const mysql = require('mysql2/promise'); 

//import dotenv from 'dotenv'
const dotenv = require('dotenv');
dotenv.config()

const connectionPromise =  mysql.createPool({
    host: process.env.HOST,
    user: 'user',
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

console.log(process.env.HOST);
console.log(process.env.PASSWORD);
console.log(process.env.USER);

module.exports = {
    connectionPromise
};
