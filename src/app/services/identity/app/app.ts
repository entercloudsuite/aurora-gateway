import 'core-js/library';
import { Logger, LoggerFactory, RestErrorMiddleware } from './common';
import { Express, Router } from 'express';
import { ExpressAppFactory } from './express-app-factory';
import { ApiRouterFactory } from './api';
import http = require('http');
import util = require('util');
import { EventEmitter } from './common';

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
LOGGER.info('Registering service')
const requestOptions = {
  protocol: 'http:',
  host: process.env.REGISTRY_IP,
  port: process.env.REGISTRY_PORT,
  path: '/register',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
};
const requestBody = JSON.stringify({
  name: 'OS-IDENTITY',
  port: process.env.PORT,
  status: 'READY',
  routingPath: '/identity',
  apiPath: '/api',
});

let responseBody = '';
const registerRequest = http.request(requestOptions, (res) => {
  res.setEncoding('utf8');
  res.on('data', chunk => {
    responseBody += chunk;
  });

  res.on('end', () => {
    LOGGER.debug(`Response from service manager - ${responseBody}`);
    EventEmitter.eventEmitter.emit(EventEmitter.UPDATE_SERVICE_ID, JSON.parse(responseBody).data);
  });
});

registerRequest.write(requestBody);
registerRequest.on('error', (requestError) => {
  LOGGER.error(`Unable to register service - ${JSON.stringify(requestError)}}`);
});
registerRequest.end();


app.listen(parseInt(process.env.PORT), () => {
  LOGGER.info(`Express server listening on port ${process.env.PORT}.`);
});
