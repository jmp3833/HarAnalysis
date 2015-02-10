/*
* HarProcessor.js
*/

"use strict";

var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');
var YSLOW = require('yslow').YSLOW;
var doc = require('jsdom').jsdom();
var async = require('async');
var commandLineArgs = require('../app');

function grabFiles(){
  fs.readdir(commandLineArgs.analysisDir, function (err, list) {
    evaluateHARSet(list);
  });
}

function evaluateHar(jsonOutput, filename){
  var harRating = jsonOutput.o;
  if (harRating < commandLineArgs.ratingThreshold){
    console.log("HAR file below score threshold!!: " + filename + "\nCategories below score threshold:");
    var scoreBreakdown = jsonOutput.g
    Object.keys(scoreBreakdown).forEach(function(currentVal, index, arr){
      var individualScore = scoreBreakdown[currentVal].score;
      if (individualScore != undefined) {
        if(individualScore < commandLineArgs.ratingThreshold){
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
  fs.readFile(filename, function (err, data){
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

module.exports = {
   grabFiles: grabFiles,
   evaluateHARSet : evaluateHARSet,
   evaluateHar : evaluateHar
}