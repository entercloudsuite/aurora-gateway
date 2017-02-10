import express = require('express');
import { Router } from 'express';
import { Logger, LoggerFactory, InvalidResourceUrlError } from '../common';
import { NovaService } from '../services';
import { NovaRouter } from './routes';

export class ApiRouterFactory {

  private static LOGGER: Logger = LoggerFactory.getLogger();

  private constructor() {}

  static getApiRouter(): Router {
    const apiRouter: Router = express.Router({ mergeParams: true });

    const novaService = new NovaService();
    
    const novaRouter: Router = new NovaRouter(novaService).router;

    ApiRouterFactory.LOGGER.info('Mounting routes');
    apiRouter.use('/', novaRouter);
    apiRouter.all('*', (req, res, next) => {
      next(new InvalidResourceUrlError());
    });

    return apiRouter;
  }
}
