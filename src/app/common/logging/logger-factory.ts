import winston = require('winston');
require('winston-logstash');
require('winston-daily-rotate-file');
import fs = require('fs');
import { LoggerInstance } from 'winston';

export class LoggerFactory {
    private static logger: LoggerInstance;

    private static customColors = {
        trace: 'white',
        debug: 'grey',
        info: 'green',
        warn: 'yellow',
        crit: 'red',
        fatal: 'red'
    };
    private constructor() {}

    static getLogger(): LoggerInstance {
        if (!fs.existsSync('./logs')) {
            fs.mkdir('./logs');
        }
        
        if (!LoggerFactory.logger) {
            const logLevel = process.env['LOG_LEVEL'];

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
                    new (winston.transports.File) ({
                        filename: 'logs/aurora.log',
                        json: true,
                        maxSize: 1000,
                        maxFiles: 5,
                        level: logLevel
                    }),
                    new (winston.transports.Logstash) ({
                        port: 4560,
                        level: logLevel,
                        node_name: 'aurora',
                        host: '10.7.12.10'
                    })
                ]
            });
        }

        LoggerFactory.logger.stream = {
            write: message => {
                LoggerFactory.logger.info(message);
            }
        };

        winston.addColors(LoggerFactory.customColors);
        return LoggerFactory.logger;
    }
}

export { LoggerInstance as Logger };