const Mysql = require('mysql');
const MysqlConnector = require('../../connectors/mysql_connector');
const Jwt = require('jsonwebtoken');
const Dotenv = require('dotenv');
const Path = require('path');
const Fs = require('fs');
Dotenv.config();

const userMysql = {
    getConfig: () => {
        // El caso de los usuarios es especial porque vienen
        // de una base de datos externa ARIPWBI_MYSQL_USUARIOS
        // que no es la de por defecto ARIPWBI_MYSQL_DATABASE
        return {
            host: process.env.ARIPWBI_MYSQL_HOST,
            user: process.env.ARIPWBI_MYSQL_USER,
            password: process.env.ARIPWBI_MYSQL_PASSWORD,
            database: process.env.ARIPWBI_MYSQL_USUARIOS,
            port: process.env.ARIPWBI_MYSQL_PORT
        };
    },
    getUsuarios: () => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql(userMysql.getConfig());
            let sql = "SELECT * FROM usuarios";
            db.query(sql)
                .then(rows => { db.close(); resolve(rows) })
                .catch(err => { db.close(); reject(err); });
        });
    },
    getUsuario: (codusu) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql(userMysql.getConfig());
            let sql = "SELECT * FROM usuarios WHERE codusu = ?";
            sql = Mysql.format(sql, codusu);
            db.query(sql)
                .then(rows => {
                    db.close();
                    if (rows.length == 0) return reject({ status: 404, message: `No se ha encontrado usuario para el codusu ${codusu}` });
                    let user = rows[0];
                    delete user.hash;
                    resolve(user);
                })
                .catch(err => { db.close(); reject(err); });
        });
    },
    loginUsuario: (obj) => {
        return new Promise((resolve, reject) => {
            let user = null;
            let token = null;
            let grupoUsuario = null;
            let db = new MysqlConnector.dbMysql(userMysql.getConfig());
            let sql = "SELECT * FROM usuarios WHERE login = ?";
            sql = Mysql.format(sql, obj.login);
            db.query(sql)
                .then(rows => {
                    if (rows.length == 0) {
                        db.close();
                        return reject({ status: 401, message: `Falló la autentificación` });
                    }
                    user = rows[0];
                    var result = (user.passwordpropio == obj.password);
                    if (!result) return reject({ status: 401, message: `Falló la autentificación` });
                    token = Jwt.sign({
                        nomusu: user.nomusu,
                        codusu: user.codusu
                    },
                        process.env.ARIPWBI_JWT_KEY,
                        {
                            expiresIn: "5h"
                        });
                    // Ahora hay que incluir los datos de grupo
                    db.close();
                    db = new MysqlConnector.dbMysql();
                    if (!user.nivelusupwbi) user.nivelusupwbi = -1;
                    sql = "SELECT * FROM grupos_usuarios WHERE grupo_usuario_id = ?";
                    sql = Mysql.format(sql, user.nivelusupwbi);
                    return db.query(sql);
                })
                .then(rows => {
                    db.close();
                    if (rows.length > 0) {
                        grupoUsuario = rows[0];
                    } else {
                        // Si no hay grupo es que no está autorizado para esta aplicación
                        return reject({ status: 401, message: `Falló la autentificación` });
                    }
                    resolve({
                        usuario: user,
                        token: token,
                        grupoUsuario: grupoUsuario
                    });

                })
                .catch(err => { db.close(); reject(err); });
        });
    },
    postUsuario: (obj) => {
        obj.usuario_id = 0;
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql(userMysql.getConfig());
            let sql = "";
            sql = Mysql.format("SELECT * FROM usuarios WHERE login = ?", obj.login);
            db.query(sql)
                .then(results => {
                    if (results.length > 0) {
                        return reject({ status: 409, message: `Login ${obj.login} en uso` });
                    };
                    sql = "SELECT MAX(codusu) + 1 AS nextcodusu FROM usuarios";
                    return db.query(sql);
                })
                .then(result => {
                    obj.codusu = result.nextcodusu;
                    sql = Mysql.format("INSERT INTO usuarios SET ?", obj);
                    return db.query(sql);
                })
                .then(result => {
                    db.close();
                    delete obj.hash;
                    resolve(obj);
                })
                .catch(err => {
                    db.close();
                    reject(err);
                });
        });
    },
    putUsuario: (obj) => {
        let codusu = obj.codusu;
        return new Promise((resolve, reject) => {
            if (!codusu) return reject({ status: 400, message: `Debe incluir el codusu en la petición` });
            let db = new MysqlConnector.dbMysql(userMysql.getConfig());
            let sql = "";
            sql = Mysql.format("UPDATE usuarios SET ? WHERE codusu = ?", [obj, codusu]);
            db.query(sql)
                .then(() => {
                    db.close();
                    delete obj.hash;
                    resolve(obj);
                })
                .catch(err => { db.close(); reject(err); });
        });
    },
    deleteUsuario: (codusu) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql(userMysql.getConfig());
            let sql = "";
            sql = Mysql.format("DELETE FROM usuarios WHERE codusu = ?", codusu);
            db.query(sql)
                .then(() => { db.close(); resolve({ res: 'OK' }); })
                .catch(err => { db.close(); reject(err); });
        });
    },
    verifyGeneralDirectory: () => {
        // Directorio general de ficheros
        genDir = Path.join(__dirname, '../../ficheros');
        if (!Fs.existsSync(genDir)) {
            // Si no existe el directorio general se crea
            Fs.mkdirSync(genDir);
        }
        fotoDir = genDir + "/fotos";
        if (!Fs.existsSync(fotoDir)) {
            // Si no existe el directorio de fotos se crea
            Fs.mkdirSync(fotoDir);
        }
        return;
    },
    verifyUserDirecory: (usuario_id) => {
        usuDir = Path.join(__dirname, '../../ficheros') + '/U' + usuario_id;
        if (!Fs.existsSync(usuDir)) {
            // Si no existe el directorio de fotos se crea
            Fs.mkdirSync(usuDir);
        }
        return;
    }
};
module.exports = userMysql;