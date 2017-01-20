import 'core-js/library';

import { Logger, LoggerFactory } from './common';
import { Express, Router } from 'express';
import { AppConfig } from './config';
import { OpenstackService } from './services';
import { ExpressAppFactory } from './express-app-factory';
import { ApiRouterFactory } from './api';
import { RestErrorMiddleware } from './common';
import events = require('events');
import util = require('util');

const LOGGER: Logger = LoggerFactory.getLogger();

const appConfig: AppConfig = new AppConfig(process.env);

const openstackService: OpenstackService = new OpenstackService(
  {
    host: appConfig.keystone_api_host,
    port: appConfig.keystone_api_port,
    path: appConfig.keystone_api_path,
    version: appConfig.keystone_api_version
  });
const apiRouter: Router = ApiRouterFactory.getApiRouter(openstackService);

// Get the application middleware (to be mounted after the api router)
const errorMiddleware = [
  RestErrorMiddleware.normalizeToRestError,
  RestErrorMiddleware.serializeRestError
];

const app: Express = ExpressAppFactory.getExpressApp(appConfig, apiRouter, null, errorMiddleware);

////////////////////

app.listen(appConfig.port, () => {
  LOGGER.info(`Express server listening on port ${appConfig.port}.`);
});
