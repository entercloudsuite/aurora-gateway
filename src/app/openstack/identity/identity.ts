import { OpenstackService } from '../openstack-service';
import { Logger, LoggerFactory, InvalidJsonError } from '../../common';

export class IdentityService {
    private authUrl: string;
    private apiVersion: string;
    
    constructor(keystoneURL: string, apiVersion: string) {
        this.authUrl = keystoneURL;
        this.apiVersion = apiVersion;
    }

    private static  LOGGER: Logger = LoggerFactory.getLogger();
    // TODO: Specify proper type for credentials
    authenticate(credentials: any): Promise<any> {
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
                    return Promise.resolve(response.body);
                }
            })
            .then((response) => {
                if (result) {
                    let reqObject = response.body;
                    reqObject['credentials'] = credentials;
                    return this.getServiceCatalog(reqObject);
                } else return Promise.resolve(response);
            })
            .then((response) => {
                if (result) {
                    return this.parseArray(response);
                } else {
                    return Promise.resolve(response);
                }
            })
            .then((response) => {
                return Promise.resolve(response);
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }

    parseArray(responseArray: Array<{}>): Promise<any> {
        return new Promise((resolve) => {
           let responseObject = {};
           responseArray.forEach((element) => {
               responseObject[Object.keys(element)[0]] = element[Object.keys(element)[0]];
           });
           resolve(responseObject);
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
        let userCredentials = {
            'username': authObj['credentials']['username'],
            'password': authObj['credentials']['password']
        };

        return Promise.all(authObj['tenants'].map((tenant) => {
            IdentityService.LOGGER.debug(`Requesting Service Catalog for ${tenant.name}`);
            userCredentials['tenant'] = tenant.name;
            return OpenstackService.parseCredentials(userCredentials, this.apiVersion)
                .then((authBody) => {
                    return this.getToken(authBody);
                })
                .then((authResult) => {
                    let tenant = authResult.body['access']['token']['tenant']['name'];
                    let result = {};
                    result[tenant] = authResult.body;
                    return Promise.resolve(result);
                });
        }));
    }

    listTenants(apiToken: string): Promise<any> {
        IdentityService.LOGGER.debug(`Getting tenant list for ${apiToken}`);
        return OpenstackService.sendRequest({
           'uri': this.authUrl + '/tenants',
            'headers': { 'X-Auth-Token': apiToken }
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