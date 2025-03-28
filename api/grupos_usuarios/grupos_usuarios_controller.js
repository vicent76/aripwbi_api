"use strict";
const Express = require('express');
var router = Express.Router();
const GruposUsuariosMySql = require('./grupos_usuarios_mysql');
const CheckAuth = require('../../middleware/check-auth');

router.get('/', CheckAuth, (req, res, next) => {
    GruposUsuariosMySql.getGruposUsuarios()
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.get('/:id', CheckAuth, (req, res, next) => {
    let id = req.params.id;
    GruposUsuariosMySql.getGrupoUsuario(id)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.post('/', CheckAuth, (req, res, next) => {
    GruposUsuariosMySql.postGrupoUsuario(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.put('/', CheckAuth, (req, res, next) => {
    GruposUsuariosMySql.putGrupoUsuario(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.delete('/:id', CheckAuth, (req, res, next) => {
    let id = req.params.id;
    GruposUsuariosMySql.deleteGrupoUsuario(id)
        .then(result => res.json(result))
        .catch(err => next(err));
});




module.exports = router;