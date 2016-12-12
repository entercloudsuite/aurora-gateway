import { Logger, LoggerFactory, RestController } from '../../../common';
import { IdentityService, OpenstackService } from '../../../openstack';

export class IdentityController extends RestController {
  constructor(private identityService: IdentityService, private openstackService: OpenstackService) {
    super();
  }

  private static readonly LOGGER: Logger = LoggerFactory.getLogger();

    listVersions(req, res, next): Promise<any> {
        IdentityController.LOGGER.debug('Listing Openstack API Versions');
        return this.identityService.listVersions()
            .then((result) => {
                return this.respond(res, result);
            })
            .catch((error) => { next(error); });
    }

  authenticate(req, res, next): Promise<any> {
    // TODO : Log username
    IdentityController.LOGGER.debug(`Authenticating user ${req.body['username']}`);

    return this.identityService.authenticate(req.body, this.openstackService)
        .then((result) => {
          return this.respond(res, result);
        })
        .catch((error) => {
            next(error);
        });
  };

  listExtensions(req, res, next): Promise<any> {
    IdentityController.LOGGER.debug('Listing extensions');

    return this.identityService.listExtensions()
        .then((result) => {
          return this.respond(res, JSON.stringify(result));
        });
  };

  listTenants(req, res, next): Promise<any> {
    IdentityController.LOGGER.debug('Listing tenants');

    return this.identityService.listTenants(req.headers['X-Auth-Token'])
        .then((result) => {
          return this.respond(res, JSON.stringify(result));
        });
  };
}
