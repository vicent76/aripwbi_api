const Mysql = require('mysql');
const MysqlConnector = require('../../connectors/mysql_connector');
const Password = require("../../utilities/password");
const Jwt = require('jsonwebtoken');
const Dotenv = require('dotenv');
const Moment = require('moment');
const Async = require("async");
const contabilidadMysql = require("../contabilidad/contabilidad_mysql");
Dotenv.config();

const conceptoApuntesMysql = {
    getConceptoApuntes: () => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "SELECT * FROM conceptos_apuntes";
            db.query(sql)
                .then(rows => { db.close(); resolve(rows) })
                .catch(err => { db.close(); reject(err); });
        });
    },
    getConceptoApuntesDyn: (cont, count, start, search) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let total = 0;
            if (!start) start = 0;
            let sql = "SELECT count(*) as total FROM conceptos_apuntes ";
            if (search != "") sql += search;
            db.query(sql)
                .then(rows => {
                    total = rows[0].total;
                    sql = "SELECT * from conceptos_apuntes ";
                    if (search != "") sql += search;
                    if (!cont) {
                        sql += " ORDER BY fechaent DESC limit 200";
                    } else {
                        sql += " ORDER BY fechaent DESC limit " + start + ", " + count;
                    }
                    return db.query(sql);
                })
                .then(
                    rows => {
                        rows = conceptoApuntesMysql.prepareDynData(rows);
                        var res = {
                            data: rows,
                            pos: start,
                            total_count: total
                        }
                        db.close();
                        resolve(res);
                    })
                .catch(err => {
                    db.close();
                    reject(err);
                });
        });
    },
    getConceptoApunte: (id) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "SELECT * FROM conceptos_apuntes WHERE concepto_apunte_id = ?";
            sql = Mysql.format(sql, id);
            db.query(sql)
                .then(rows => {
                    db.close();
                    if (rows.length == 0) return reject({ status: 404, message: `No se ha encontrado concepto.apunte para el id ${id}` });
                    let concepto = rows[0];
                    resolve(concepto);
                })
                .catch(err => { db.close(); reject(err); });
        });
    },
    // Obtiene todos los conceptos apuntes de un concepto
    getConceptoApunteConcepto: (id) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "SELECT * FROM conceptos_apuntes WHERE concepto_id = ?";
            sql = Mysql.format(sql, id);
            db.query(sql)
                .then(rows => {
                    db.close();
                    resolve(rows);
                })
                .catch(err => { db.close(); reject(err); });
        });
    },
    postConceptoApunte: (obj) => {
        obj.concepto_apunte_id = 0;
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "";
            sql = Mysql.format("INSERT INTO conceptos_apuntes SET ?", obj);
            db.query(sql)
                .then(result => {
                    db.close();
                    obj.concepto_apunte_id = result.insertId;
                    delete obj.hash;
                    resolve(obj);
                })
                .catch(err => {
                    db.close();
                    reject(err);
                });
        });
    },
    putConceptoApunte: (obj) => {
        let id = obj.concepto_apunte_id;
        return new Promise((resolve, reject) => {
            if (!id) return reject({ status: 400, message: `Debe incluir el concepto_apunte_id en la petición` });
            let db = new MysqlConnector.dbMysql();
            sql = Mysql.format("UPDATE conceptos_apuntes SET ? WHERE concepto_apunte_id = ?", [obj, id]);
            db.query(sql)
                .then(() => {
                    db.close();
                    delete obj.hash;
                    resolve(obj);
                })
                .catch(err => { db.close(); reject(err); });
        });
    },
    deleteConceptoApunte: (id) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            let sql = "";
            sql = Mysql.format("DELETE FROM conceptos_apuntes WHERE concepto_apunte_id = ?", id);
            db.query(sql)
                .then(() => { db.close(); resolve({ res: 'OK' }); })
                .catch(err => { db.close(); reject(err); });
        });
    },
    // postCrearApuntes
    postCrearApuntes: (dFecha, hFecha) => {
        return new Promise((resolve, reject) => {
            conceptoApuntesMysql.eliminarApuntesDesligados(dFecha, hFecha)
                .then(res => {
                    return conceptoApuntesMysql.crearApuntesNuevos(dFecha, hFecha);
                })
                .then(res => {
                    return conceptoApuntesMysql.modificarApuntesExistentes(dFecha, hFecha);
                })
                .then(res => {
                    resolve('OK');
                })
                .catch(err => reject(err));
        });
    },

    // postCrearApuntesDb
    // Crea los apuntes teniendo en cuenta los apuntes de todos los orígenes
    postCrearApuntesDb: (dFecha, hFecha) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql();
            // Obtenemos todos los orígenes
            let sql = "SELECT * FROM origenes";
            db.query(sql)
                .then(origenes => {
                    db.close();
                    // Ahora procesamos de manera asícrona cada origen individualmente
                    Async.eachSeries(origenes,
                        (origen, callback) => {
                            conceptoApuntesMysql.eliminarApuntesDesligados(dFecha, hFecha, origen)
                                .then(res => {
                                    return conceptoApuntesMysql.crearApuntesNuevos(dFecha, hFecha, origen);
                                })
                                .then(res => {
                                    return conceptoApuntesMysql.modificarApuntesExistentes(dFecha, hFecha, origen);
                                })
                                .then(res => {
                                    callback();
                                })
                                .catch(err => callback(err));
                        },
                        (err) => {
                            if (err) return reject(err);
                            resolve("Ok");
                        });
                })
                .catch(err => reject(err));
        })
    },


    // --> Nueva versión de creación de apuntes ------------------------------

    // eliminarApuntesDesligados:
    // Eliminar los conceptos_apuntes que no tienen equivalencia en los apuntes contables
    // normalmente porque esos apuntes han sido modificados en la contabilidad.
    eliminarApuntesDesligados: (dFecha, hFecha, origen) => {
        return new Promise((resolve, reject) => {
            // Obtenemos el nombre de la contabilidad por defecto.
            let contadb = process.env.ARIPWBI_MYSQL_CONTABILIDAD;
            // Creamos el sql de borrado
            let db = new MysqlConnector.dbMysql();
            let sql = "DELETE FROM conceptos_apuntes";
            sql += " WHERE concepto_apunte_id IN";
            sql += " (SELECT concepto_apunte_id";
            sql += " FROM ";
            sql += " (SELECT *";
            sql += " FROM conceptos_apuntes ";
            sql += " WHERE (numdiari, fechaent, numasien, linliapu)";
            if (origen) contadb = origen.contadb;
            sql += " NOT IN (SELECT numdiari, fechaent, numasien, linliapu FROM " + contadb + ".hlinapu)) AS conceptmp)";
            if (dFecha != "" && hFecha != "") {
                sql += " AND fechaent >= '" + dFecha + "' AND fechaent <= '" + hFecha + "'";
            }
            if (origen) sql += " AND origen_id = " + origen.origen_id;
            db.query(sql)
                .then(rows => {
                    db.close();
                    resolve('OK');
                })
                .catch(err => {
                    db.close();
                    reject(err);
                })
        })
    },
    // crearApuntesNuevos:
    // Obtiene de la contabilidad los apuntes que deberíamos tener en nuestra base de datos y que no tenemos
    // estos apuntes deben ser creados en la tabla conceptos_apuntes.
    crearApuntesNuevos: (dFecha, hFecha, origen) => {
        return new Promise((resolve, reject) => {
            // Obtenemos el nombre de la contabilidad por defecto.
            let contadb = process.env.ARIPWBI_MYSQL_CONTABILIDAD;
            // Creamos el sql de extractor
            let db = new MysqlConnector.dbMysql();
            let sql = "SELECT ";
            sql += " c2.concepto_id, c1.codmacta, c.nommacta, c1.fechaent, ";
            sql += " COALESCE(c1.timporteD,0) - COALESCE(c1.timporteH,0) AS importe,";
            sql += " c1.numasien, c1.numdocum, c1.ampconce,";
            sql += " c1.numdiari, c1.linliapu, c2.periodo, c2.origen_id, c2.periodo_id, c4.fecha_inicio, c4.fecha_fin";
            if (origen) contadb = origen.contadb;
            sql += " FROM " + contadb + ".hlinapu AS c1";
            sql += " LEFT JOIN " + contadb + ".cuentas AS c ON c.codmacta = c1.codmacta";
            sql += " LEFT JOIN conceptos_cuentas AS c2 ";
            sql += " ON c2.codmacta = c1.codmacta";
            sql += " LEFT JOIN (SELECT numdiari, fechaent, numasien, linliapu FROM conceptos_apuntes) AS c3";
            sql += " ON (c3.numdiari = c1.numdiari AND c3.fechaent = c1.fechaent AND c3.numasien = c1.numasien AND c3.linliapu = c1.linliapu)";
            sql += " LEFT JOIN periodos AS c4 ON c4.periodo_id = c2.periodo_id";
            sql += " WHERE NOT c2.concepto_id IS NULL ";
            sql += " AND c3.numdiari IS NULL";
            sql += " AND c1.codconce NOT IN (960, 970, 980)";
            if (dFecha != "" && hFecha != "") {
                sql += " AND c1.fechaent >= '" + dFecha + "' AND c1.fechaent <= '" + hFecha + "'";
            }
            sql += " AND c2.origen_id = " + origen.origen_id;
            db.query(sql)
                .then(apuntes => {
                    db.close();
                    // Utilizamos async para poder enviar secuencialmente a crear todos
                    // los registros de concepto_apuntes asociados a esos apuntes
                    Async.eachSeries(apuntes,
                        (apunte, callback) => {
                            conceptoApuntesMysql.crearModificarUnApunte(apunte, origen)
                                .then(res => callback())
                                .catch(err => callback(err))
                        },
                        (err) => {
                            if (err) return reject(err);
                            resolve("Ok");
                        });
                })
                .catch(err => {
                    db.close();
                    reject(err);
                })
        });
    },
    // modificarApuntesExistentes:
    // Ahora obtenemos para su posible modificación los apuntes que ya estaban pero para los que ha cambiado el 
    // importe. Si el cambio hubiera sido en la fecha de apunte este habría quedado huérfano y se habría eliminado
    // en eliminarApuntesDesligados, luego crearApuntesNuevos lo habría creado
    modificarApuntesExistentes: (dFecha, hFecha, origen) => {
        return new Promise((resolve, reject) => {
            // Obtenemos el nombre de la contabilidad por defecto.
            let contadb = process.env.ARIPWBI_MYSQL_CONTABILIDAD;
            // Creamos el sql de extractor
            let db = new MysqlConnector.dbMysql();
            let sql = "SELECT "
            sql += " c3.concepto_apunte_id, c2.concepto_id, c1.codmacta, c.nommacta, c1.fechaent, ";
            sql += " COALESCE(c1.timporteD,0) - COALESCE(c1.timporteH,0) AS importe, ";
            sql += " c1.numasien, c1.numdocum, c1.ampconce,";
            sql += " c1.numdiari, c1.linliapu, c2.periodo, c2.origen_id, c2.periodo_id, c4.fecha_inicio, c4.fecha_fin";
            if (origen) contadb = origen.contadb;
            sql += " FROM " + contadb + ".hlinapu AS c1";
            sql += " LEFT JOIN " + contadb + ".cuentas AS c ON c.codmacta = c1.codmacta";
            sql += " LEFT JOIN conceptos_cuentas AS c2 ";
            sql += " ON c2.codmacta = c1.codmacta";
            sql += " LEFT JOIN (SELECT numdiari, fechaent, numasien, linliapu, importe, concepto_apunte_id, periodo FROM conceptos_apuntes) AS c3";
            sql += " ON (c3.numdiari = c1.numdiari AND c3.fechaent = c1.fechaent AND c3.numasien = c1.numasien AND c3.linliapu = c1.linliapu)";
            sql += " LEFT JOIN periodos AS c4 ON c4.periodo_id = c2.periodo_id";
            sql += " WHERE NOT c2.concepto_id IS NULL ";
            sql += " AND NOT c3.numdiari IS NULL";
            sql += " AND c1.codconce NOT IN (960, 970, 980)";
            sql += " AND COALESCE(c1.timporteD,0) - COALESCE(c1.timporteH,0) <> c3.importe";
            sql += " OR c2.periodo <> COALESCE(c3.periodo,'')";
            if (dFecha != "" && hFecha != "") {
                sql += " AND c1.fechaent >= '" + dFecha + "' AND c1.fechaent <= '" + hFecha + "'";
            }
            sql += " AND c2.origen_id = " + origen.origen_id;
            db.query(sql)
                .then(apuntes => {
                    db.close();
                    // Utilizamos async para poder enviar secuencialmente a crear todos
                    // los registros de concepto_apuntes asociados a esos apuntes
                    Async.eachSeries(apuntes,
                        (apunte, callback) => {
                            conceptoApuntesMysql.crearModificarUnApunte(apunte, origen)
                                .then(res => callback())
                                .catch(err => callback(err))
                        },
                        (err) => {
                            if (err) return reject(err);
                            resolve("Ok");
                        });
                })
                .catch(err => {
                    db.close();
                    reject(err);
                })
        });
    },
    // crearModificarUnApunte:
    // Teniendo en cuenta la exitencia o no de la propiedad concepto_apunte_id en el
    // registro pasado lo modifica o crea en la tabla conceptos_apuntes.
    crearModificarUnApunte: (apunte, origen) => {
        return new Promise((resolve, reject) => {
            regConceptoApunte = {
                concepto_apunte_id: 0,
                concepto_id: apunte.concepto_id,
                codmacta: apunte.codmacta,
                nommacta: apunte.nommacta, // esta columa ha sido obtenida previamente por cruce con cuentas
                fechaent: new Date(apunte.fechaent),
                numasien: apunte.numasien,
                numdiari: apunte.numdiari,
                linliapu: apunte.linliapu,
                importe: apunte.importe,
                numdocum: apunte.numdocum,
                ampconce: apunte.ampconce,
                periodo: apunte.periodo
            }
            if (origen) regConceptoApunte.origen_id = origen.origen_id;
            if (!apunte.concepto_apunte_id) {
                regConceptoApunte.concepto_apunte_id = 0;
            } else {
                regConceptoApunte.concepto_apunte_id = apunte.concepto_apunte_id;
            }
            // Calculo de las fechas en funcion del periodo
            apunte.fechaent = new Date(apunte.fechaent); // Hacemos esto para evitar los problemas con las versiones de MySQL
            switch (apunte.periodo) {
                case 'SEMANA':
                    regConceptoApunte.fecha_inicio_coste = Moment(apunte.fechaent).startOf('week').format('YYYY-MM-DD');
                    regConceptoApunte.fecha_fin_coste = Moment(apunte.fechaent).endOf('week').format('YYYY-MM-DD');
                    break;
                case 'MES':
                    regConceptoApunte.fecha_inicio_coste = Moment(apunte.fechaent).startOf('month').format('YYYY-MM-DD');
                    regConceptoApunte.fecha_fin_coste = Moment(apunte.fechaent).endOf('month').format('YYYY-MM-DD');
                    break;
                case 'TRIMESTRE':
                    regConceptoApunte.fecha_inicio_coste = Moment(apunte.fechaent).startOf('quarter').format('YYYY-MM-DD');
                    regConceptoApunte.fecha_fin_coste = Moment(apunte.fechaent).endOf('quarter').format('YYYY-MM-DD');
                    break;
                case 'ANO':
                    regConceptoApunte.fecha_inicio_coste = Moment(apunte.fechaent).startOf('year').format('YYYY-MM-DD');
                    regConceptoApunte.fecha_fin_coste = Moment(apunte.fechaent).endOf('year').format('YYYY-MM-DD');
                    break;
                case 'ESPECIFICO':
                    regConceptoApunte.fecha_inicio_coste = apunte.fecha_inicio;
                    regConceptoApunte.fecha_fin_coste = apunte.fecha_fin;
                    break;
                default:
                    // Coincide con el caso DIA
                    regConceptoApunte.fecha_inicio_coste = apunte.fechaent;
                    regConceptoApunte.fecha_fin_coste = apunte.fechaent;
                    break;
            }
            if (regConceptoApunte.concepto_apunte_id == 0) {
                conceptoApuntesMysql.postConceptoApunte(regConceptoApunte)
                    .then(row => resolve('OK'))
                    .catch(err => reject(err));
            } else {
                conceptoApuntesMysql.putConceptoApunte(regConceptoApunte)
                    .then(row => resolve('OK'))
                    .catch(err => reject(err));
            }
        });
    },
    prepareDynData: (data) => {
        data.forEach(d => {
            d.fechaent = Moment(d.fechaent).format('YYYY-MM-DD');
            d.fecha_inicio_coste = Moment(d.fecha_inicio_coste).format('YYYY-MM-DD');
            d.fecha_fin_coste = Moment(d.fecha_fin_coste).format('YYYY-MM-DD');
        });
        return data;
    }
};
module.exports = conceptoApuntesMysql;