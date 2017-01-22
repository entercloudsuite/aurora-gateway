import { RestRouter } from '../../../common';
import { CinderController } from './cinder-controller';
import { OpenstackService } from '../../../services';
import { RouterUtils } from '../../../utils';

export class CinderRouter extends RestRouter {
  cinderController: CinderController;

  constructor(openstackService: OpenstackService) {
    super();
    this.cinderController = new CinderController(openstackService);
    this.initRoutes();
  }

  initRoutes() {
    this.router.all(
      '/*', RouterUtils.checkEndpointID, RouterUtils.checkTenantID,
      this.wrapRouteFn(this.cinderController, this.cinderController.proxyRequest));
  }
}
