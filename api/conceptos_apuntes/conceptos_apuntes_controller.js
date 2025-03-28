"use strict";
const Express = require('express');
var router = Express.Router();
const ConceptoApuntesMySql = require('./conceptos_apuntes_mysql');
const CheckAuth = require('../../middleware/check-auth');

router.get('/', CheckAuth, (req, res, next) => {
    ConceptoApuntesMySql.getConceptoApuntes()
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.get('/dyn',  (req, res, next) => {
    var cont = req.query.continue;
    var count = req.query.count;
    var start = req.query.start;
    var search = req.query.search;
    ConceptoApuntesMySql.getConceptoApuntesDyn(cont, count, start, search)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.get('/:id', CheckAuth, (req, res, next) => {
    let id = req.params.id;
    ConceptoApuntesMySql.getConceptoApunte(id)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.get('/concepto/:id', CheckAuth, (req, res, next) => {
    let id = req.params.id;
    ConceptoApuntesMySql.getConceptoApunteConcepto(id)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.post('/', CheckAuth, (req, res, next) => {
    ConceptoApuntesMySql.postConceptoApunte(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.post('/crear_apuntes', CheckAuth, (req, res, next) => {
    ConceptoApuntesMySql.postCrearApuntes()
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.post('/crear_apuntes/:dFecha/:hFecha', CheckAuth, (req, res, next) => {
    let dFecha = req.params.dFecha;
    let hFecha = req.params.hFecha;
    ConceptoApuntesMySql.postCrearApuntes(dFecha, hFecha)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.post('/crear_apuntes_db/:dFecha/:hFecha', CheckAuth, (req, res, next) => {
    let dFecha = req.params.dFecha;
    let hFecha = req.params.hFecha;
    ConceptoApuntesMySql.postCrearApuntesDb(dFecha, hFecha)
        .then(result => res.json(result))
        .catch(err => next(err));
});


router.put('/', CheckAuth, (req, res, next) => {
    ConceptoApuntesMySql.putConceptoApunte(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.delete('/:id', CheckAuth, (req, res, next) => {
    let id = req.params.id;
    ConceptoApuntesMySql.deleteConceptoApunte(id)
        .then(result => res.json(result))
        .catch(err => next(err));
});




module.exports = router;