import { ComposeService } from '../domain/entities/compose-service';

export interface ComposerServiceView {
  showLoading(type: LoadingType): void;
  stopLoading(): void;

  requestOption(): Promise<OptionType>;
  requestSelectionComposeServices(services: ComposeService[]): Promise<ComposeService[]>;
  requestConfirmation(amount: number): Promise<boolean>;
  listComposeServices(services: ComposeService[]): void;

  showWelcomeMessage(): void;
  showErrorMessage(message: string): void;
  showSuccessMessage(message: string): void;
}

export type LoadingType = 'initial' | 'default';
export type OptionType = 'load' | 'list' | 'stop' | 'remove' | 'close';