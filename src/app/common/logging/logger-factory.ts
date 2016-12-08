import winston = require('winston');
import { LoggerInstance } from 'winston';

export class LoggerFactory {
    private static logger: LoggerInstance;

    private constructor() {}

    static getLogger(): LoggerInstance {
        if (!LoggerFactory.logger) {
            const logLevel = process.env['LOG_LEVEL'];

            LoggerFactory.logger = new winston.Logger({
                transports: [
                    new (winston.transports.Console)({
                        level: logLevel,
                        handleExceptions: true,
                        humanReadableException: true,
                        timestamp: true,
                        colorize: true
                    })
                ]
            });
        }

        return LoggerFactory.logger;
    }
}

export { LoggerInstance as Logger };