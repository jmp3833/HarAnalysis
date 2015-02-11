/** Test service to integrate with the
 * angular dashboard application.
 */
var fs = require('fs');
/**
 * Get readme.md file to send to the frontend application.
 * @param filename - name of the Readme file
 */
function getReadme(filename){
    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) throw err;
        console.log('OK: ' + filename);
        return data;
    });
}

module.exports = {
    getReadme: getReadme
};
