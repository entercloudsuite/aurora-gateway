import { Logger, LoggerFactory, RestController } from '../../common';
import { ServiceManager } from '../../services';
import { Utils } from '../../utils';

export class ServiceManagerController extends RestController {
  constructor(private serviceManager: ServiceManager) {
    super();
  }

  private static LOGGER: Logger = LoggerFactory.getLogger();

  registerService(req, res, next): Promise<any> {
    return Utils.getIPAddress(req)
      .then(ipAddress => {
        let options = req.body;
        options['host'] = ipAddress;
        return this.serviceManager.registerService(options);
      })
      .then(serviceId => {
        return this.respond(res, serviceId);
      });
  }

  listRegisteredServices(req, res) {
    return this.respond(res, this.serviceManager.serviceTable);
  }
  
  listAvailableService(req, res): Promise<any> {
    return this.serviceManager.getAvailableService(req.headers['service-name'])
      .then(serviceDetails => {
        return this.respond(res, serviceDetails);
      });
  }
}
