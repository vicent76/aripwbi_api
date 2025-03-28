// bi_controller.js
// Se usa para la obtención de datos calculados para los informes pwbi
const express = require('express');
const connectorDb = require('./bi_db_mysql');
var router = express.Router();

router.get('/forfaits_costes/:ariagrodb', (req, res, next) => {
    var ariagrodb = req.params.ariagrodb;
    connectorDb.getDBForfaitsCostes(ariagrodb)
        .then(result => res.json(result))
        .catch(err => next(err));
})

router.get('/confpale_costes/:ariagrodb', (req, res, next) => {
    var ariagrodb = req.params.ariagrodb;
    connectorDb.getDBConfpaleCostes(ariagrodb)
        .then(result => res.json(result))
        .catch(err => next(err));
})

router.get('/palets_costes/:ariagrodb', (req, res, next) => {
    var ariagrodb = req.params.ariagrodb;
    connectorDb.getDBPaletsCostes(ariagrodb)
        .then(result => res.json(result))
        .catch(err => next(err));
})

router.get('/costes_globales/:ariagrodb', (req, res, next) => {
    var ariagrodb = req.params.ariagrodb;
    connectorDb.getDBCostesGlobales(ariagrodb)
        .then(result => res.json(result))
        .catch(err => next(err));
})

router.get('/costes_compras/:ariagrodb', (req, res, next) => {
    var ariagrodb = req.params.ariagrodb;
    connectorDb.getDBCostesComprasVariedad(ariagrodb)
        .then(result => res.json(result))
        .catch(err => next(err));
})

router.get('/costes_globales_campanya/:ariagrodb', (req, res, next) => {
    var ariagrodb = req.params.ariagrodb;
    connectorDb.getDBCostesGlobalesCampanya(ariagrodb)
        .then(result => res.json(result))
        .catch(err => next(err));
})

router.get('/costes_palets/:ariagrodb', (req, res, next) => {
    var ariagrodb = req.params.ariagrodb;
    connectorDb.getDBCostesPalet(ariagrodb)
        .then(result => res.json(result))
        .catch(err => next(err));
})

module.exports = router;

