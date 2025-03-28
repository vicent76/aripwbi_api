const Mysql = require('mysql');
const Dotenv = require('dotenv');

Dotenv.config();

module.exports.dbMysql = class Database {
    constructor(config) {
        this.config = config;
        if (!this.config) {
            this.config = {
                host: process.env.ARIPWBI_MYSQL_HOST,
                user: process.env.ARIPWBI_MYSQL_USER,
                password: process.env.ARIPWBI_MYSQL_PASSWORD,
                database: process.env.ARIPWBI_MYSQL_DATABASE,
                port: process.env.ARIPWBI_MYSQL_PORT
            };
            if (process.env.NODE_ENV == "TEST") {
                this.config = {
                    host: process.env.ARIPWBI_MYSQL_HOST_TEST,
                    user: process.env.ARIPWBI_MYSQL_USER_TEST,
                    password: process.env.ARIPWBI_MYSQL_PASSWORD_TEST,
                    database: process.env.ARIPWBI_MYSQL_DATABASE_TEST,
                    port: process.env.ARIPWBI_MYSQL_PORT_TEST
                };
            }
        }
        this.connection = Mysql.createConnection(this.config);
    }
    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                //if (err) return reject(err);
                resolve();
            });
        });
    }
};
