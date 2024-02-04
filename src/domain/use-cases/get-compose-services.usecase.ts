import { ComposeService } from "../entities/compose-service";
import { ComposeServiceRepository } from "../repositories/compose-service-repository";

export class GetComposeServicesUseCase {
  constructor(private readonly composeServiceRepository: ComposeServiceRepository) { }

  public async run(): Promise<ComposeService[]> {
    return this.composeServiceRepository.getComposeServices();
  }
}