"use strict";
var winston = require('winston');
var fs = require('fs');
var LoggerFactory = (function () {
    function LoggerFactory() {
    }
    LoggerFactory.getLogger = function () {
        if (!fs.existsSync('./logs')) {
            fs.mkdir('./logs');
        }
        var loggerOptions = {
            write: function (message) {
                LoggerFactory.logger.info(message);
            }
        };
        if (!LoggerFactory.logger) {
            var logLevel = process.env.LOG_LEVEL;
            LoggerFactory.logger = new winston.Logger({
                colors: LoggerFactory.customColors,
                transports: [
                    new (winston.transports.Console)({
                        level: logLevel,
                        json: false,
                        handleExceptions: true,
                        humanReadableException: true,
                        timestamp: true,
                        colorize: true
                    }),
                    new (winston.transports.File)({
                        filename: 'logs/aurora.log',
                        json: true,
                        maxSize: 1000,
                        maxFiles: 5,
                        level: logLevel
                    })
                ]
            });
        }
        LoggerFactory.logger.stream = loggerOptions;
        winston.addColors(LoggerFactory.customColors);
        return LoggerFactory.logger;
    };
    LoggerFactory.customColors = {
        trace: 'white',
        debug: 'grey',
        info: 'green',
        warn: 'yellow',
        crit: 'red',
        fatal: 'red'
    };
    return LoggerFactory;
}());
exports.LoggerFactory = LoggerFactory;
//# sourceMappingURL=logger-factory.js.map