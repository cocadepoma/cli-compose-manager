import ora from 'ora';
import inquirer from 'inquirer';
import chalk from 'chalk';

import { CompositionRoot } from "../CompositionRoot";
import { ComposerServiceView, LoadingType, OptionType } from "./compose-service.view";
import { ASCIILogo, defaultLoadingMessage, initialLoadingMessage } from "./messages";
import { ComposeService } from '../domain/entities/compose-service';

export class ComposeServiceTerminal implements ComposerServiceView {
  private composeServicePresenter = CompositionRoot.provideUserPresenter(this);
  private spinner = ora({ color: 'magenta', text: initialLoadingMessage, spinner: 'arrow3' });

  async initialize() {
    await this.composeServicePresenter.init();
  }

  showLoading(type: LoadingType): void {
    const message = type === 'initial' ? initialLoadingMessage : defaultLoadingMessage;
    this.spinner.text = message;
    this.spinner.start();
  }

  stopLoading(): void {
    this.spinner.stop();
  }

  showWelcomeMessage(): void {
    console.log(ASCIILogo);
  }

  async requestConfirmation(amount: number): Promise<boolean> {
    const message = `You are about to start ${chalk.magenta(amount)} services, are you sure?`;

    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmation',
        message,
      },
    ]);

    return answers.confirmation;
  }

  async requestOption(): Promise<OptionType> {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'option',
        message: 'What do you want to do?',
        choices: [
          { name: '1. Load services', value: 'load' },
          { name: '2. Stop services', value: 'stop' },
          { name: '3. Remove services', value: 'remove' },
          { name: '4. List services status', value: 'list' },
          { name: '5. Exit', value: 'close' },
        ],
      },
    ]);

    return answers.option as OptionType;
  }

  async requestSelectionComposeServices(services: ComposeService[]): Promise<ComposeService[]> {
    const selectedPrompts = [];

    while (selectedPrompts.length === 0) {
      const answers = await inquirer.prompt([
        {
          type: 'checkbox',
          pageSize: 30,
          message: `Select the ${chalk.magenta('services')} you want to start`,
          name: 'services',
          choices: this.parseServicesToPrompt(services),
        },
      ]);

      if (answers.services.length === 0) {
        console.log(chalk.red('You must select at least one service'));
      } else {
        selectedPrompts.push(...answers.services);
      }
    }

    return this.parsePromptToServices(services, selectedPrompts);
  }

  listComposeServices(services: ComposeService[]): void {
    console.table(services.map((service) => {
      return {
        name: service.name.value,
        type: service.type,
        status: service.status,
      }
    }));
  }

  showErrorMessage(message: string): void {
    console.log(chalk.red(message));
  }

  showSuccessMessage(message: string): void {
    console.log(chalk.green(message));
  }

  private parseServicesToPrompt(services: ComposeService[]) {
    return services.map((service) => {
      return {
        id: service.id,
        name: `${service.type} | ${service.name.value}`,
        value: service.name.value,
      }
    });
  }

  private parsePromptToServices(services: ComposeService[], prompts: string[]): ComposeService[] {
    return services.filter((service) => prompts.includes(service.name.value));
  }
}