import express = require('express');
import { Router } from 'express';
import { Logger, LoggerFactory, InvalidResourceUrlError } from '../common';
import { GatewayRouter } from './routes';
import { GatewayService } from '../services';

export class ApiRouterFactory {

  private static LOGGER: Logger = LoggerFactory.getLogger();

  private constructor() {}

  static getApiRouter(): Router {
    const apiRouter: Router = express.Router({ mergeParams: true });

    ApiRouterFactory.LOGGER.info('Mounting routes');
    apiRouter.get('/', (req, res) => {
      res.json({ 'Aurora-Gateway': 'Test Request');
    });
    apiRouter.all('*', (req, res, next) => {
      next(new InvalidResourceUrlError());
    });

    return apiRouter;
  }
  
  static registerNewAPI(newAPIPath: string, serviceName: string): Router {
    const apiRouter: Router = express.Router({ mergeParams: true });
    
    const gatewayService = new GatewayService(serviceName);
    const gatewayRouter: Router  = new GatewayRouter(gatewayService).router;
    
    ApiRouterFactory.LOGGER.info(`Registering new route on ${newAPIPath} for ${serviceName}`);

    apiRouter.use('/', gatewayRouter);
    return apiRouter;
  }
}
