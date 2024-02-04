import { ComposeService } from "../entities/compose-service";

export interface ComposeServiceRepository {
  getComposeServices(): Promise<ComposeService[]>;
  getComposeServicesStatus(): Promise<ComposeService[]>;
  startComposeServices(services: ComposeService[]): Promise<void>;
  stopComposeServices(): Promise<void>;
  removeComposeServices(): Promise<void>;
}