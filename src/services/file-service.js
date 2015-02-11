function getReadme(){
    var filename = __dirname.toString() + '/' +  req.body.file;

    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) throw err;
        console.log('OK: ' + filename);
        res.end(data);
    });
}

exports.getReadme = getReadme();
