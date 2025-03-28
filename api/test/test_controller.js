"use strict";
const Express = require('express');
const Dotenv = require('dotenv');
Dotenv.config();


var router = Express.Router();

router.get('/', (req, res) => {
    res.json("TEST");
}); 

module.exports = router;