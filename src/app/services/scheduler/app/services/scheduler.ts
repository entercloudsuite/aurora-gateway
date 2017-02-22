import { EventEmitter, RabbitClient, RabbitClient, InvalidJsonError, InternalError } from '../common';
import { JobModel } from '../models';
import { Topology, SQLConfig } from '../config';
import scheduler = require('node-schedule');
import cronParser = require('cron-parser');

export class Scheduler {
  public jobs: {};
  public schedulerManager: scheduler;
  public job: JobModel;
  public rabbitClient: RabbitClient;

  constructor() {
    this.schedulerManager = scheduler;
    this.jobs = {};
    this.job = new JobModel(SQLConfig.getConnection());
    this.rabbitClient = new RabbitClient(
      Topology.EXCHANGES.servicesExchange,
      Topology.QUEUES.servicesRequests);
  }

  registerMessageHandlers() {
  }

  static runJob(jobId: number) {
    this.job.dbObject.findOne({ where: {id: jobId}})
      .then(job => {
        this.rabbitClient.publish(job.messageName, '', job.messageBody);
      });
  }

  scheduleJob(jobInfo: any): Promise<any> {
    return this.parseJobRequest(jobInfo)
      .then(jobInfo => {
        return this.job.createJob(jobInfo);
      })
      .then(persistedJob => {
        // TODO: Check node-scheduler package for error management
        this.jobs[persistedJob.id] = this.schedulerManager.scheduleJob(
          Scheduler.runJob.bind(this, persistedJob.jobId)
        );
        return Promise.resolve(persistedJob);
      });
  }

  updateJob(jobInfo: any): Promise<any> {
    return this.job.dbObject.findOne({where: {id: jobInfo.jobId}})
      .then(jobObject => {
        return jobObject.update(jobInfo);
      })
      .then(() => {
        this.jobs[jobInfo.jobId].cancel();
        this.jobs[jobInfo.jobId] = this.schedulerManager.schedulerJob(
          Scheduler.runJob.bind(this, jobInfo.jobid)
        );
        return Promise.resolve(jobInfo);
      });
  }

  deleteJob(jobId: number): Promise<any> {
    return new Promise.all([
     this.job.dbObject.destroy({where: {jobId: jobId}}),
     this.schedulerManager[jobId].cancel()
    ]);
  }

  getJobs(): Promise<any> {
    return this.job.dbObject.findAll();
  }

  parseJobRequest(jobInfo: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        cronParser.parseExpression(jobInfo.trigger);
      } catch (err) {
        if (!Date.parse(jobInfo.trigger)) {
            return reject(new InvalidJsonError('Invalid trigger format'));
        }
      }

      return resolve(jobInfo);
    });
  }
}