import { RestRouter } from '../../../common';
import { GlanceController } from './glance-controller';
import { OpenstackService } from '../../../services';
import { RouterUtils } from '../../../utils';

export class GlanceRouter extends RestRouter {
  glanceController: GlanceController;

  constructor(openstackService: OpenstackService) {
    super();
    this.glanceController = new GlanceController(openstackService);
    this.initRoutes();
  }

  initRoutes() {
    this.router.all(
      '/*', RouterUtils.checkEndpointID, 
      this.wrapRouteFn(this.glanceController, this.glanceController.proxyRequest));
  }
}
