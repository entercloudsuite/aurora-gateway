import express = require('express');
import { Router } from 'express';
import { Logger, LoggerFactory, InvalidResourceUrlError, EventEmitter } from '../common';
import { OpenstackService, IdentityService, NovaService, CinderService, GlanceService, NeutronService, SwiftService } from '../services';
import { IdentityRouter, SwiftRouter, GlanceRouter, NovaRouter, NeutronRouter, CinderRouter } from './routes';

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

    const novaService = new NovaService();
    const neutronService = new NeutronService();
    const glanceService = new GlanceService();
    const cinderService = new CinderService();
    const swiftService = new SwiftService();
    
    EventEmitter.serviceInstances = {
      nova: novaService,
      neutron: neutronService,
      keystone: identityService,
      glance: glanceService,
      cinder: cinderService,
      swift: swiftService
    };
    
    identityService.registerMessageHandlers();
    novaService.registerMessageHandlers();
    neutronService.registerMessageHandlers();
    cinderService.registerMessageHandlers();
    swiftService.registerMessageHandlers();
    glanceService.registerMessageHandlers();

    const identityRouter: Router = new IdentityRouter(identityService).router;
    const novaRouter: Router = new NovaRouter(novaService).router;
    const neutronRouter: Router = new NeutronRouter(neutronService).router;
    const cinderRouter: Router = new CinderRouter(cinderService).router;
    const glanceRouter: Router = new GlanceRouter(glanceService).router;
    const swiftRouter: Router = new SwiftRouter(swiftService).router;

    ApiRouterFactory.LOGGER.info('Mounting routes');
    apiRouter.use('/identity', identityRouter);
    apiRouter.use('/nova', novaRouter);
    apiRouter.use('/cinder', cinderRouter);
    apiRouter.use('/neutron', neutronRouter);
    apiRouter.use('/glance', glanceRouter);
    apiRouter.use('/swift', swiftRouter);
    apiRouter.all('*', (req, res, next) => {
      next(new InvalidResourceUrlError());
    });

    return apiRouter;
  }
}
