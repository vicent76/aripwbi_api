const Mysql = require('mysql');
const MysqlConnector = require('../../connectors/mysql_connector');
const Password = require("../../utilities/password");
const Jwt = require('jsonwebtoken');
const Dotenv = require('dotenv');
Dotenv.config();

const userMysql = {
    getGruposUsuarios: () => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "SELECT * FROM grupos_usuarios";
            db.query(sql)
                .then(rows => { db.close(); resolve(rows) })
                .catch(err => { db.close(); reject(err); });
        });
    },
    getGrupoUsuario: (id) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "SELECT * FROM grupos_usuarios WHERE grupo_usuario_id = ?";
            sql = Mysql.format(sql, id);
            db.query(sql)
                .then(rows => {
                    db.close();
                    if (rows.length == 0) return reject({ status: 404, message: `No se ha encontrado grupo de usuarios para el id ${id}` });
                    let user = rows[0];
                    delete user.hash;
                    resolve(user);
                })
                .catch(err => { db.close(); reject(err); });
        });
    },
    postGrupoUsuario: (obj) => {
        obj.grupo_usuario_id = 0;
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "";
            sql = Mysql.format("INSERT INTO grupos_usuarios SET ?", obj);
            db.query(sql)
                .then(result => {
                    db.close();
                    obj.grupo_usuario_id = result.insertId;
                    delete obj.hash;
                    resolve(obj);
                })
                .catch(err => {
                    db.close();
                    reject(err);
                });
        });
    },
    putGrupoUsuario: (obj) => {
        let id = obj.grupo_usuario_id;
        return new Promise((resolve, reject) => {
            if (!id) return reject({ status: 400, message: `Debe incluir el grupo_grupo_usuario_id en la petición` });
            let db = new MysqlConnector.dbMysql();
            sql = Mysql.format("UPDATE grupos_usuarios SET ? WHERE grupo_usuario_id = ?", [obj, id]);
            db.query(sql)
                .then(() => {
                    db.close();
                    delete obj.hash;
                    resolve(obj);
                })
                .catch(err => { db.close(); reject(err); });
        });
    },
    deleteGrupoUsuario: (id) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "";
            sql = Mysql.format("DELETE FROM grupos_usuarios WHERE grupo_usuario_id = ?", id);
            db.query(sql)
                .then(() => { db.close(); resolve({ res: 'OK' }); })
                .catch(err => { db.close(); reject(err); });
        });
    }
};
module.exports = userMysql;