import express = require('express');
import { Router } from 'express';
import { Logger, LoggerFactory, InvalidResourceUrlError } from '../common';
import { SwiftService } from '../services';
import { SwiftRouter } from './routes';

export class ApiRouterFactory {

  private static LOGGER: Logger = LoggerFactory.getLogger();

  private constructor() {}

  static getApiRouter(): Router {
    const apiRouter: Router = express.Router({ mergeParams: true });

    const swiftService = new SwiftService();
    
    const swiftRouter: Router = new SwiftRouter(swiftService).router;

    ApiRouterFactory.LOGGER.info('Mounting routes');
    apiRouter.use('/', swiftRouter);
    apiRouter.all('*', (req, res, next) => {
      next(new InvalidResourceUrlError());
    });

    return apiRouter;
  }
}
