var express = require("express");
var router = express.Router();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');

router.post('/', (req, res, next) => {
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '../../ficheros');
    form.parse(req, function (err, fields, files) {
        // ...
        var file = files.upload;
        var filename = file.name;
        var filepath = file.path;
        var filextension = filename.split('.').pop();
        if (!fields.empleado_id) {
            return res.json({status: 'error'});
        }
        //filename = fields.empleado_id + "." + filextension;
        fs.rename(file.path, path.join(form.uploadDir, filename), (err) => {
            res.json({status: 'server'});
        });
    });
});
router.post('/:userId', (req, res, next) => {
    let userId = req.params.userId;
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '../../ficheros/U' + userId);
    form.parse(req, function (err, fields, files) {
        // ...
        var file = files.upload;
        var filename = file.name;
        var filepath = file.path;
        var filextension = filename.split('.').pop();
        if (!fields.empleado_id) {
            return res.json({status: 'error'});
        }
        //filename = fields.empleado_id + "." + filextension;
        fs.rename(file.path, path.join(form.uploadDir, filename), (err) => {
            res.json({status: 'server'});
        });
    });
});

module.exports = router;