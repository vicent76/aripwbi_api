"use strict";
const Express = require('express');
var router = Express.Router();
const PeriodosMySql = require('./periodos_mysql');
const CheckAuth = require('../../middleware/check-auth');

router.get('/', CheckAuth, (req, res, next) => {
    PeriodosMySql.getPeriodos()
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.get('/:id', CheckAuth, (req, res, next) => {
    let id = req.params.id;
    PeriodosMySql.getPeriodo(id)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.post('/', CheckAuth, (req, res, next) => {
    PeriodosMySql.postPeriodo(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.put('/', CheckAuth, (req, res, next) => {
    PeriodosMySql.putPeriodo(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.delete('/:id', CheckAuth, (req, res, next) => {
    let id = req.params.id;
    PeriodosMySql.deletePeriodo(id)
        .then(result => res.json(result))
        .catch(err => next(err));
});




module.exports = router;