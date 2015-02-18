/**
 * Define logger module (maybe to export to Splunk later on)
 * to run in addition with other perf tests
 */

'use strict';

var bunyan = require('bunyan');

var logger = bunyan.createLogger(
    {
        name: 'har-analyzer',
        streams: [
            {
                level: 'INFO',
                path:'./logs/harAnalysis.log'

            }]
    });

module.exports.getLogger = function (component) {
    return logger;
};
