import express = require('express');
import { Router } from 'express';
import { IdentityRouter } from './routes/identity/identity-router';
import { Logger, LoggerFactory, InvalidResourceUrlError } from '../common';
import { OpenstackService, IdentityService } from '../openstack';

export class ApiRouterFactory {

  private static LOGGER: Logger = LoggerFactory.getLogger();

  private constructor() {}

  static getApiRouter(openstackService: OpenstackService): Router {
    const apiRouter: Router = express.Router({ mergeParams: true });
    const identityService = new IdentityService(openstackService.authUrl, openstackService.apiVersion);
    const identityRouter: Router = new IdentityRouter(identityService).router;

    ApiRouterFactory.LOGGER.info('Mounting routes');
    apiRouter.use('/identity', identityRouter);

    apiRouter.all('*', (req, res, next) => {
      next(new InvalidResourceUrlError());
    });

    return apiRouter;
  }
}
