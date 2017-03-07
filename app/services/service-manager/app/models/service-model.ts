import { Service } from './';

export class ServiceModel implements Service{
  public host: string;
  public port: number;
  public name: string;
  public status = 'READY';
  public routingPath: string;
  public apiPath: string;
  public lastUpdate: any;
  
  constructor(host: string, port: number, name: string, status: string, routingPath: string, apiPath: string) {
    this.host = host;
    this.port = port;
    this.name = name;
    this.status = status;
    this.routingPath = routingPath;
    this.apiPath = apiPath;
    this.lastUpdate = Date.now();
  }
  
  toJSON() {
    return {
      host: this.host,
      port: this.port,
      apiPath: this.apiPath,
      name: this.name,
      routingPath: this.routingPath
    }
  }
}