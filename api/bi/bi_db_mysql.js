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
                .then(rows => { db.close(); resolve(rows) })
                .catch(err => { db.close(); reject(err); });
        });
    },
    getDBForfaitsCostes: (ariagrodb) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql(connectorDbMysqlApi.getConfig('aripwbi'));
            let sql = "SELECT "
            sql += " f.*, SUM(fe.cantidad * a.preciouc) AS coste_preciouc, SUM(fe.cantidad * a.preciomp) AS coste_preciomp";
            sql += " FROM ariagro10.forfaits AS f";
            sql += " LEFT JOIN ariagro10.forfaits_envases AS fe ON fe.codforfait = f.codforfait";
            sql += " LEFT JOIN ariagro10.sartic AS a ON a.codartic = fe.codartic";
            sql += " GROUP BY f.codforfait;";
            sql = sql.replace(/ariagro10/g, ariagrodb);
            db.query(sql)
                .then(rows => { db.close(); resolve(rows) })
                .catch(err => { db.close(); reject(err); });
        });
    },
    getDBConfpaleCostes: (ariagrodb) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql(connectorDbMysqlApi.getConfig('aripwbi'));
            let sql = "SELECT";
            sql += " c.*, SUM(ce.cantidad * a.preciouc) AS coste_preciouc, SUM(ce.cantidad * a.preciomp) AS coste_preciomp";
            sql += " FROM ariagro10.confpale AS c";
            sql += " LEFT JOIN ariagro10.confpale_envases AS ce ON ce.codpalet = c.codpalet";
            sql += " LEFT JOIN ariagro10.sartic AS a ON a.codartic = ce.codartic";
            sql += " GROUP BY c.codpalet;";
            sql = sql.replace(/ariagro10/g, ariagrodb);
            db.query(sql)
                .then(rows => { db.close(); resolve(rows) })
                .catch(err => { db.close(); reject(err); });
        });
    },
    getDBPaletsCostes: (ariagrodb) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql(connectorDbMysqlApi.getConfig('aripwbi'));
            let sql = "SELECT";
            sql += " *, ";
            sql += " (ss1.pesobrut * ss2.coste_kg_brut) AS coste_kgs_brut,";
            sql += " (ss1.pesoneto * ss2.coste_kg_net) AS coste_kgs_neto,";
            sql += " (ss1.numcajas * ss2.coste_caja) AS coste_cajas";
            sql += " FROM";
            sql += " (SELECT";
            sql += " p1.fechaconf, p2.*";
            sql += " FROM ariagro10.palets AS p1";
            sql += " LEFT JOIN ariagro10.palets_variedad AS p2 ON p2.numpalet = p1.numpalet) AS ss1";
            sql += " LEFT JOIN";
            sql += " (SELECT ";
            sql += " s1.concepto_apunte_id, s1.concepto_id, s1.importe, s1.fecha_inicio_coste, s1.fecha_fin_coste,";
            sql += " importe / SUM(s2.pesobrut) AS coste_kg_brut, importe / SUM(s2.pesoneto) AS coste_kg_net, importe / SUM(s2.numcajas)  AS coste_caja";
            sql += " FROM ";
            sql += " (SELECT ";
            sql += " cp.concepto_apunte_id, c.concepto_id, cp.codmacta, cp.nommacta, cp.fecha_inicio_coste, cp.fecha_fin_coste, importe";
            sql += " FROM aripwbi.conceptos_apuntes AS cp";
            sql += " LEFT JOIN aripwbi.conceptos AS c ON c.concepto_id = cp.concepto_id";
            sql += " WHERE NOT no_computable AND solo_periodo) AS s1";
            sql += " LEFT JOIN";
            sql += " (SELECT";
            sql += " p1.fechaconf, p2.codvarie, p2.pesobrut, p2.pesoneto, p2.numcajas";
            sql += " FROM ariagro10.palets AS p1";
            sql += " LEFT JOIN ariagro10.palets_variedad AS p2 ON p2.numpalet = p1.numpalet) AS s2";
            sql += " ON s2.fechaconf >= s1.fecha_inicio_coste AND s2.fechaconf <= s1.fecha_fin_coste";
            sql += " GROUP BY s1.concepto_apunte_id) AS ss2";
            sql += " ON ss1.fechaconf >= ss2.fecha_inicio_coste AND ss1.fechaconf <= ss2.fecha_fin_coste;";
            sql = sql.replace(/ariagro10/g, ariagrodb);
            db.query(sql)
                .then(rows => { db.close(); resolve(rows) })
                .catch(err => { db.close(); reject(err); });
        });
    },
    getDBCostesGlobales: (ariagrodb) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql(connectorDbMysqlApi.getConfig('aripwbi'));
            let sql = "SELECT";
            sql += " s1.ano, s1.total, s2.total_kgs_brut, s2.total_kgs_neto, s2.total_cajas,";
            sql += " s1.total / s2.total_kgs_brut AS coste_kg_bruto,";
            sql += " s1.total / s2.total_kgs_neto AS coste_kg_neto,";
            sql += " s1.total / s2.total_cajas AS coste_caja";
            sql += " FROM";
            sql += " (SELECT ";
            sql += " YEAR(cp.fechaent) AS ano, SUM(importe) AS total";
            sql += " FROM aripwbi.conceptos_apuntes AS cp";
            sql += " LEFT JOIN aripwbi.conceptos AS c ON c.concepto_id = cp.concepto_id";
            sql += " WHERE NOT c.no_computable AND NOT c.solo_periodo";
            sql += " GROUP BY YEAR(cp.fechaent)) AS s1";
            sql += " LEFT JOIN";
            sql += " (SELECT ";
            sql += " YEAR(p1.fechaconf) AS ano, SUM(p2.pesobrut) AS total_kgs_brut, SUM(p2.pesoneto) AS total_kgs_neto, SUM(numcajas) AS total_cajas";
            sql += " FROM ariagro10.palets AS p1";
            sql += " LEFT JOIN ariagro10.palets_variedad AS p2 ON p2.numpalet = p1.numpalet";
            sql += " GROUP BY YEAR(p1.fechaconf)) AS s2";
            sql += " ON s2.ano = s1.ano";
            sql = sql.replace(/ariagro10/g, ariagrodb);
            db.query(sql)
                .then(rows => { db.close(); resolve(rows) })
                .catch(err => { db.close(); reject(err); });
        });
    },
    getDBCostesGlobalesCampanya: (ariagrodb) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql(connectorDbMysqlApi.getConfig('aripwbi'));
            let sql = "SELECT"; 
            sql += " s1.cd, s1.total, s2.total_kgs_brut, s2.total_kgs_neto, s2.total_cajas, s1.total / s2.total_kgs_brut AS coste_kg_bruto, ";
            sql += " s1.total / s2.total_kgs_neto AS coste_kg_neto, s1.total / s2.total_cajas AS coste_caja ";
            sql += " FROM ";
            sql += " (SELECT  1 AS cd ,SUM(p2.pesobrut) AS total_kgs_brut, SUM(p2.pesoneto) AS total_kgs_neto, SUM(numcajas) AS total_cajas ";
            sql += " FROM ariagro10.palets AS p1 ";
            sql += " LEFT JOIN ariagro10.palets_variedad AS p2 ON p2.numpalet = p1.numpalet) AS s2 ";
            sql += " LEFT JOIN";
            sql += " (SELECT  1 AS cd, SUM(cp.importe) AS total";
            sql += " FROM aripwbi.conceptos_apuntes AS cp ";
            sql += " LEFT JOIN aripwbi.conceptos AS c ON c.concepto_id = cp.concepto_id ";
            sql += " LEFT JOIN ariagro10.empresas AS ae ON TRUE";
            sql += " WHERE NOT c.no_computable AND NOT c.solo_periodo";
            sql += " AND cp.fechaent >= ae.fechaini AND cp.fechaent <= ae.fechafin) AS s1";
            sql += " ON s2.cd = s1.cd";
            sql = sql.replace(/ariagro10/g, ariagrodb);
            db.query(sql)
                .then(rows => { db.close(); resolve(rows) })
                .catch(err => { db.close(); reject(err); });
        });
    },
    getDBCostesComprasVariedad: (ariagrodb) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql(connectorDbMysqlApi.getConfig('aripwbi'));
            let sql = "SELECT";
            sql += " s1. codvarie, s1.total_kgs_brut, s1.total_kgs_neto, s1.total_cajas, s2.compra,";
            sql += " s2.compra / s1.total_kgs_brut AS coste_kg_brut,";
            sql += " s2.compra / s1.total_kgs_neto AS coste_kg_neto,";
            sql += " s2.compra / s1.total_cajas AS coste_caja";
            sql += " FROM";
            sql += " (SELECT  ";
            sql += " p2.codvarie ,SUM(p2.pesobrut) AS total_kgs_brut, SUM(p2.pesoneto) AS total_kgs_neto, SUM(p2.numcajas) AS total_cajas ";
            sql += " FROM ariagro10.palets_variedad AS p2 ";
            sql += " GROUP BY p2.codvarie) AS s1";
            sql += " LEFT JOIN";
            sql += " (SELECT";
            sql += " c1.codvarie, SUM(c1.imporvar) AS compra";
            sql += " FROM ariagro10.rfactsoc_variedad AS c1";
            sql += " GROUP BY c1.codvarie) AS s2";
            sql += " ON s2.codvarie = s1.codvarie";
            sql = sql.replace(/ariagro10/g, ariagrodb);
            db.query(sql)
                .then(rows => { db.close(); resolve(rows) })
                .catch(err => { db.close(); reject(err); });
        });
    },
    getDBCostesPalet: (ariagrodb) => {
        return new Promise((resolve, reject) => {
            let db = new MysqlConnector.dbMysql(connectorDbMysqlApi.getConfig('aripwbi'));
            let sql = "SELECT";
            sql += " ss1.*, ";
            sql += " ss1.pesobrut * ss2.coste_uc_kg_brut AS coste_kg_brut_uc,";
            sql += " ss1.pesobrut * ss2.coste_mp_kg_brut AS coste_kg_brut_mp,";
            sql += " ss1.pesoneto * ss2.coste_uc_kg_neto AS coste_kg_neto_uc,";
            sql += " ss1.pesoneto * ss2.coste_mp_kg_neto AS coste_kg_neto_mp,";
            sql += " ss1.numcajas * ss2.coste_uc_tot_cajas AS coste_cajas_uc,";
            sql += " ss1.numcajas * ss2.coste_mp_tot_cajas AS coste_cajas_mp";
            sql += " FROM"
            sql += " ariagro10.palets_variedad AS ss1";
            sql += " LEFT JOIN";
            sql += " (SELECT";
            sql += " s1.numpalet, ";
            sql += " coste_uc / kg_brut AS coste_uc_kg_brut,"
            sql += " coste_mp / kg_brut AS coste_mp_kg_brut,";
            sql += " coste_uc / kg_neto AS coste_uc_kg_neto,";
            sql += " coste_mp / kg_neto AS coste_mp_kg_neto,";
            sql += " coste_uc / tot_cajas AS coste_uc_tot_cajas,";
            sql += " coste_mp / tot_cajas AS coste_mp_tot_cajas";
            sql += " FROM";
            sql += " (SELECT";
            sql += " p.numpalet, p.codpalet, SUM(pv.pesobrut) AS kg_brut, SUM(pv.pesoneto) AS kg_neto, SUM(numcajas) AS tot_cajas";
            sql += " FROM ariagro10.palets_variedad AS pv";
            sql += " LEFT JOIN ariagro10.palets AS p ON p.numpalet = pv.numpalet";
            sql += " GROUP BY p.numpalet) AS s1";
            sql += " LEFT JOIN";
            sql += " (SELECT";
            sql += " c1.codpalet, c1.nompalet,  SUM(c2.cantidad * a.preciouc) coste_uc, SUM(c2.cantidad * a.preciomp) AS coste_mp";
            sql += " FROM ariagro10.confpale AS c1";
            sql += " LEFT JOIN ariagro10.confpale_envases AS c2 ON c2.codpalet = c1.codpalet";
            sql += " LEFT JOIN ariagro10.sartic AS a ON a.codartic = c2.codartic";
            sql += " GROUP BY c1.codpalet) AS s2";
            sql += " ON s2.codpalet = s1.codpalet) AS ss2";
            sql += " ON ss1.numpalet = ss2.numpalet";
            sql = sql.replace(/ariagro10/g, ariagrodb);
            db.query(sql)
                .then(rows => { db.close(); resolve(rows) })
                .catch(err => { db.close(); reject(err); });
        });
    }
}

module.exports = connectorDbMysqlApi;