const mysql = require('mysql')
const dotenv = require('dotenv')
dotenv.config()

const db = mysql.createConnection({
    host: process.env.DATA_BASE_HOST,
    user: process.env.DATA_BASE_USER,
    password: process.env.DATA_BASE_PASSWORD,
    database: process.env.DATA_BASE
})

module.exports.db = db
