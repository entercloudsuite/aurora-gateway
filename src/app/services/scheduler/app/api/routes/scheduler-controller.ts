import { Logger, LoggerFactory, RestController } from '../../common';
import { Scheduler } from '../../services';

export class SchedulerController extends RestController {
  constructor(private schedulerService: Scheduler) {
    super();
  }

  private static LOGGER: Logger = LoggerFactory.getLogger();

  setJob(req, res): Promise<any> {
    return this.schedulerService.scheduleJob(req.body)
      .then(result => {
        return this.respond(res, result);
      });
  }

  deleteJob(req, res): Promise<any> {
    return this.schedulerService.deleteJob(req.body)
      .then(result => {
        return this.respond(res, result);
      });
  }

  updateJob(req, res): Promise<any> {
    return this.schedulerService.updateJob(req.body)
      .then(result => {
        return this.respond(res, result);
      });
  }

  getJobs(req, res): Promise<any> {
    return this.schedulerService.getJobs()
      .then(result => {
        this.respond(res, result);
      });
  }
}