const Mysql = require('mysql');
const MysqlConnector = require('../../connectors/mysql_connector');
const Password = require("../../utilities/password");
const Jwt = require('jsonwebtoken');
const Dotenv = require('dotenv');
Dotenv.config();

const categoriaMysql = {
    getCategorias: () => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "SELECT * FROM categorias";
            db.query(sql)
                .then(rows => { db.close(); resolve(rows) })
                .catch(err => { db.close(); reject(err); });
        });
    },
    getCategoria: (id) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "SELECT * FROM categorias WHERE categoria_id = ?";
            sql = Mysql.format(sql, id);
            db.query(sql)
                .then(rows => {
                    db.close();
                    if (rows.length == 0) return reject({ status: 404, message: `No se ha encontrado categoria para el id ${id}` });
                    let categoria = rows[0];
                    resolve(categoria);
                })
                .catch(err => { db.close(); reject(err); });
        });
    },
    postCategoria: (obj) => {
        obj.categoria_id = 0;
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "";
            sql = Mysql.format("INSERT INTO categorias SET ?", obj);
            db.query(sql)
                .then(result => {
                    db.close();
                    obj.categoria_id = result.insertId;
                    delete obj.hash;
                    resolve(obj);
                })
                .catch(err => {
                    db.close();
                    reject(err);
                });
        });
    },
    putCategoria: (obj) => {
        let id = obj.categoria_id;
        return new Promise((resolve, reject) => {
            if (!id) return reject({ status: 400, message: `Debe incluir el categoria_id en la petición` });
            let db = new MysqlConnector.dbMysql();
            sql = Mysql.format("UPDATE categorias SET ? WHERE categoria_id = ?", [obj, id]);
            db.query(sql)
                .then(() => {
                    db.close();
                    delete obj.hash;
                    resolve(obj);
                })
                .catch(err => { db.close(); reject(err); });
        });
    },
    deleteCategoria: (id) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "";
            sql = Mysql.format("DELETE FROM categorias WHERE categoria_id = ?", id);
            db.query(sql)
                .then(() => { db.close(); resolve({ res: 'OK' }); })
                .catch(err => { db.close(); reject(err); });
        });
    }
};
module.exports = categoriaMysql;