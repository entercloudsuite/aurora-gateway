import 'core-js/library';
import { Logger, LoggerFactory, RabbitClient } from './common';
import { Topology } from './config';
import { Express } from 'express';
import http = require('http');
import util = require('util');
import express = require('express');
import { ServiceUtils } from './utils';

require('dotenv').config();

const LOGGER: Logger = LoggerFactory.getLogger();
const app: Express = express();

// Register new instantiated service
ServiceUtils.registerService()
  .then(serviceId => {
    LOGGER.info(`Service ID returned by the Service Manager - ${serviceId}`);
  })
  .catch(error => {
    LOGGER.error(`Unable to register service ${error}`);
  });
const messageHandler = new RabbitClient(
  Topology.EXCHANGES.servicesExchange,
  Topology.QUEUES.servicesRequests
);


// Notify a specific service about the message that should be requested
messageHandler.publishMessage(
  Topology.MESSAGES.registerPublisher,
  'NOTIFICATION_METADATA',
  {
    requestPath: 'api/nova/vms',
    messageName: Topology.MESSAGES.metadataRequest
  }
);

// Reply to incoming subscriber request
messageHandler.rabbitConnection.handle(Topology.MESSAGES.metadataRequest, message => {
  LOGGER.info('Received subscriber request');
  message.body['tags'] = ['tag1', 'tag2'];
  message.reply(message.body, Topology.MESSAGES.metadataResponse);
});

app.listen(parseInt(process.env.PORT), () => {
  LOGGER.info(`Express server listening on port ${process.env.PORT}.`);
});
