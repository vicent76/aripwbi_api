const Mysql = require('mysql');
const MysqlConnector = require('../../connectors/mysql_connector');
const Password = require("../../utilities/password");
const Jwt = require('jsonwebtoken');
const Dotenv = require('dotenv');
Dotenv.config();

const periodoMysql = {
    getPeriodos: () => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "SELECT * FROM periodos";
            db.query(sql)
                .then(rows => { db.close(); resolve(rows) })
                .catch(err => { db.close(); reject(err); });
        });
    },
    getPeriodo: (id) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "SELECT * FROM periodos WHERE periodo_id = ?";
            sql = Mysql.format(sql, id);
            db.query(sql)
                .then(rows => {
                    db.close();
                    if (rows.length == 0) return reject({ status: 404, message: `No se ha encontrado periodo para el id ${id}` });
                    let periodo = rows[0];
                    resolve(periodo);
                })
                .catch(err => { db.close(); reject(err); });
        });
    },
    postPeriodo: (obj) => {
        obj.periodo_id = 0;
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "";
            sql = Mysql.format("INSERT INTO periodos SET ?", obj);
            db.query(sql)
                .then(result => {
                    db.close();
                    obj.periodo_id = result.insertId;
                    delete obj.hash;
                    resolve(obj);
                })
                .catch(err => {
                    db.close();
                    reject(err);
                });
        });
    },
    putPeriodo: (obj) => {
        let id = obj.periodo_id;
        return new Promise((resolve, reject) => {
            if (!id) return reject({ status: 400, message: `Debe incluir el periodo_id en la petición` });
            let db = new MysqlConnector.dbMysql();
            sql = Mysql.format("UPDATE periodos SET ? WHERE periodo_id = ?", [obj, id]);
            db.query(sql)
                .then(() => {
                    db.close();
                    delete obj.hash;
                    resolve(obj);
                })
                .catch(err => { db.close(); reject(err); });
        });
    },
    deletePeriodo: (id) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "";
            sql = Mysql.format("DELETE FROM periodos WHERE periodo_id = ?", id);
            db.query(sql)
                .then(() => { db.close(); resolve({ res: 'OK' }); })
                .catch(err => { db.close(); reject(err); });
        });
    }
};
module.exports = periodoMysql;