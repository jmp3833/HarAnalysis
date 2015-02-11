var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');

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
    // do logging
    console.log('Something is happening.');
    next();
});

app.post('/api/readme', function (req, res){
    console.log(req.body);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.send('Got a POST request');
})

app.listen(port);
console.log('Server started on port ' + port);
