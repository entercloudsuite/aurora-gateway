import { Logger, LoggerFactory, RestController } from '../../../common';
import { MonitoringService } from '../../../services';

export class MonitoringController extends RestController {
  constructor(private monitoringService: MonitoringService) {
    super();
  }

  private static LOGGER: Logger = LoggerFactory.getLogger();

  proxyRequest(req, res): Promise<any> {
    return this.monitoringService.checkEndpointId(req.headers['endpoint-id'])
      .then(() => {
        return this.monitoringService.callServiceApi(req);
      })
      .then((result) => {
        this.forwardResponse(res, result.body, result.statusCode);
      });
  }
}