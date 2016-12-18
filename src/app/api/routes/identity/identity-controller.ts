import { Logger, LoggerFactory, RestController } from '../../../common';
import { IdentityService } from '../../../openstack';

export class IdentityController extends RestController {
  constructor(private identityService: IdentityService) {
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
            return this.forwardResponse(res, result);
        });
  };

  listExtensions(req, res, next): Promise<any> {
    IdentityController.LOGGER.debug('Listing extensions');

    return this.identityService.listExtensions()
        .then((result) => {
          return this.forwardResponse(res, result.body, result.statusCode);
        });
  };

  listTenants(req, res, next): Promise<any> {
    IdentityController.LOGGER.debug('Listing tenants');

    return this.identityService.listTenants(req.headers['x-auth-token'])
        .then((result) => {
          return this.forwardResponse(res, result.body, result.statusCode);
        });
  };
}
