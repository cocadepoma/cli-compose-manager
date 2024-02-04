import { ComposeServiceRepository } from "../repositories/compose-service-repository";

export class StopComposeServicesUseCase {
  constructor(private readonly composeServiceRepository: ComposeServiceRepository) { }

  public async run(): Promise<void> {
    return this.composeServiceRepository.stopComposeServices();
  }
}