/*
Business logic to perform Yslow analysis on harfiles and sets
of harfiles for interesting reports and analysis
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
var path = require('path');

function grabFiles(analysisDir) {
    fs.readdir(analysisDir, function (err, list) {
        async.map(list, function (file, cb) {
            return cb(null, commandLineArgs.analysisDir + file);
        }, function (err, absPathList) {
            evaluateHARSet(absPathList);
        });
    });
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

/**
 * Get all files and directories listed in the 'harfiles' dir
 * For user to select which files they would like to see reports for.
 *
 * @cb - callback function to process the returned list of files.
 */
function getHarfiles(cb){
    var appDir = path.dirname(require.main.filename);
    var harDir = appDir + '/harfiles';
    var walk = function(dir, done) {
        var results = [];
        fs.readdir(dir, function(err, list) {
            if (err) return done(err);
            var pending = list.length;
            if (!pending) return done(null, results);
            list.forEach(function(file) {
                file = dir + '/' + file;
                fs.stat(file, function(err, stat) {
                    if (stat && stat.isDirectory()) {
                        walk(file, function(err, res) {
                            results = results.concat(res);
                            if (!--pending) done(null, results);
                        });
                    } else {
                        results.push(file);
                        if (!--pending) done(null, results);
                    }
                });
            });
        });
    };
    /*Strip the application directory up to and including the /harfiles dir from each file.*/
    return walk(harDir,function(err, data){
        if(err){throw err;}

        async.map(data, function (fileName, cb) {
            return cb(null, fileName.slice(appDir.length + '/harfiles/'.length));
        }, function (err, refinedPathList) {
            if(err){throw err;}
            cb(refinedPathList);
        });
    });
}

module.exports = {
    grabFiles : grabFiles,
    evaluateHARSet : evaluateHARSet,
    evaluateHar : evaluateHar,
    getHarfiles : getHarfiles
}