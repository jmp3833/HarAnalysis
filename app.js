/**
* Analyze a batch of HAR files and calculate various metrics
* such as the overall 'score' of the HAR set as determined by Yslow 
* and more information on specific HAR files that don't meet a rating threshold
*
* Optional script args: node server.js [ratingThreshold(0-100)] [directory to analyze (defaults to script dir.)]
**/

"use strict";

var harProcessor = require('./src/harProcessor');
//Minimum score each file should have
var ratingThreshold = 70;
//Directory to analyze files
var analysisDir = '.';

if(process.argv.length != 4) {
  console.log("\nOptional script args: node server.js [ratingThreshold(0-100)] [directory to analyze (defaults to script dir.)]\n\n");
}
else {
  ratingThreshold = process.argv[2];
  analysisDir = process.argv[3];
}

exports.ratingThreshold = ratingThreshold;
exports.analysisDir = analysisDir;

harProcessor.grabFiles();