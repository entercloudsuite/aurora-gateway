import { Logger, LoggerFactory, RestController } from '../../../common';
import { GatewayService } from '../../../services';

export class GatewayController extends RestController {
  constructor(private gatewayService: GatewayService) {
    super();
  }

  private static LOGGER: Logger = LoggerFactory.getLogger();

  /**
   * Default method that forwards external requests to registered services
   * 
   * @todo Separate token management to a middleware that also checks if session exists
   * @param {any} req 
   * @param {any} res 
   * @returns {Promise<any>} 
   * 
   * @memberOf GatewayController
   */
  forwardRequest(req, res): Promise<any> {
    return this.gatewayService.callServiceManager()
      .then((serviceManagerResponse) => {
        if (req.session.token) {
          req.headers['X-Auth-Token'] = req.session.token;
        }
        // const serviceObject = JSON.parse(serviceManagerResponse.body);
        return this.gatewayService.callService(req, serviceManagerResponse.data.host, serviceManagerResponse.data.port, serviceManagerResponse.data.options.apiPath);
      })
      .then((serviceResponse) => {
        return this.forwardResponse(res, serviceResponse.body, serviceResponse.statusCode);
      });
  }

  /**
   * Used for the authentication path in order to update the session object with the received authentication token
   * 
   * @param {any} req 
   * @param {any} res 
   * @returns {Promise<any>} 
   * 
   * @memberOf GatewayController
   */
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
          serviceManagerResponse.data.options.apiPath);
      })
      .then((serviceResponse) => {
        req.session.token = JSON.parse(serviceResponse.body).access.token.id;
        req.session.username = req.body.username;
        return this.forwardResponse(res, serviceResponse.body, serviceResponse.statusCode);
      });
  }
}