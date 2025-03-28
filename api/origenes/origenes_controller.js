"use strict";
const Express = require('express');
var router = Express.Router();
const OrigenesMySql = require('./origenes_mysql');
const CheckAuth = require('../../middleware/check-auth');

router.get('/', CheckAuth, (req, res, next) => {
    OrigenesMySql.getOrigenes()
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.get('/:id', CheckAuth, (req, res, next) => {
    let id = req.params.id;
    OrigenesMySql.getOrigen(id)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.post('/', CheckAuth, (req, res, next) => {
    OrigenesMySql.postOrigen(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.put('/', CheckAuth, (req, res, next) => {
    OrigenesMySql.putOrigen(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.delete('/:id', CheckAuth, (req, res, next) => {
    let id = req.params.id;
    OrigenesMySql.deleteOrigen(id)
        .then(result => res.json(result))
        .catch(err => next(err));
});




module.exports = router;