"use strict";
const Express = require('express');
var router = Express.Router();
const ConceptosMySql = require('./conceptos_mysql');
const CheckAuth = require('../../middleware/check-auth');

router.get('/', CheckAuth, (req, res, next) => {
    ConceptosMySql.getConceptos()
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.get('/:id', CheckAuth, (req, res, next) => {
    let id = req.params.id;
    ConceptosMySql.getConcepto(id)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.post('/', CheckAuth, (req, res, next) => {
    ConceptosMySql.postConcepto(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.put('/', CheckAuth, (req, res, next) => {
    ConceptosMySql.putConcepto(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.delete('/:id', CheckAuth, (req, res, next) => {
    let id = req.params.id;
    ConceptosMySql.deleteConcepto(id)
        .then(result => res.json(result))
        .catch(err => next(err));
});




module.exports = router;