"use strict";
const Express = require('express');
var router = Express.Router();
const UsuariosMySql = require('./usuarios_mysql');
const CheckAuth = require('../../middleware/check-auth');

router.get('/', CheckAuth, (req, res, next) => {
    UsuariosMySql.getUsuarios()
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.get('/:codusu', CheckAuth, (req, res, next) => {
    let codusu = req.params.codusu;
    UsuariosMySql.getUsuario(codusu)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.post('/login', (req, res, next) => {
    UsuariosMySql.loginUsuario(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.post('/', CheckAuth, (req, res, next) => {
    UsuariosMySql.postUsuario(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.put('/', CheckAuth, (req, res, next) => {
    UsuariosMySql.putUsuario(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.delete('/:codusu', CheckAuth, (req, res, next) => {
    let codusu = req.params.codusu;
    UsuariosMySql.deleteUsuario(codusu)
        .then(result => res.json(result))
        .catch(err => next(err));
});




module.exports = router;