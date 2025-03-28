"use strict";
const Express = require('express');
var router = Express.Router();
const CategoriasMySql = require('./categorias_mysql');
const CheckAuth = require('../../middleware/check-auth');

router.get('/', CheckAuth, (req, res, next) => {
    CategoriasMySql.getCategorias()
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.get('/:id', CheckAuth, (req, res, next) => {
    let id = req.params.id;
    CategoriasMySql.getCategoria(id)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.post('/', CheckAuth, (req, res, next) => {
    CategoriasMySql.postCategoria(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.put('/', CheckAuth, (req, res, next) => {
    CategoriasMySql.putCategoria(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.delete('/:id', CheckAuth, (req, res, next) => {
    let id = req.params.id;
    CategoriasMySql.deleteCategoria(id)
        .then(result => res.json(result))
        .catch(err => next(err));
});




module.exports = router;