import 'core-js/library';
import { Logger, LoggerFactory, RestErrorMiddleware } from './common';
import { Express, Router } from 'express';
import { ExpressAppFactory } from './express-app-factory';
import { ApiRouterFactory } from './api';
import http = require('http');
import util = require('util');
import { APP_CONFIG } from './config';
import { EventEmitter } from './common';
import { ServiceUtils } from './utils';

require('dotenv').config();

const LOGGER: Logger = LoggerFactory.getLogger();
const apiRouter: Router = ApiRouterFactory.getApiRouter();

// Get the application middleware (to be mounted after the api router)
const errorMiddleware = [
  RestErrorMiddleware.normalizeToRestError,
  RestErrorMiddleware.serializeRestError
];

const app: Express = ExpressAppFactory.getExpressApp(apiRouter, null, errorMiddleware);

// Register new instantiated service
ServiceUtils.registerService();

app.listen(APP_CONFIG.port, () => {
  LOGGER.info(`Express server listening on port ${APP_CONFIG.port}.`);
});
