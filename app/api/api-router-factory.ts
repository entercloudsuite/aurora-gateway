import express = require('express');
import { Router } from 'express';
import { Logger, LoggerFactory, InvalidResourceUrlError, Service } from '../common';
import { GatewayRouter } from './routes';
import { GatewayService } from '../services';

export class ApiRouterFactory {

  private static LOGGER: Logger = LoggerFactory.getLogger();

  private constructor() {}

  /**
   * Returns default router middleware for the gateway.
   * By default the gateway does not expose any specific route.
   * 
   * @static
   * @returns {Router} 
   * 
   * @memberOf ApiRouterFactory
   */
  static getApiRouter(): Router {
    const apiRouter: Router = express.Router({ mergeParams: true });

    ApiRouterFactory.LOGGER.info('Mounting routes');
    apiRouter.get('/', (req, res) => {
      res.json({ 'Aurora-Gateway': 'Test Request'});
    });
    apiRouter.all('*', (req, res, next) => {
      next(new InvalidResourceUrlError());
    });

    return apiRouter;
  }
  
  /**
   * Creates a new router for a route specified by the Service Manager.
   * 
   * @static
   * @param {} newService
   * @returns {Router} 
   * 
   * @memberOf ApiRouterFactory
   */
  static registerNewAPI(newService: Service): Router {
    const apiRouter: Router = express.Router({ mergeParams: true });
    
    ApiRouterFactory.LOGGER.info(`Registering new route with ${JSON.stringify(newService)}`);
    const gatewayService = new GatewayService(newService);
    const gatewayRouter: Router  = new GatewayRouter(gatewayService).router;
    

    apiRouter.use('/', gatewayRouter);
    return apiRouter;
  }
}
