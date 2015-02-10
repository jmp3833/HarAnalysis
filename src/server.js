// server.js

var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');

app.use(bodyParser());

var port = process.env.PORT || 3000;

var router = express.Router();

//For future logging
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next();
});

// respond with "Hello World!" on the homepage
app.get('/', function (req, res) {
    res.send('Hello World!');
})

// accept POST request on the homepage
app.post('/api/readme', function (req, res){
    console.log(req.body);
    res.send('Got a POST request');
})

app.listen(port);
console.log('Server started on port ' + port);
