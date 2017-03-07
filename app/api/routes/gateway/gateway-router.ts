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

  initRoutes(serviceName) {
    if (serviceName === 'CORE') {
      GatewayRouter.LOGGER.debug('Authentication route attached');
      this.router.post('/identity/tokens', this.wrapRouteFn(this.gatewayController, this.gatewayController.authenticate));
    }

    this.router.all('/*', this.wrapRouteFn(this.gatewayController, this.gatewayController.forwardRequest));
  }
}
