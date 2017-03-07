import Sequelize = require('sequelize');
import { APP_CONFIG } from '../config';

export class SQLConfig {
  static getConnection() {
    return new Sequelize(APP_CONFIG.dbName, APP_CONFIG.dbUser, APP_CONFIG.dbPass, {
      host: APP_CONFIG.dbHost,
      dialect: 'mysql',
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      }
    });
  }
}