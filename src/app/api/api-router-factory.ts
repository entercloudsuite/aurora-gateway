import express = require('express');
import { Router } from 'express';
import { 
  SwiftRouter, IdentityRouter, NovaRouter, PluginRouter, 
  NeutronRouter, GlanceRouter, CinderRouter, MonitoringRouter 
} from './routes';
import { Logger, LoggerFactory, InvalidResourceUrlError } from '../common';
import {
  NovaService, NeutronService, CinderService, GlanceService, SwiftService,
  OpenstackService, IdentityService, PluginManager, MonitoringService
} from '../services';
import { EventEmitter } from '../common';
import { RouterUtils } from '../utils';

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
    const novaService = new NovaService();
    const neutronService = new NeutronService();
    const glanceService = new GlanceService();
    const cinderService = new CinderService();
    const swiftService = new SwiftService();

    EventEmitter.serviceInstances = {
      nova: novaService,
      neutron: neutronService,
      glance: glanceService,
      cinder: cinderService,
      keystone: identityService,
      monitoring: monitoringService,
      swift: swiftService
    };

    const identityRouter: Router = new IdentityRouter(identityService).router;
    const novaRouter: Router = new NovaRouter(novaService).router;
    const neutronRouter: Router = new NeutronRouter(neutronService).router;
    const cinderRouter: Router = new CinderRouter(cinderService).router;
    const glanceRouter: Router = new GlanceRouter(glanceService).router;
    const swiftRouter: Router = new SwiftRouter(swiftService).router;
    const pluginRouter: Router = new PluginRouter(pluginManager).router;
    const monitoringRouter: Router = new MonitoringRouter(monitoringService).router;
    
    ApiRouterFactory.LOGGER.info('Mounting routes');
    apiRouter.use('/identity', identityRouter);
    apiRouter.use('/nova', RouterUtils.isAuthenticated, novaRouter);
    apiRouter.use('/cinder', RouterUtils.isAuthenticated, cinderRouter);
    apiRouter.use('/neutron', RouterUtils.isAuthenticated, neutronRouter);
    apiRouter.use('/glance', RouterUtils.isAuthenticated, glanceRouter);
    apiRouter.use('/plugins', RouterUtils.isAuthenticated, pluginRouter);
    apiRouter.use('/swift', RouterUtils.isAuthenticated, swiftRouter);
    apiRouter.use('/ceilometer', RouterUtils.isAuthenticated, monitoringRouter);
    apiRouter.all('*', (req, res, next) => {
      next(new InvalidResourceUrlError());
    });

    return apiRouter;
  }
}
