require('dotenv').config();
const mysql = require('mysql');

const dbConfig = {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT,
    connectTimeout: 60000, // Increased timeout
    acquireTimeout: 60000,
    timeout: 60000,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
};

const pool = mysql.createPool({
    ...dbConfig,
    connectionLimit: 10
});

// Keep-alive ping
setInterval(() => {
    pool.query('SELECT 1', (err) => {
        if (err) console.log('Ping failed, reconnecting...');
    });
}, 30000);

const sqlDBConnect = {
    query: (sql, values, callback) => {
        return pool.query(sql, values, (error, results) => {
            if (error && error.code === 'PROTOCOL_CONNECTION_LOST') {
                setTimeout(() => {
                    sqlDBConnect.query(sql, values, callback);
                }, 2000);
            } else if (typeof callback === 'function') { // Ensure callback is a function
                callback(error, results);
            }
        });
    },
    getConnection: (callback) => {
        pool.getConnection((err, connection) => {
            if (err) {
                setTimeout(() => {
                    sqlDBConnect.getConnection(callback);
                }, 2000);
            } else {
                if (typeof callback === 'function') {
                    callback(null, connection);
                }
            }
        });
    }
};

//Alternative wayy to handle connection errors
// const sqlDBConnect = {
//     query: (sql, values) => {
//         return new Promise((resolve, reject) => {
//             pool.query(sql, values, (error, results) => {
//                 if (error && error.code === 'PROTOCOL_CONNECTION_LOST') {
//                     setTimeout(() => {
//                         sqlDBConnect.query(sql, values).then(resolve).catch(reject);
//                     }, 2000);
//                 } else if (error) {
//                     reject(error);
//                 } else {
//                     resolve(results);
//                 }
//             });
//         });
//     },
//     getConnection: () => {
//         return new Promise((resolve, reject) => {
//             pool.getConnection((err, connection) => {
//                 if (err) {
//                     setTimeout(() => {
//                         sqlDBConnect.getConnection().then(resolve).catch(reject);
//                     }, 2000);
//                 } else {
//                     resolve(connection);
//                 }
//             });
//         });
//     }
// };

// Initial connection check
pool.getConnection((err, connection) => {
    if (connection) {
        console.log('Connected to MySQL');
        connection.release();
    }
});

module.exports = sqlDBConnect;