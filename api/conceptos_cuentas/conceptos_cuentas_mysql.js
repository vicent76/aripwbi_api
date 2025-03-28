const Mysql = require('mysql');
const MysqlConnector = require('../../connectors/mysql_connector');
const Password = require("../../utilities/password");
const Jwt = require('jsonwebtoken');
const Dotenv = require('dotenv');
const Async = require('async');

Dotenv.config();

const conceptoCuentaMysql = {
    getConceptoCuentas: () => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "SELECT * FROM conceptos_cuentas";
            db.query(sql)
                .then(rows => { db.close(); resolve(rows) })
                .catch(err => { db.close(); reject(err); });
        });
    },
    getConceptoCuenta: (id) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "SELECT * FROM conceptos_cuentas WHERE concepto_cuenta_id = ?";
            sql = Mysql.format(sql, id);
            db.query(sql)
                .then(rows => {
                    db.close();
                    if (rows.length == 0) return reject({ status: 404, message: `No se ha encontrado concepto.cuenta para el id ${id}` });
                    let concepto = rows[0];
                    resolve(concepto);
                })
                .catch(err => { db.close(); reject(err); });
        });
    },
    // Obtiene todos los conceptos cuentas de un concepto
    getConceptoCuentaConcepto: (id) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "SELECT * FROM conceptos_cuentas WHERE concepto_id = ?";
            sql = Mysql.format(sql, id);
            db.query(sql)
                .then(rows => {
                    db.close();
                    resolve(rows);
                })
                .catch(err => { db.close(); reject(err); });
        });
    },
    postConceptoCuenta: (obj) => {
        obj.concepto_cuenta_id = 0;
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "";
            sql = Mysql.format("INSERT INTO conceptos_cuentas SET ?", obj);
            db.query(sql)
                .then(result => {
                    db.close();
                    obj.concepto_cuenta_id = result.insertId;
                    delete obj.hash;
                    resolve(obj);
                })
                .catch(err => {
                    db.close();
                    reject(err);
                });
        });
    },
    // postConceptoCuentaExt
    // Controla si la cuenta pasada es una cuenta raiz, en ese caso da de alta todas
    // las cuentas asociadas
    postConceptoCuentaExt: (obj) => {
        let contabd = process.env.ARIPWBI_MYSQL_CONTABILIDAD;
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "SELECT * FROM " + contabd + ".cuentas WHERE codmacta LIKE '" + obj.codmacta + "%' AND apudirec = 'S'";
            db.query(sql)
                .then(cuentas => {
                    db.close();
                    Async.eachSeries(cuentas,
                        (cuenta, callback) => {
                            var conceptoCuenta = obj;
                            conceptoCuenta.concepto_cuenta_id = 0;
                            conceptoCuenta.codmacta = cuenta.codmacta;
                            conceptoCuenta.nommacta = cuenta.nommacta;
                            conceptoCuentaMysql.postConceptoCuenta(conceptoCuenta)
                                .then(res => callback())
                                .catch(err => {
                                    callback(err)
                                })
                        },
                        (err) => {
                            if (err) return reject(err);
                            resolve("Ok");
                        });
                })
                .catch(err => {
                    db.close();
                    reject(err);
                });
        });
    },
    // postConceptoCuentaExtDb
    // Igual que el caso anterior, pero ahora la contabilidad se pasa en la llamada
    // en lugar de ponerla en parámetros.
    postConceptoCuentaExtDb: (contadb, obj) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "SELECT * FROM " + contadb + ".cuentas WHERE codmacta LIKE '" + obj.codmacta + "%' AND apudirec = 'S'";
            db.query(sql)
                .then(cuentas => {
                    db.close();
                    Async.eachSeries(cuentas,
                        (cuenta, callback) => {
                            var conceptoCuenta = obj;
                            conceptoCuenta.concepto_cuenta_id = 0;
                            conceptoCuenta.codmacta = cuenta.codmacta;
                            conceptoCuenta.nommacta = cuenta.nommacta;
                            conceptoCuentaMysql.postConceptoCuenta(conceptoCuenta)
                                .then(res => callback())
                                .catch(err => {
                                    callback(err)
                                })
                        },
                        (err) => {
                            if (err) return reject(err);
                            resolve("Ok");
                        });
                })
                .catch(err => {
                    db.close();
                    reject(err);
                });
        });
    },
    putConceptoCuenta: (obj) => {
        let id = obj.concepto_cuenta_id;
        return new Promise((resolve, reject) => {
            if (!id) return reject({ status: 400, message: `Debe incluir el concepto_cuenta_id en la petición` });
            let db = new MysqlConnector.dbMysql();
            sql = Mysql.format("UPDATE conceptos_cuentas SET ? WHERE concepto_cuenta_id = ?", [obj, id]);
            db.query(sql)
                .then(() => {
                    db.close();
                    delete obj.hash;
                    resolve(obj);
                })
                .catch(err => { db.close(); reject(err); });
        });
    },
    deleteConceptoCuenta: (id) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "";
            sql = Mysql.format("DELETE FROM conceptos_cuentas WHERE concepto_cuenta_id = ?", id);
            db.query(sql)
                .then(() => { db.close(); resolve({ res: 'OK' }); })
                .catch(err => { db.close(); reject(err); });
        });
    }
};
module.exports = conceptoCuentaMysql;