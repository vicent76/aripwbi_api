"use strict";
const Dotenv = require('dotenv');
const App = require('./app');
const Winston = require('./winston');
const Pack = require('./package.json');

Dotenv.config();

var apiPort = process.env.ARIPWBI_PORT || 8088;

App.listen(apiPort, () => {
    Winston.info(Pack.name + " VRS: " + Pack.version);
    Winston.info("Listening on port " + apiPort + "...");
});