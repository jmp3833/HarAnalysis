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

/**
 * Return the result JSON of a full Yslow analysis of all
 * HTTP archive files on a given root directory.
 *
 * @param rootDir - the directory where HarFiles will be recursively searched for
 * @param callback - callback to pass data and errors to the API route layer for handling.
 */
function processAllHarfiles(rootDir, callback){
    getHarfiles(rootDir, function(err, data) {
        //Throw any filesystem errors here.
        if(err){throw err}
        var harList = data;

        //perform yslow analysis on the list of files
        evaluateHARSet(harList, function(err,data){
            callback(err, data);
        });
    })
}

/**
 * Get all files and directories listed in the specified dir
 * For user to select which files they would like to see reports for.
 *
 * @param dir - root directory to search for files
 * @param cb - callback function to process the returned list of files.
 */
function getHarfiles(dir, cb){
    //In case of incorrect or no query parameters.
    if(dir == undefined){dir = './harfiles'}

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
    return walk(dir, function(err, data){
        cb(err, data);
    });
}

/**
 * Iterate over list of files and filter out all files without .har extension
 * Then request full Yslow reports for each file and return an
 * array of results for each HAR file.
 * @param filesList - list of files to evaluate.
 * @param cb - callback function to return data on successful operation
 * return @resultsHash - hashmap with Harfile name as key, and results JSON as value.
 */
function evaluateHARSet(filesList, cb){
    //strip all non harfiles from the list
    var filteredList = filesList.filter(function(ele){
        return (path.extname(ele) === '.har');
    });

    //Gather response from analysis on each file
    async.map(filteredList, getYslowResponse, function (err, yslowResultsJSON) {
        var resultsHash = {};
        for(var i = 0; i < filesList.length; i++){
            resultsHash[filesList[i]] = yslowResultsJSON[i];
        }
        return cb(err, resultsHash);
    });
}

var getYslowResponse = function (filename, doneCallback){
    fs.readFile(filename, function (err, data){
        var har = JSON.parse(data);
        try{
            var res = YSLOW.harImporter.run(doc, har, 'ydefault');
            var content =  YSLOW.util.getResults(res.context, 'all');
            evaluateHar(content,filename);
        }
        catch(TypeError){
            console.log("Bad Harfile: " + filename);
            return doneCallback(null, -1);
        }

        return doneCallback(null, content);
    });
}

function evaluateHar(jsonOutput, filename){
    //TODO Allow threshold to be specified in API call.
    var ratingThreshold = 70;
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

module.exports = {
    evaluateHARSet : evaluateHARSet,
    evaluateHar : evaluateHar,
    getHarfiles : getHarfiles,
    processAllHarfiles : processAllHarfiles
}