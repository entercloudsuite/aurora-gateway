import 'core-js/library';

import { Logger, LoggerFactory, RabbitClient } from './common';
import { Express, Router } from 'express';
import { ExpressAppFactory } from './express-app-factory';
import { ApiRouterFactory } from './api';
import { RestErrorMiddleware } from './common';
import util = require('util');

const LOGGER: Logger = LoggerFactory.getLogger();
const apiRouter: Router = ApiRouterFactory.getApiRouter();

// Get the application middleware (to be mounted after the api router)
const errorMiddleware = [
  RestErrorMiddleware.normalizeToRestError,
  RestErrorMiddleware.serializeRestError
];

const app: Express = ExpressAppFactory.getExpressApp(apiRouter, null, errorMiddleware);

//
// app.on('NEW_SERVICE', message => {
//   ExpressAppFactory.LOGGER.debug(`Added new route for service - ${JSON.stringify(message.body)}`);
//   const newRouter = ApiRouterFactory.registerNewAPI(message.body.path, message.body.name);
//   app.use('/api' + message.body.routingPath, newRouter);
//   app.get('/banana', (req, res) => {
//     res.json('it works');
//   });
//   ExpressAppFactory.LOGGER.debug(`Added new route for service - ${JSON.stringify(message.body)}`);
// });
//
// const rabbitClient = new RabbitClient('aurora-general');
// function emitEvent() {
//   this.emit('NEW_SERVICE');
// }
//
// emitEvent.bind(app);
// rabbitClient.rabbitConnection.handle(
//   rabbitClient.messageTypes.NEW_SERVICE,
//   emitEvent
// );
////////////////////

app.listen(parseInt(process.env.PORT), () => {
  LOGGER.info(`Express server listening on port ${process.env.PORT}.`);
});
