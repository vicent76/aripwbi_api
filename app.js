"use strict";
const Express = require('express');
const Cors = require('cors');
const Morgan = require('morgan');
const Winston = require('./winston');
const BodyParser = require("body-parser");
const ServeIndex = require('serve-index');


const app = Express();

if (process.env.NODE_ENV != "TEST") app.use(Morgan('combined', { stream: Winston.stream }));
app.use(Cors());
app.use(BodyParser.urlencoded({ extended: false }));
app.use(BodyParser.json());

// Servidor de ficheros estáticos
app.use(Express.static(__dirname + '/www'));

app.use('/version', require('./api/version/version_controller'));
app.use('/test', require('./api/test/test_controller'));
app.use('/connector', require('./api/connector/connector_controller'));
app.use('/usuarios', require('./api/usuarios/usuarios_controller'));
app.use('/grupos_usuarios', require('./api/grupos_usuarios/grupos_usuarios_controller'));
app.use('/conceptos', require('./api/conceptos/conceptos_controller'));
app.use('/contabilidad', require('./api/contabilidad/contabilidad_controller'));
app.use('/contabilidad_db', require('./api/contabilidad_db/contabilidad_db_controller'));
app.use('/conceptos_cuentas', require('./api/conceptos_cuentas/conceptos_cuentas_controller'));
app.use('/conceptos_apuntes', require('./api/conceptos_apuntes/conceptos_apuntes_controller'));
app.use('/categorias', require('./api/categorias/categorias_controller'));
app.use('/origenes', require('./api/origenes/origenes_controller'));
app.use('/bi', require('./api/bi/bi_controller'));
app.use('/periodos', require('./api/periodos/periodos_controller'));

app.use((req, res, next) => {
    const error = new Error("No se ha encontrado punto de entrada");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    if (process.env.NODE_ENV != "TEST") Winston.error(error);
    //Winston.error(error);
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;