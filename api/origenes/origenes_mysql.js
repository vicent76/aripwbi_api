const Mysql = require('mysql');
const MysqlConnector = require('../../connectors/mysql_connector');
const Password = require("../../utilities/password");
const Jwt = require('jsonwebtoken');
const Dotenv = require('dotenv');
Dotenv.config();

const origenMysql = {
    getOrigenes: () => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "SELECT * FROM origenes";
            db.query(sql)
                .then(rows => { db.close(); resolve(rows) })
                .catch(err => { db.close(); reject(err); });
        });
    },
    getOrigen: (id) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "SELECT * FROM origenes WHERE origen_id = ?";
            sql = Mysql.format(sql, id);
            db.query(sql)
                .then(rows => {
                    db.close();
                    if (rows.length == 0) return reject({ status: 404, message: `No se ha encontrado origen para el id ${id}` });
                    let origen = rows[0];
                    resolve(origen);
                })
                .catch(err => { db.close(); reject(err); });
        });
    },
    postOrigen: (obj) => {
        obj.origen_id = 0;
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "";
            sql = Mysql.format("INSERT INTO origenes SET ?", obj);
            db.query(sql)
                .then(result => {
                    db.close();
                    obj.origen_id = result.insertId;
                    delete obj.hash;
                    resolve(obj);
                })
                .catch(err => {
                    db.close();
                    reject(err);
                });
        });
    },
    putOrigen: (obj) => {
        let id = obj.origen_id;
        return new Promise((resolve, reject) => {
            if (!id) return reject({ status: 400, message: `Debe incluir el origen_id en la petición` });
            let db = new MysqlConnector.dbMysql();
            sql = Mysql.format("UPDATE origenes SET ? WHERE origen_id = ?", [obj, id]);
            db.query(sql)
                .then(() => {
                    db.close();
                    delete obj.hash;
                    resolve(obj);
                })
                .catch(err => { db.close(); reject(err); });
        });
    },
    deleteOrigen: (id) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "";
            sql = Mysql.format("DELETE FROM origenes WHERE origen_id = ?", id);
            db.query(sql)
                .then(() => { db.close(); resolve({ res: 'OK' }); })
                .catch(err => { db.close(); reject(err); });
        });
    }
};
module.exports = origenMysql;