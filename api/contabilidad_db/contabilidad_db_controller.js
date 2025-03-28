"use strict";
const Express = require('express');
var router = Express.Router();
const ContabilidadMySql = require('./contabilidad_db_mysql');
const CheckAuth = require('../../middleware/check-auth');

// Permite obtener la longitud máxima de la cuenta contable
router.get('/empresa/:contadb', CheckAuth, (req, res, next) => {
    let contadb = req.params.contadb;
    ContabilidadMySql.getEmpresa(contadb)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.get('/cuentas/:contadb/:numcuenta', CheckAuth, (req, res, next) => {
    let contadb = req.params.contadb;
    let numcuenta = req.params.numcuenta;
    ContabilidadMySql.getCuenta(contadb, numcuenta)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.get('/cuentas_raiz/:contadb/:raiz', CheckAuth, (req, res, next) => {
    let contadb = req.params.contadb;
    let raiz = req.params.raiz;
    ContabilidadMySql.getCuentasRaiz(contadb, raiz)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.get('/apuntes/:contadb/:numcuenta', CheckAuth, (req, res, next) => {
    let contadb = req.params.contadb;
    let numcuenta = req.params.numcuenta;
    ContabilidadMySql.getApuntes(contadb, numcuenta)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.get('/apuntes_raiz/:contadb/:raiz', CheckAuth, (req, res, next) => {
    let contadb = req.params.contadb;
    let raiz = req.params.raiz;
    ContabilidadMySql.getApuntesRaiz(contadb, raiz)
        .then(result => res.json(result))
        .catch(err => next(err));
});

module.exports = router;