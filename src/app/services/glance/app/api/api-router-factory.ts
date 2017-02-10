import express = require('express');
import { Router } from 'express';
import { Logger, LoggerFactory, InvalidResourceUrlError } from '../common';
import { GlanceService } from '../services';
import { GlanceRouter } from './routes';

export class ApiRouterFactory {

  private static LOGGER: Logger = LoggerFactory.getLogger();

  private constructor() {}

  static getApiRouter(): Router {
    const apiRouter: Router = express.Router({ mergeParams: true });

    const glanceService = new GlanceService();
    
    const glanceRouter: Router = new GlanceRouter(glanceService).router;

    ApiRouterFactory.LOGGER.info('Mounting routes');
    apiRouter.use('/', glanceRouter);
    apiRouter.all('*', (req, res, next) => {
      next(new InvalidResourceUrlError());
    });

    return apiRouter;
  }
}
