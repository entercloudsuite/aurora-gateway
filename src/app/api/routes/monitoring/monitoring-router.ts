import { RestRouter } from '../../../common';
import { MonitoringController } from './monitoring-controller';
import { MonitoringService } from '../../../services';
import { RouterUtils } from '../../../utils';

export class MonitoringRouter extends RestRouter {
  monitoringController: MonitoringController;

  constructor(monitoringService: MonitoringService) {
    super();
    this.monitoringController = new MonitoringController(monitoringService);
    this.initRoutes();
  }

  initRoutes() {
    this.router.all(
      '/*', RouterUtils.checkEndpointID,
      this.wrapRouteFn(this.monitoringController, this.monitoringController.proxyRequest)
    );
  }
}
