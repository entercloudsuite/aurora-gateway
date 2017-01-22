import express = require('express');
import { Router } from 'express';
import { IdentityRouter, NovaRouter, PluginRouter, NeutronRouter, GlanceRouter, CinderRouter } from './routes';
import { Logger, LoggerFactory, InvalidResourceUrlError } from '../common';
import { OpenstackService, IdentityService, PluginManager, MonitoringService } from '../services';
import { OpenstackUtils } from '../utils';

export class ApiRouterFactory {

  private static LOGGER: Logger = LoggerFactory.getLogger();

  private constructor() {}

  static getApiRouter(openstackService: OpenstackService): Router {
    const apiRouter: Router = express.Router({ mergeParams: true });

    const identityService = new IdentityService(
      openstackService.keystoneApiHost, openstackService.keystoneApiPort, 
      openstackService.keystoneApiPath, openstackService.keystoneApiVersion
    );
    const pluginManager = new PluginManager();
    const monitoringService = new MonitoringService();
    MonitoringService.registerEvents(monitoringService);

    const identityRouter: Router = new IdentityRouter(identityService, openstackService).router;
    const novaRouter: Router = new NovaRouter(openstackService).router;
    const neutronRouter: Router = new NeutronRouter(openstackService).router;
    const cinderRouter: Router = new CinderRouter(openstackService).router;
    const glanceRouter: Router = new GlanceRouter(openstackService).router;
    const pluginRouter: Router = new PluginRouter(pluginManager).router;
    
    ApiRouterFactory.LOGGER.info('Mounting routes');
    apiRouter.use('/identity', identityRouter);
    apiRouter.use('/nova', OpenstackUtils.isAuthenticated, novaRouter);
    apiRouter.use('/cinder', OpenstackUtils.isAuthenticated, cinderRouter);
    apiRouter.use('/neutron', OpenstackUtils.isAuthenticated, neutronRouter);
    apiRouter.use('/glance', OpenstackUtils.isAuthenticated, glanceRouter);
    apiRouter.use('/plugins', OpenstackUtils.isAuthenticated, pluginRouter);
    
    apiRouter.all('*', (req, res, next) => {
      next(new InvalidResourceUrlError());
    });

    return apiRouter;
  }
}
