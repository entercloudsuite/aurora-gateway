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
          req.headers['x-auth-token'] = req.session.token;
        }
        const serviceObject = JSON.parse(serviceManagerResponse.body);
        return this.gatewayService.callService(req, serviceObject.data.host, serviceObject.data.port, serviceObject.data.apiPath);
      })
      .then((serviceResponse) => {
        return this.forwardResponse(res, serviceResponse.body, serviceResponse.statusCode);
      });
  }
  
  authenticate(req, res): Promise<any> {
    return this.gatewayService.callServiceManager()
      .then((serviceObject) => {
        return this.gatewayService.callService(req, serviceObject.body.data.host, serviceObject.body.data.port, serviceObject.body.data.apiPath);
      })
      .then((serviceResponse) => {
        req.session.token = serviceResponse.body.access.token.id;
        req.session.username = serviceResponse.body.username;
        return this.forwardResponse(res, serviceResponse.body, serviceResponse.statusCode);
      });
  }
}