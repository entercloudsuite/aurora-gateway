import express = require('express');
import { Router } from 'express';
import { Logger, LoggerFactory, InvalidResourceUrlError } from '../common';
import { NeutronService } from '../services';
import { NeutronRouter } from './routes';

export class ApiRouterFactory {

  private static LOGGER: Logger = LoggerFactory.getLogger();

  private constructor() {}

  static getApiRouter(): Router {
    const apiRouter: Router = express.Router({ mergeParams: true });

    const neutronService = new NeutronService();
    
    const neutronRouter: Router = new NeutronRouter(neutronService).router;

    ApiRouterFactory.LOGGER.info('Mounting routes');
    apiRouter.use('/', neutronRouter);
    apiRouter.all('*', (req, res, next) => {
      next(new InvalidResourceUrlError());
    });

    return apiRouter;
  }
}
