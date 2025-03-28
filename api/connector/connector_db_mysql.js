// connector_db_mysql.js
const mysql = require('mysql');
const MysqlConnector = require('../../connectors/mysql_connector');

const connectorDbMysqlApi = {
    getConfig: (db) => {
        // El caso de los usuarios es especial porque vienen
        // de una base de datos externa ARIPWBI_MYSQL_USUARIOS
        // que no es la de por defecto ARIPWBI_MYSQL_DATABASE
        return {
            host: process.env.ARIPWBI_MYSQL_HOST,
            user: process.env.ARIPWBI_MYSQL_USER,
            password: process.env.ARIPWBI_MYSQL_PASSWORD,
            database: db,
            port: process.env.ARIPWBI_MYSQL_PORT
        };
    },
    getDBTableRecords: (database, table) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql(connectorDbMysqlApi.getConfig(database));
            let sql = "SELECT * FROM " + table;
            db.query(sql)
                .then(rows => {
                    if (rows.length > 0) {
                        db.close();
                        resolve(rows);
                    } else {
                        // VRS 0.4.0 Nuevo tratamiento cuando no hay registros
                        // se trata de devolver uno con todos los campod a null
                        // para que pwbi no pete.
                        sql = "SELECT `COLUMN_NAME` ";
                        sql += " FROM `INFORMATION_SCHEMA`.`COLUMNS` ";
                        sql += " WHERE `TABLE_SCHEMA`='" + database + "'";
                        sql += " AND `TABLE_NAME`='" + table + "'";
                        return db.query(sql);
                    }
                })
                .then(names => {
                    db.close();
                    // Si llega hasta aquí lo que en realidada está devolviendo son
                    // los nombres de las columnas de esa tabla en esa base de datos
                    rows = [];
                    reg = {};
                    names.forEach(name => {
                        reg[name.COLUMN_NAME] = null;
                    });
                    rows.push(reg);
                    resolve(rows);
                })
                .catch(err => { db.close(); reject(err); });
        });
    }
}

module.exports = connectorDbMysqlApi;