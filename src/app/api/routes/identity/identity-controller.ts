import {Logger, LoggerFactory, RestController} from '../../../common';
import {IdentityService, OpenstackService} from '../../../openstack';
import request = require('request');

export class IdentityController extends RestController {
  constructor(private identityService: IdentityService, private openstackService: OpenstackService) {
    super();
  }

  private static readonly LOGGER: Logger = LoggerFactory.getLogger();

  listVersions(req, res, next): Promise<any> {
    IdentityController.LOGGER.debug('Listing Openstack API Versions');
    return this.identityService.listVersions()
      .then((result) => {
        return this.forwardResponse(res, result.body, result.statusCode);
      });
  }

  authenticate(req, res, next): Promise<any> {
    // TODO : Log username
    IdentityController.LOGGER.debug(`Authenticating user ${req.body['username']}`);
    return this.identityService.authenticate(req.body)
      .then((result) => {
        req.session.token = result.body.access.token.id;
        req.session.username = req.body['username'];
        this.openstackService.updateServiceCatalog(result.body.access.serviceCatalog);
        return this.forwardResponse(res, result.body, result.statusCode);
      });
  };

  listExtensions(req, res, next): Promise<any> {
    IdentityController.LOGGER.debug('Listing extensions');

    return this.identityService.listExtensions()
      .then((result) => {
        return this.forwardResponse(res, result.body, result.statusCode);
      });
  };

  logout(req, res, next): Promise<any> {
    IdentityController.LOGGER.debug(`Log out for use - ${req.session.username}`);

    return this.identityService.destroySession(req.session)
      .then((result) => {
        return this.respond(res, result);
      });
  }
  listTenants(req, res, next): Promise<any> {
    IdentityController.LOGGER.debug('Listing tenants');

    return this.identityService.listTenants(req.session.token)
      .then((result) => {
        return this.forwardResponse(res, result.body, result.statusCode);
      });
  };
}
