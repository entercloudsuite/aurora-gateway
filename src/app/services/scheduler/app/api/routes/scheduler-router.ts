import { RestRouter, InvalidResourceUrlError } from '../../common';
import { SchedulerController } from './scheduler-controller';
import { Scheduler } from '../../services';

export class SchedulerRouter extends RestRouter {
  schedulerController: SchedulerController;

  constructor(schedulerService: Scheduler) {
    super();
    this.schedulerController = new SchedulerController(schedulerService);
    this.initRoutes();
  }

  initRoutes() {
    this.router.post('/jobs', this.wrapRouteFn(this.schedulerController, this.schedulerController.setJob));
    this.router.put('/jobs', this.wrapRouteFn(this.schedulerController, this.schedulerController.updateJob));
    this.router.delete('/jobs', this.wrapRouteFn(this.schedulerController, this.schedulerController.deleteJob));
    this.router.get('/jobs', this.wrapRouteFn(this.schedulerController, this.schedulerController.getJobs));
    this.router.all('*', (req, res, next) => {
      next(new InvalidResourceUrlError());
    });
  }
}
