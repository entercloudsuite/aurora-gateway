import 'core-js/library';

import { Logger, LoggerFactory } from './common';
import { Express, Router } from 'express';
import { OpenstackService } from './services';
import { ExpressAppFactory } from './express-app-factory';
import { ApiRouterFactory } from './api';
import { RestErrorMiddleware } from './common';
import util = require('util');

require('dotenv').config();

const LOGGER: Logger = LoggerFactory.getLogger();

const openstackService: OpenstackService = new OpenstackService(
  {
    host: process.env.KEYSTONE_API_HOST,
    port: process.env.KEYSTONE_API_PORT,
    path: process.env.KEYSTONE_API_PATH,
    version: process.env.KEYSTONE_API_VERSION
  });
const apiRouter: Router = ApiRouterFactory.getApiRouter(openstackService);

// Get the application middleware (to be mounted after the api router)
const errorMiddleware = [
  RestErrorMiddleware.normalizeToRestError,
  RestErrorMiddleware.serializeRestError
];

const app: Express = ExpressAppFactory.getExpressApp(apiRouter, null, errorMiddleware);

////////////////////

app.listen(parseInt(process.env.PORT), () => {
  LOGGER.info(`Express server listening on port ${process.env.PORT}.`);
});
