const Mysql = require('mysql');
const MysqlConnector = require('../../connectors/mysql_connector');
const Password = require("../../utilities/password");
const Jwt = require('jsonwebtoken');
const Dotenv = require('dotenv');
Dotenv.config();

const contabilidadMysql = {
    getConfig: () => {
        // Todas las solucitudes en estos endpoints se hace sobre la 
        // base de datos de contabilidad.
        return {
            host: process.env.ARIPWBI_MYSQL_HOST,
            user: process.env.ARIPWBI_MYSQL_USER,
            password: process.env.ARIPWBI_MYSQL_PASSWORD,
            database: process.env.ARIPWBI_MYSQL_CONTABILIDAD,
            port: process.env.ARIPWBI_MYSQL_PORT
        };
    },
    // getEmpresa:
    // Nos devuelve un objeto con el nombre de la empresa 
    // el número de niveles y la longitud máxima de la cuenta
    getEmpresa: () => {
        return new Promise((resolve, reject) => {
            let cfg = contabilidadMysql.getConfig();
            let db = new MysqlConnector.dbMysql(cfg);
            // Obtenemos el registro de la tabla empresa
            let sql = "SELECT * FROM empresa";
            db.query(sql)
                .then(rows => {
                    db.close();
                    if (rows.length == 0) return reject({ status: 404, message: `No se han encontrado registros en la tabla de empresa` });
                    var reg = rows[0];
                    var res = {
                        nombre: reg.nomempre,
                        niveles: reg.numnivel,
                        longitud: reg['numdigi' + reg.numnivel]
                    }
                    resolve(res)
                })
                .catch(err => { db.close(); reject(err); });
        });
    },
    // getCuenta:
    // devuelve la información de la cuenta solicitada
    // permite la busqueda con número de la cuenta completo y si tiene un punto 
    // monta el número de cuenta hasta llegar a la longitud
    getCuenta: (numcuenta) => {
        return new Promise((resolve, reject) => {
            let cfg = contabilidadMysql.getConfig();
            let db = new MysqlConnector.dbMysql(cfg);
            // Obtenemos la información de la empresa
            contabilidadMysql.getEmpresa()
                .then(emp => {
                    // Ahora verificamos como nos quieren hacer la búsqueda.
                    if (numcuenta.indexOf('.') > -1) {
                        // Es el caso de búsqueda compleja
                        var partes = numcuenta.split('.');
                        var relleno = emp.longitud - (partes[0].length + partes[1].length);
                        numcuenta = partes[0] + ''.padEnd(relleno, '0') + partes[1];
                    }
                    let sql = Mysql.format("SELECT * FROM cuentas WHERE codmacta = ?", numcuenta);
                    return db.query(sql);
                })
                .then(rows => {
                    db.close();
                    if (rows.length == 0) return reject({ status: 404, message: `No se encontrado cuenta para el número ${numcuenta}` });
                    var cuenta = rows[0];
                    resolve(cuenta);
                })
                .catch(err => { db.close(); reject(err); });
        });
    },
    // getCuentasRaiz
    // Obtiene todas las cuentas habilitadas para apunte que dependen de la raiz pasada
    // si la raiz es una cuenta completa devovelverá solo ella
    getCuentasRaiz: (raiz) => {
        return new Promise((resolve, reject) => {
            let cfg = contabilidadMysql.getConfig();
            let db = new MysqlConnector.dbMysql(cfg);
            let sql = "SELECT * FROM cuentas WHERE codmacta LIKE '" + raiz + "%' AND apudirec = 'S';";
            return db.query(sql)
                .then(rows => {
                    db.close();
                    if (rows.length == 0) return reject({ status: 404, message: `No se encontrado cuentas para la raiz ${raiz}` });
                    resolve(rows);
                })
                .catch(err => { db.close(); reject(err); });

        });
    },
    // getApuntes:
    // devuelve todos los apuntes que haya en la contabilidad para la cuenta pasada
    getApuntes: (numcuenta) => {
        return new Promise((resolve, reject) => {
            let cfg = contabilidadMysql.getConfig();
            let db = new MysqlConnector.dbMysql(cfg);
            let sql = "SELECT l.*, c.nommacta";
            sql += " FROM hlinapu AS l";
            sql += " LEFT JOIN cuentas AS c ON c.codmacta = l.codmacta"
            sql += " WHERE l.codmacta = ?";
            sql = Mysql.format(sql, numcuenta);
            db.query(sql)
                .then(rows => {
                    if (rows.length == 0) return reject({ status: 404, message: `No se han encontrado apuntes para la cuenta ${numcuenta}` });
                    db.close();
                    resolve(rows);
                })
                .catch(err => { db.close(); reject(err); });
        });
    },
    // getApuntesRaiz:
    // devuelve todos los apuntes que haya en la contabilidad para la raiz de cuenta pasada
    getApuntesRaiz: (raiz) => {
        return new Promise((resolve, reject) => {
            let cfg = contabilidadMysql.getConfig();
            let db = new MysqlConnector.dbMysql(cfg);
            let sql = "SELECT l.*, c.nommacta";
            sql += " FROM hlinapu AS l";
            sql += " LEFT JOIN cuentas AS c ON c.codmacta = l.codmacta"
            sql += " WHERE l.codmacta LIKE '" + raiz + "%' AND c.apudirec = 'S';";
            db.query(sql)
                .then(rows => {
                    // if (rows.length == 0) return reject({ status: 404, message: `No se han encontrado apuntes para la cuenta ${raiz}` });
                    db.close();
                    resolve(rows);
                })
                .catch(err => { db.close(); reject(err); });
        });
    },
};
module.exports = contabilidadMysql;