// connector_controller.js
// Returns the rows from an specific database and table
const express = require('express');
const connectorDb = require('./connector_db_mysql');
var router = express.Router();

router.get('/:db/:table', (req, res, next) => {
    var db = req.params.db;
    var table = req.params.table;
    connectorDb.getDBTableRecords(db, table)
        .then(result => res.json(result))
        .catch(err => next(err));
})

module.exports = router;

