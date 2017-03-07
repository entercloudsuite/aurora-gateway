import { RestRouter } from '../../../common';
import { GatewayController } from './gateway-controller';
import { GatewayService } from '../../../services';
import { Logger, LoggerFactory } from '../../../common';

export class GatewayRouter extends RestRouter {
  gatewayController: GatewayController;

  private static LOGGER: Logger = LoggerFactory.getLogger();

  constructor(gatewayService: GatewayService) {
    super();
    this.gatewayController = new GatewayController(gatewayService);
    this.initRoutes(gatewayService.serviceName);
  }

  /**
   * Intializes all the routes on a specific path with a forwarding method.
   * Adds separate method for authentication.
   * 
   * @todo Change method used check for authentication. Set CORE Service to provide more info on registering.
   * @todo Add method for logout/destroy token
   * @todo Add middleware for paths that require authentication
   * @param {string} serviceName 
   * 
   * @memberOf GatewayRouter
   */
  initRoutes(serviceName: string) {
    if (serviceName === 'CORE') {
      GatewayRouter.LOGGER.debug('Authentication route attached');
      this.router.post('/identity/tokens', this.wrapRouteFn(this.gatewayController, this.gatewayController.authenticate));
    }

    this.router.all('/*', this.wrapRouteFn(this.gatewayController, this.gatewayController.forwardRequest));
  }
}
