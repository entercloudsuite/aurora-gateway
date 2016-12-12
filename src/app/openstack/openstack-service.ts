import request = require('request');
import { Logger, LoggerFactory, InternalError, RestError, InvalidJsonError } from '../common';
import util = require('util');

export class OpenstackService {
    public authUrl: string;
    private region: string;
    public serviceCatalog: {};
    public apiVersion: string;

    private static readonly LOGGER: Logger = LoggerFactory.getLogger();

    constructor(options: {}) {
        OpenstackService.LOGGER.info('Instatiating OpenstackService');
        this.authUrl = options['uri'];
        this.apiVersion = options['version'];

        OpenstackService.LOGGER.info(`OpenStack API Version - ${this.apiVersion}`);
        OpenstackService.LOGGER.info(`Keystone URL - ${this.authUrl}`);
        OpenstackService.sendRequest({'uri': this.authUrl})
            .then((result) => {
                if (result[0].statusCode !== 200) {
                    OpenstackService.LOGGER.error('Unable to reach Openstack API on specified endpoint');
                    throw new RestError('Error while testing Openstack API connection', result[0].statusCode, "OPENSTACK_API_ERROR")
                }
                OpenstackService.LOGGER.info('Validated API connection - Response body:');
                OpenstackService.LOGGER.debug(JSON.stringify(result[1], null, 2));
            })
            .catch((error) => {
                OpenstackService.LOGGER.error('Error while testing OpenStack API');
                throw new InternalError(error);
            });
    }

     static  sendRequest(options: {}): Promise<any> {
        let requestOptions = {
            'method':  options['method'] || 'GET',
            'uri': options['uri'],
            'json': options['json'] || false,
            'headers': options['headers'] || {'content-type': 'application/json'}
        };

         if (options['body']) {
             requestOptions['body'] = options['body'];
         }

        OpenstackService.LOGGER.debug(`Calling Openstack API with ${util.inspect(requestOptions, false, null)}`);
        return new Promise((resolve, reject) => {
            request(requestOptions, (err, response, body) => {
                if (err) {
                    return reject(new InternalError(err));
                }
                OpenstackService.LOGGER.debug(`Response body ${JSON.stringify(response.body)}`);
                // TODO: Return only the response and refacture previous uses of the method
                return resolve([response, body]);
            });
        });
    };

    parseCredentials(credentials: {}): Promise<any> {
        OpenstackService.LOGGER.debug(`Parsing credentials - ${JSON.stringify(credentials)}`);
        return new Promise((resolve, reject) => {
            switch (this.apiVersion) {
                case '2.0':
                    if (credentials['username'] && credentials['password']) {
                        return resolve({
                            'auth': {
                                'tenantName': credentials['tenant'] || '',
                                'passwordCredentials': {
                                    'username': credentials['username'],
                                    'password': credentials['password']
                                }
                            }
                        });
                        // TODO: Add InvalidCredentialsError
                    } else return reject(new InvalidJsonError());
                default:
                    // TODO: Handle exceptions
                    return resovle(credentials);
            }
        });
    }
}

