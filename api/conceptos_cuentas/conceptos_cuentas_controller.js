"use strict";
const Express = require('express');
var router = Express.Router();
const ConceptoCuentasMySql = require('./conceptos_cuentas_mysql');
const CheckAuth = require('../../middleware/check-auth');

router.get('/', CheckAuth, (req, res, next) => {
    ConceptoCuentasMySql.getConceptoCuentas()
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.get('/:id', CheckAuth, (req, res, next) => {
    let id = req.params.id;
    ConceptoCuentasMySql.getConceptoCuenta(id)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.get('/concepto/:id', CheckAuth, (req, res, next) => {
    let id = req.params.id;
    ConceptoCuentasMySql.getConceptoCuentaConcepto(id)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.post('/', CheckAuth, (req, res, next) => {
    ConceptoCuentasMySql.postConceptoCuenta(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.post('/ext', CheckAuth, (req, res, next) => {
    ConceptoCuentasMySql.postConceptoCuentaExt(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.post('/extdb/:contadb', CheckAuth, (req, res, next) => {
    let contadb = req.params.contadb;
    ConceptoCuentasMySql.postConceptoCuentaExtDb(contadb, req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.put('/', CheckAuth, (req, res, next) => {
    ConceptoCuentasMySql.putConceptoCuenta(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
});

router.delete('/:id', CheckAuth, (req, res, next) => {
    let id = req.params.id;
    ConceptoCuentasMySql.deleteConceptoCuenta(id)
        .then(result => res.json(result))
        .catch(err => next(err));
});




module.exports = router;