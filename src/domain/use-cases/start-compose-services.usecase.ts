import { ComposeService } from "../entities/compose-service";
import { ComposeServiceRepository } from "../repositories/compose-service-repository";

export class StartComposeServicesUseCase {
  constructor(private readonly composeServiceRepository: ComposeServiceRepository) { }

  public async run(services: ComposeService[]): Promise<void> {
    return this.composeServiceRepository.startComposeServices(services);
  }
}
