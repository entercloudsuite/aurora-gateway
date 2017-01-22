import { RestRouter } from '../../../common';
import { NovaController } from './nova-controller';
import { OpenstackService } from '../../../services';
import { RouterUtils } from '../../../utils';

export class NovaRouter extends RestRouter {
  novaController: NovaController;

  constructor(openstackService: OpenstackService) {
    super();
    this.novaController = new NovaController(openstackService);
    this.initRoutes();
  }

  initRoutes() {
    this.router.all(
      '/*', RouterUtils.checkEndpointID, RouterUtils.checkTenantID,
      this.wrapRouteFn(this.novaController, this.novaController.proxyRequest)
    );
  }
}
