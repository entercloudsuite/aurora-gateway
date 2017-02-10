import express = require('express');
import { Router } from 'express';
import { Logger, LoggerFactory, InvalidResourceUrlError } from '../common';
import { IdentityService } from '../services';
import { IdentityRouter } from './routes';

export class ApiRouterFactory {

  private static LOGGER: Logger = LoggerFactory.getLogger();

  private constructor() {}

  static getApiRouter(): Router {
    const apiRouter: Router = express.Router({ mergeParams: true });

    const identityService = new IdentityService(
      process.env.KEYSTONE_API_HOST,
      process.env.KEYSTONE_API_PORT,
      process.env.KEYSTONE_API_PATH,
      process.env.KEYSTONE_API_VERSION
    );
    
    const identityRouter: Router = new IdentityRouter(identityService).router;

    ApiRouterFactory.LOGGER.info('Mounting routes');
    apiRouter.use('/', identityRouter);
    apiRouter.all('*', (req, res, next) => {
      next(new InvalidResourceUrlError());
    });

    return apiRouter;
  }
}
