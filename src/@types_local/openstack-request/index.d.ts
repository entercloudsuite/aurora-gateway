export interface OpenstackRequest {
  protocol: string;
  url: string;
  host: string;
  port: string;
  path: string;
  headers: {};
  method: string;
  body: {};
  session: {};
}
