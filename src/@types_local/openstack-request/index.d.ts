export interface OpenstackRequest {
  host: string;
  port: string;
  path: string;
  headers?: {};
  method?: string;
  protocol?: string;
  body?: {};
  session?: {};
}
