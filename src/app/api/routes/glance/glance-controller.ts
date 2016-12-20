import {Logger, LoggerFactory, RestController} from '../../../common';
import {OpenstackService} from '../../../openstack';

export class GlanceController extends RestController {
  constructor(private openstackService: OpenstackService) {
    super();
  }

  private static readonly LOGGER: Logger = LoggerFactory.getLogger();

  proxyRequest(req, res, next): Promise<any> {
    return this.openstackService.proxyRequest(req)
      .then((result) => {
        this.forwardResponse(res, result.body, result.statusCode);
      });
  }
}