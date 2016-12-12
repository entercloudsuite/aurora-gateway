import express = require('express');
import { Router } from 'express';
import { IdentityRouter } from './routes/identity/identity-router';
import { Logger, LoggerFactory, InvalidResourceUrlError, RestController } from '../common';
import { OpenstackService, IdentityService } from '../openstack';

export class ApiRouterFactory {

  private static readonly LOGGER: Logger = LoggerFactory.getLogger();

  private constructor() {}

  static getApiRouter(openstackService: OpenstackService): Router {
    const apiRouter: Router = express.Router({ mergeParams: true });
    const identityService = new IdentityService(openstackService.authUrl);
    const restController: RestController = new RestController();
    const identityRouter: Router = new IdentityRouter(identityService, openstackService).router;

    ApiRouterFactory.LOGGER.info('Mounting routes');
    apiRouter.use('/identity', identityRouter);

    apiRouter.all('*', (req, res, next) => {
      next(new InvalidResourceUrlError());
    });

    return apiRouter;
  }
}
