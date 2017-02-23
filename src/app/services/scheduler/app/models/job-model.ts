import Sequelize = require('sequelize');
import { Logger, LoggerFactory } from '../common';

export class JobModel {
  dbObject: any;

  private static LOGGER: Logger = LoggerFactory.getLogger();
  constructor(sqlConnection: Sequelize) {
    this.dbObject = sqlConnection.define('job', {
      messageName: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'message_name'
      },
      messageBody: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'message_name'
      },
      trigger: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'trigger'
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'status'
      }
    }, {
      freezeTableName: true
    });

    this.dbObject.sync()
      .then(() => {
        JobModel.LOGGER.info('Successfully synced with database tabel');
      })
      .catch((error) => {
        JobModel.LOGGER.error(`Unable to sync with database table - ${error}`);
      });
  }

  createJob(jobInfo: {}): Promise<any> {
    jobInfo['status'] = 'CREATED';
    return this.dbObject.create(jobInfo)
      .then(() => {
        return this.dbObject.findOne({where: jobInfo});
      });
  }

  updateJob(jobInfo: any): Promise<any> {
    return this.dbObject.findOne({where: {id: jobInfo.id}})
      .then(jobObject => {
        jobObject.status = 'UPDATED';
        return jobObject.update(jobInfo);
      })
      .then(() => {
        return this.dbObject.findOne({where: {id: jobInfo.id}});
      });
  }
}