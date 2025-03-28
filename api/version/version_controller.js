"use strict";
const Express = require('express');
const Pack = require('../../package.json');

var router = Express.Router();

router.get('/', (req, res) => {
    var version = {
        name: Pack.name,
        version: Pack.version,
        description: Pack.description
    }
    res.json(version);
});

router.get('/msoler', (req, res) => {
    res.json("M.Angel te mira");
});


module.exports = router;