/*
Root of the Node application.
 */

var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var fs = require('fs');

/*API Route Services*/
var yslowService = require('./src/services/yslow-scores');
var fileService = require('./src/services/file-service');

app.use(bodyParser());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var port = process.env.PORT || 3000;

var router = express.Router();

//For future logging
router.use(function(req, res, next) {
    next();
});

//API Routes

/**
 * Route to test connection with the Angular Dashboard UI
 * Simply returns a string containing the readme markdown for this project.
 */
app.post('/api/readme', function (req, res){
    var filename = __dirname.toString() + '/' +  req.body.file;
    var fileContents = fileService.getReadme(filename);
    res.end(fileContents);
})

/**
 * Grab all har files in a recursive directory tree beginning with the
 * /harfiles base dir.
 */
app.get('/api/getHarFileSet', function (req, res){
    yslowService.getHarfiles(function(data){
        res.end(JSON.stringify(data));
    });
})

app.listen(port);
console.log('Server started on port ' + port);