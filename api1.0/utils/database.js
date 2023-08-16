const mysql = require('mysql2/promise'); 

//import dotenv from 'dotenv'
const dotenv = require('dotenv');
dotenv.config()

const connectionPromise =  mysql.createPool({
    host: process.env.HOST,
    user: process.env.DB_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

module.exports = {
    connectionPromise
};
