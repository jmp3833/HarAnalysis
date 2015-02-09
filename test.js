/**
* Analyze a batch of HAR files and calculate various metrics
* such as the overall 'score' of the HAR set as determined by Yslow 
* and more information on specific HAR files that don't meet a rating threshold
*
* Optional script args: node server.js [ratingThreshold(0-100)] [directory to analyze (defaults to script dir.)]
**/
"use strict";

var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');
var YSLOW = require('yslow').YSLOW;
var doc = require('jsdom').jsdom();
var async = require('async');

//Minimum score each file should have
var ratingThreshold;
//Directory to analyze files
var analysisDir;

if(process.argv.length != 4) {
  console.log("\nOptional script args: node server.js [ratingThreshold(0-100)] [directory to analyze (defaults to script dir.)]\n\n");
  var ratingThreshold = 70;
  var analysisDir = '.';
}
else {
  ratingThreshold = process.argv[2];
  analysisDir = process.argv[3];
}

grabFiles(analysisDir);

function grabFiles(directory){
  fs.readdir(directory, function (err, list) {
    evaluateHARSet(list);
  });
}

function evaluateHar(jsonOutput, filename){
  var harRating = jsonOutput.o;
  if (harRating < ratingThreshold){
    console.log("HAR file below score threshold!!: " + filename + "\nCategories below score threshold:");
    var scoreBreakdown = jsonOutput.g
    Object.keys(scoreBreakdown).forEach(function(currentVal, index, arr){
      var individualScore = scoreBreakdown[currentVal].score;
      if (individualScore != undefined) {
        if(individualScore < ratingThreshold){
          console.log(currentVal);
          console.log("More information can be found here:\n" + "https://github.com/checkmyws/yslow-rules/blob/master/content/en/" + currentVal + ".md");
        }
      }
    });
    console.log("\n");
  }
}

function evaluateHARSet(filesList){
  //strip all non harfiles from the list
  var filteredList = filesList.filter(function(ele){
    return (path.extname(ele) === '.har');
  });

  async.map(filteredList, getYslowResponse, function (err, yslowResultsJSON) {
  	var totalScore = 0;
    yslowResultsJSON.forEach(function(responseJSON){
      if(responseJSON != -1){
        totalScore += responseJSON.o;
      }
    });
    console.log("Total HAR set score: " + totalScore);
    console.log("average HAR score: " + totalScore / yslowResultsJSON.length);
  });
}

var getYslowResponse = function (filename, doneCallback){
  fs.readFile(filename, function (err, data) {
    var har = JSON.parse(data);
    try{
      var res = YSLOW.harImporter.run(doc, har, 'ydefault');
      var content =  YSLOW.util.getResults(res.context, 'all');
      evaluateHar(content,filename);
      return doneCallback(null, content);
    }
    catch(TypeError){
      console.log("Bad Harfile: " + filename);
      return doneCallback(null, -1);
    }
  });
}