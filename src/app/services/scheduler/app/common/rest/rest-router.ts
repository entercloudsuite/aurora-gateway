import express = require('express');
import { Router } from 'express';
import { RestController } from './rest-controller';
import { Subscriber } from '../rabbit-subscriber';

export abstract class RestRouter {
  router: Router;

  constructor() {
    this.router = express.Router({mergeParams: true});
  }

  abstract initRoutes();

  wrapParamFn(controller: RestController, handlerFn: Function) {
    return (req, res, next, param) => {
      return Promise.resolve(handlerFn.bind(controller)(req, res, next, param))
        .catch(err => next(err));
    };
  }

  wrapRouteFn(controller: RestController, handlerFn: Function) {
    return (req, res, next) => {
      //Subscriber.notifyServices(res.status, req.path, req.body);
      // Add callback method for notifing on different events
      return Promise.resolve(handlerFn.bind(controller)(req, res, next))
        .catch(err => next(err));
    };
  }

}