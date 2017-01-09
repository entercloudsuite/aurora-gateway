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
            const logstashHost = process.env['LOGSTASH_HOST'];
            const logstashPort = process.env['LOGSTASH_PORT'];
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
                        port: logstashPort,
                        level: logLevel,
                        node_name: 'aurora',
                        host: logstashHost
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