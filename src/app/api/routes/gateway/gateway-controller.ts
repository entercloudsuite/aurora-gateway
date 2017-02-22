import { Logger, LoggerFactory, RestController } from '../../../common';
import { GatewayService } from '../../../services';

export class GatewayController extends RestController {
  constructor(private gatewayService: GatewayService) {
    super();
  }

  private static LOGGER: Logger = LoggerFactory.getLogger();

  forwardRequest(req, res): Promise<any> {
    return this.gatewayService.callServiceManager()
      .then((serviceManagerResponse) => {
        // TODO: Separate token management to a middleware that also checks if session exists
        if (req.session.token) {
          req.headers['X-Auth-Token'] = req.session.token;
        }
        // const serviceObject = JSON.parse(serviceManagerResponse.body);
        return this.gatewayService.callService(req, serviceManagerResponse.data.host, serviceManagerResponse.data.port, serviceManagerResponse.data.apiPath);
      })
      .then((serviceResponse) => {
        return this.forwardResponse(res, serviceResponse.body, serviceResponse.statusCode);
      });
  }

  authenticate(req, res): Promise<any> {
    GatewayController.LOGGER.info(`Authenticating user - ${req.body.username}`);
    return this.gatewayService.callServiceManager()
      .then((serviceManagerResponse) => {
        // const serviceObject = JSON.parse(serviceManagerResponse.body);
        // GatewayController.LOGGER.debug(`${JSON.stringify(serviceObject)}`);
        return this.gatewayService.callService(
          req, 
          serviceManagerResponse.data.host, 
          serviceManagerResponse.data.port, 
          serviceManagerResponse.data.apiPath);
      })
      .then((serviceResponse) => {
        req.session.token = JSON.parse(serviceResponse.body).access.token.id;
        req.session.username = req.body.username;
        return this.forwardResponse(res, serviceResponse.body, serviceResponse.statusCode);
      });
  }
}