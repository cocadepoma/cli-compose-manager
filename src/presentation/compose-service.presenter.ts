import { GetComposeServicesUseCase } from "../domain/use-cases/get-compose-services.usecase";
import { StopComposeServicesUseCase } from "../domain/use-cases/stop-compose-services.use.case";
import { ComposerServiceView } from "./compose-service.view";
import { StartComposeServicesUseCase } from '../domain/use-cases/start-compose-services.usecase';
import { ComposeService } from "../domain/entities/compose-service";
import { RemoveComposeServicesUseCase } from "../domain/use-cases/remove-compose-services.usecase";
import { GetComposeServicesStatusUseCase } from "../domain/use-cases/get-compose-services-status.usecase";

export class ComposerServicePresenter {
  view: ComposerServiceView;
  getComposeServicesUseCase: GetComposeServicesUseCase;
  getComposeServicesStatusUseCase: GetComposeServicesStatusUseCase;
  stopComposeServicesUseCase: StopComposeServicesUseCase;
  startComposeServicesUseCase: StartComposeServicesUseCase;
  removeComposeServicesUseCase: RemoveComposeServicesUseCase;
  services: ComposeService[];

  constructor(
    view: ComposerServiceView,
    getComposeServicesUseCase: GetComposeServicesUseCase,
    getComposeServicesStatusUseCase: GetComposeServicesStatusUseCase,
    stopComposeServicesUseCase: StopComposeServicesUseCase,
    startComposeServicesUseCase: StartComposeServicesUseCase,
    removeComposeServicesUseCase: RemoveComposeServicesUseCase,
  ) {
    this.view = view;
    this.getComposeServicesUseCase = getComposeServicesUseCase;
    this.getComposeServicesStatusUseCase = getComposeServicesStatusUseCase;
    this.stopComposeServicesUseCase = stopComposeServicesUseCase;
    this.startComposeServicesUseCase = startComposeServicesUseCase;
    this.removeComposeServicesUseCase = removeComposeServicesUseCase;
    this.services = [];
  }

  async init() {
    this.view.showWelcomeMessage();
    this.requestOption();
  }

  private async requestOption() {
    const services = await this.getServices();
    this.services = services;

    const option = await this.view.requestOption();
    if (option === 'stop') {
      this.stopServices();
    } else if (option === 'load') {
      this.listServices();
    } else if (option === 'remove') {
      this.removeServices();
    } else if (option === 'close') {
      process.exit(0);
    } else if (option === 'list') {
      this.listServicesStatus();
    }
  }

  private async removeServices() {
    try {
      await this.removeComposeServicesUseCase.run();
      this.view.showSuccessMessage('Services removed successfully');
    } catch (error) {
      this.view.showErrorMessage('Error removing services');
    } finally {
      this.requestOption();
    }
  }

  private async stopServices() {
    try {
      await this.stopComposeServicesUseCase.run();
      this.view.showSuccessMessage('Services stopped successfully');
    } catch (error) {
      this.view.showErrorMessage('Error stopping services');
    } finally {
      this.requestOption();
    }
  }

  private async listServices() {
    this.view.showLoading('initial');
    this.view.stopLoading();

    const selectedServices = await this.view.requestSelectionComposeServices(this.services);
    const confirmation = await this.view.requestConfirmation(selectedServices.length);

    if (!confirmation) {
      this.requestOption();
      return;
    }

    this.startServices(selectedServices);
  }

  private async getServices() {
    try {
      const services = await this.getComposeServicesUseCase.run();
      return services;
    } catch (error) {
      console.log(error);
      process.exit(0);
    }
  }

  private async startServices(services: ComposeService[]) {
    try {
      this.view.showLoading('default');
      await this.startComposeServicesUseCase.run(services);
      await this.sleep(2000);
      this.view.stopLoading();
      this.view.showSuccessMessage('Services started successfully');
    } catch (error) {
      console.log(error);
      this.view.stopLoading();
      this.view.showErrorMessage('Error starting services');
    } finally {
      this.requestOption();
    }
  }

  private async listServicesStatus() {
    try {
      const services = await this.getComposeServicesStatusUseCase.run();

      if (services.length === 0) {
        this.view.showErrorMessage('No services found');
        return;
      }

      this.view.listComposeServices(services);
    } catch (error) {
      this.view.showErrorMessage('Error listing services');
    } finally {
      this.requestOption();
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}