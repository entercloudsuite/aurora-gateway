import express = require('express');
import { Router } from 'express';
import { Logger, LoggerFactory, InvalidResourceUrlError } from '../common';
import { CinderService } from '../services';
import { CinderRouter } from './routes';

export class ApiRouterFactory {

  private static LOGGER: Logger = LoggerFactory.getLogger();

  private constructor() {}

  static getApiRouter(): Router {
    const apiRouter: Router = express.Router({ mergeParams: true });

    const cinderService = new CinderService();
    
    const cinderRouter: Router = new CinderRouter(cinderService).router;

    ApiRouterFactory.LOGGER.info('Mounting routes');
    apiRouter.use('/', cinderRouter);
    apiRouter.all('*', (req, res, next) => {
      next(new InvalidResourceUrlError());
    });

    return apiRouter;
  }
}
