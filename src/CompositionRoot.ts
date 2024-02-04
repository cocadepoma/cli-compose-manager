import { GetComposeServicesUseCase } from './domain/use-cases/get-compose-services.usecase';
import { StartComposeServicesUseCase } from "./domain/use-cases/start-compose-services.usecase";
import { StopComposeServicesUseCase } from "./domain/use-cases/stop-compose-services.use.case";
import { RemoveComposeServicesUseCase } from './domain/use-cases/remove-compose-services.usecase';
import { GetComposeServicesStatusUseCase } from './domain/use-cases/get-compose-services-status.usecase';

import { ComposeServicesMemoryRepository } from "./data/compose-service-memory.repository";

import { ComposerServicePresenter } from "./presentation/compose-service.presenter";
import { ComposerServiceView } from "./presentation/compose-service.view";

export class CompositionRoot {
  static provideUserPresenter(view: ComposerServiceView) {
    const composeServiceMemoryRepository = new ComposeServicesMemoryRepository();
    const getComposeServicesUseCase = new GetComposeServicesUseCase(composeServiceMemoryRepository);
    const getComposeServicesStatusUseCase = new GetComposeServicesStatusUseCase(composeServiceMemoryRepository);
    const stopComposeServiceUseCase = new StopComposeServicesUseCase(composeServiceMemoryRepository);
    const startComposeServiceUseCase = new StartComposeServicesUseCase(composeServiceMemoryRepository);
    const removeComposeServicesUseCase = new RemoveComposeServicesUseCase(composeServiceMemoryRepository);

    return new ComposerServicePresenter(
      view,
      getComposeServicesUseCase,
      getComposeServicesStatusUseCase,
      stopComposeServiceUseCase,
      startComposeServiceUseCase,
      removeComposeServicesUseCase,
    );
  }
}