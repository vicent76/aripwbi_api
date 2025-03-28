"use strict";
const Express = require('express');
var router = Express.Router();
const ContabilidadMySql = require('./contabilidad_mysql');
const CheckAuth = require('../../middleware/check-auth');

// Permite obtener la longitud máxima de la cuenta contable
router.get('/empresa', CheckAuth, (req, res, next) => {
    ContabilidadMySql.getEmpresa()
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.get('/cuentas/:numcuenta', CheckAuth, (req, res, next) => {
    let numcuenta = req.params.numcuenta;
    ContabilidadMySql.getCuenta(numcuenta)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.get('/cuentas_raiz/:raiz', CheckAuth, (req, res, next) => {
    let raiz = req.params.raiz;
    ContabilidadMySql.getCuentasRaiz(raiz)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.get('/apuntes/:numcuenta', CheckAuth, (req, res, next) => {
    let numcuenta = req.params.numcuenta;
    ContabilidadMySql.getApuntes(numcuenta)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.get('/apuntes_raiz/:raiz', CheckAuth, (req, res, next) => {
    let raiz = req.params.raiz;
    ContabilidadMySql.getApuntesRaiz(raiz)
        .then(result => res.json(result))
        .catch(err => next(err));
});

module.exports = router;