import fs from 'fs';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import YAML from 'yaml';

import { ComposeService, ValueType } from "../domain/entities/compose-service";
import { ComposeServiceRepository } from "../domain/repositories/compose-service-repository";
import { CONTAINER_PREFIX } from '../constants/constants';

const exec = promisify(execCallback);

export class ComposeServicesMemoryRepository implements ComposeServiceRepository {
  composeServices: ComposeService[];
  private composeFileNames = [
    './src/assets/docker-compose-backend.yml',
    './src/assets/docker-compose-frontend.yml',
    './src/assets/docker-compose-common.yml'
  ];

  constructor() {
    this.composeServices = [];
  }

  getComposeServices(): Promise<ComposeService[]> {
    try {
      const servicesMap = this.composeFileNames.map((filePath) => {
        const file = fs.readFileSync(filePath, { encoding: 'utf-8' });
        const ymlFile = YAML.parse(file);

        return Object.keys(ymlFile.services).map((key) => {
          const service = ymlFile.services[key];
          return ComposeService.create({
            name: key,
            containerName: service.container_name,
            type: filePath,
          });
        });
      });

      const services = servicesMap.flat();

      return Promise.resolve(services);
    } catch (error) {
      console.log('Unable to get compose services, please check the compose files names and paths.');
      return Promise.reject(error);
    }
  }

  startComposeServices(services: ComposeService[]): Promise<void> {
    try {
      const filteredServicesByType = this.filterServicesByType(services);
      const dockerComposeCommand = this.buildDockerComposeStringCommand(filteredServicesByType);

      this.composeServices = services;
      return this.executeExecCommand(dockerComposeCommand);
    } catch (error) {
      console.log('Unable to start compose services, please check the compose files names and paths.');
      return Promise.reject(error);
    }
  }

  stopComposeServices(): Promise<void> {
    try {
      const composeStopCommand = `docker compose -f ${this.composeFileNames[0]} -f ${this.composeFileNames[1]} -f ${this.composeFileNames[2]} stop`;
      return this.executeExecCommand(composeStopCommand);
    } catch (error) {
      console.log('Unable to stop compose services, please check the compose files names and paths.');
      return Promise.reject(error);
    }
  }

  async removeComposeServices(): Promise<void> {
    try {
      const composeRemoveCommand = `docker compose -f ${this.composeFileNames[0]} -f ${this.composeFileNames[1]} -f ${this.composeFileNames[2]} down`;
      return this.executeExecCommand(composeRemoveCommand);
    } catch (error) {
      console.log('Unable to remove compose services, please check the compose files names and paths.');
      return Promise.reject(error);
    }
  }

  async getComposeServicesStatus(): Promise<ComposeService[]> {
    try {
      const dockerList = `docker container ls -a --filter "name=^${CONTAINER_PREFIX}" --format "{{json . }}"`
      const output = await this.executeExecCommand<string>(dockerList);

      const json: any[] = JSON.parse(`[${output.replace(/\n/g, ',').slice(0, -1)}]`);
      const regex = /com\.host\.description=([^,]+)/;

      const services: ComposeService[] = [];

      json.forEach((container) => {
        const match = regex.exec(container.Labels)![1]!;
        services.push(ComposeService.create({
          name: container.Names,
          containerName: container.Names,
          type: match,
          status: container.Status
        }));
      });

      return services;
    } catch (error) {
      console.log('Unable to get compose services status, please check the compose files names and paths.');
      return Promise.reject(error);
    }
  }

  private executeExecCommand<T>(command: string): Promise<T> {
    return new Promise((resolve, reject) => {
      exec(command)
        .then(({ stdout }: any) => {
          resolve(stdout);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  private filterServicesByType(services: ComposeService[]): { [key in ValueType]: string[] } {
    return services.reduce((acc: any, service: ComposeService) => {
      if (!acc[service.type]) {
        acc[service.type] = [];
      }
      acc[service.type].push(service.name.value);
      return acc;
    }
      , {});
  }

  private buildDockerComposeStringCommand(filteredServicesByType: { [key in ValueType]: string[] }): string {
    const backendStr = filteredServicesByType.Backend?.join(' ') ?? '';
    const frontendStr = filteredServicesByType.Frontend?.join(' ') ?? '';
    const commonStr = filteredServicesByType.Common?.join(' ') ?? '';

    let base = 'docker compose';
    if (backendStr) {
      base += ` -f ${this.composeFileNames[0]}`;
    }

    if (frontendStr) {
      base += ` -f ${this.composeFileNames[1]}`;
    }

    if (commonStr) {
      base += ` -f ${this.composeFileNames[2]}`;
    }

    return `${base} up -d ${backendStr} ${frontendStr} ${commonStr}`
  }
}