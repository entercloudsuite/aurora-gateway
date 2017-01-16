import express = require('express');
import { Router } from 'express';
import { IdentityRouter } from './routes/identity/identity-router';
import { NovaRouter } from './routes/nova/nova-router';
import { NeutronRouter } from './routes/neutron/neutron-router';
import { CinderRouter } from './routes/cinder/cinder-router';
import { GlanceRouter } from './routes/glance/glance-router';
import { Logger, LoggerFactory, InvalidResourceUrlError } from '../common';
import { OpenstackService, IdentityService } from '../services';

export class ApiRouterFactory {

  private static LOGGER: Logger = LoggerFactory.getLogger();

  private constructor() {}

  static getApiRouter(openstackService: OpenstackService): Router {
    const apiRouter: Router = express.Router({ mergeParams: true });
    const identityService = new IdentityService(openstackService.authUrl, openstackService.apiVersion);
    const identityRouter: Router = new IdentityRouter(identityService, openstackService).router;
    const novaRouter: Router = new NovaRouter(openstackService).router;
    const neutronRouter: Router = new NeutronRouter(openstackService).router;
    const cinderRouter: Router = new CinderRouter(openstackService).router;
    const glanceRouter: Router = new GlanceRouter(openstackService).router;

    ApiRouterFactory.LOGGER.info('Mounting routes');
    apiRouter.use('/identity', identityRouter);
    apiRouter.use('/nova', novaRouter);
    apiRouter.use('/cinder', cinderRouter);
    apiRouter.use('/neutron', neutronRouter);
    apiRouter.use('/glance', glanceRouter);
    
    apiRouter.all('*', (req, res, next) => {
      next(new InvalidResourceUrlError());
    });

    return apiRouter;
  }
}
