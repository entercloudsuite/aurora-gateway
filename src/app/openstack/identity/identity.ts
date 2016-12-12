import { OpenstackService } from '../openstack-service';
import { Logger, LoggerFactory, InvalidJsonError } from '../../common';

export class IdentityService {
    private authUrl: string;

    constructor(keystoneURL: string) {
        this.authUrl = keystoneURL;
    }

    private static readonly LOGGER: Logger = LoggerFactory.getLogger();
    // TODO: Specify proper type for credentials
    authenticate(credentials: any, openstackService: OpenstackService): Promise<any> {
        let result = {};
        return openstackService.parseCredentials(credentials)
            .then((credentials) => {
                return this.getToken(credentials);
            })
            .then((response) => {
                if (response[0]['error']) {
                    // TODO: Treat incoming Openstack API errors differently
                    return Promise.reject((new InvalidJsonError(response[0]['error']['message'])));
                } else if (response[1].access.serviceCatalog.length === 0) {
                    result = response[1].access;
                    return this.listTenants(response[1].access.token.id);
                } else {
                    return Promise.resolve(response);
                }
            })
            .then((response) => {
                if (result) {
                    result['tenant'] = response[1];
                    return Promise.resolve(result);
                } else return Promise.resolve(result);
            })
            .catch((error) => {
                // TODO: Create and specify proper type of error
                return Promise.reject(error);
            });
    }

    getToken(credentials: {}): Promise<any> {
        // TODO: Abstract endpoint for different API versions
        IdentityService.LOGGER.debug('Requesting token from Keystone');
        return OpenstackService.sendRequest({
            'method': 'POST',
            'uri': this.authUrl + '/tokens',
            'json': true,
            'body': credentials
        });
    }

    listTenants(apiToken: string): Promise<any> {
        IdentityService.LOGGER.debug(`Getting tenant list for ${apiToken}`);
        return OpenstackService.sendRequest({
           'uri': this.authUrl + '/tenants',
            'headers': { 'X-Auth-Token': apiToken },
            'json': true
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