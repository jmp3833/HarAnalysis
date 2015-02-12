/*
Root of the Node application.
 */

var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var url = require('url');

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
app.get('/api/get-harfile-set', function (req, res){
    yslowService.getHarfiles(function(data){
        res.end(JSON.stringify(data));
    });
});

/**
 * Process and return the full yslow report of every .har file
 * found in the directory specified in the 'dir' query parameter.
 * Note - this search begins in the harfiles directory of the application server.
 */
app.get('/api/yslow-results', function(req, res) {
    var url_parts = url.parse(req.url, true);
    var queryString = url_parts.query.dir;
    yslowService.processAllHarfiles(queryString, function(err, data){
        if(err){throw err}
        res.end(JSON.stringify(data));
    });
});

app.listen(port);
console.log('Server started on port ' + port);