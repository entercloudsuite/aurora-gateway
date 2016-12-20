import {OpenstackService} from '../openstack-service';
import {Logger, LoggerFactory, NotImplementedError, InternalError } from '../../common';

export class IdentityService {
  private authUrl: string;
  private apiVersion: string;

  constructor(keystoneURL: string, apiVersion: string) {
    this.authUrl = keystoneURL;
    this.apiVersion = apiVersion;
  }

  private static LOGGER: Logger = LoggerFactory.getLogger();

  authenticate(credentials: {}): Promise<any> {
    let result = {};
    return OpenstackService.parseCredentials(credentials, this.apiVersion)
      .then((authObj) => {
        return this.getToken(authObj);
      })
      .then((response) => {
        if (response.body.access.serviceCatalog.length === 0) {
          result = response.body;
          return this.listTenants(response.body.access.token.id);
        } else {
          return Promise.resolve(response);
        }
      })
      .then((response) => {
        if (Object.getOwnPropertyNames(result).length !== 0) {
          result = response.body;
          let reqObject = credentials;
          reqObject['tenant'] = response.body.tenants[0].name;
          return this.getServiceCatalog(reqObject);
        } else return Promise.resolve(response);
      })
      .then((response) => {
        if (Object.getOwnPropertyNames(result).length !== 0) {
          response.body['tenants'] = result;
          return Promise.resolve(response);
        } else return Promise.resolve(response);
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }

  destroySession(currentSession: any): Promise<any> {
    return new Promise((resolve, reject) => {
      currentSession.destroy((error) => {
        if (error) {
          return reject(new InternalError(error));
        } else {
          return resolve({
            'status': 'Successfully logged out'
          });
        }
      });
    });
  }

  getToken(credentials: {}): Promise<any> {
    // TODO: Abstract endpoint for different API versions
    IdentityService.LOGGER.debug('Requesting token from Keystone');
    return OpenstackService.sendRequest({
      'method': 'POST',
      'uri': this.authUrl + '/tokens',
      'body': credentials
    });
  }

  getServiceCatalog(authObj: {}): Promise<any> {
    if (this.apiVersion === '2.0') {
      return OpenstackService.parseCredentials(authObj, this.apiVersion)
        .then((authBody) => {
          return this.getToken(authBody);
        })
        .then((result) => {
          return Promise.resolve(result);
        });
    } else {
      return Promise.reject(
        new NotImplementedError(`Feature is not available for this OpenStack API version ${this.apiVersion}`)
      );
    }
  }

  listTenants(apiToken: string): Promise<any> {
    IdentityService.LOGGER.debug(`Getting tenant list for ${apiToken}`);
    return OpenstackService.sendRequest({
      'uri': this.authUrl + '/tenants',
      'headers': {'X-Auth-Token': apiToken}
    });
  }

  listExtensions(): Promise<any> {
    IdentityService.LOGGER.debug('Listing extensions');
    return OpenstackService.sendRequest({
      'uri': this.authUrl + '/extensions'
    });
  }

  listVersions(): Promise<any> {
    IdentityService.LOGGER.debug('Listing OpenStack API versions');
    return OpenstackService.sendRequest({'uri': this.authUrl});
  }
}