import Endpoints from '@app/constants/endpoints';
import GameScreen, { GameScreenDto } from '@app/models/GameScreen';
import Api from '@app/services/api';
import { loggedApiRequest } from '@app/util/logged-api-request';

/* REQUEST DTOs */
interface SubmitCommandRequestDto {
  contextScreenId: string;
  command: string;
  state: string;
}

interface CreatePathRequestDto {
  /** Screen that this command will be added to */
  sourceScreenId: string;
  /** Command the user must type */
  command: string;

  /** Items taken (and required) from the player to use this command */
  itemsTaken?: string[];
  /** Items given to the player if this command is successfully executed */
  itemsGiven?: string[];
  /** Whether to limit the items given by only giving them to the player if they don't already have them */
  limitItemsGiven?: boolean;
  /** Items required that the player have (but not removed) in order to successfully execute this command */
  itemsRequired?: string[];

  /** What kind of action this Command performs */
  actionType: CommandActionType;

  /* NAVIGATION ACTIONS */
  /** (If `actionType === 'navigate'`) Whether the command navigates to a new or existing screen */
  destinationType?: DestinationType;
  /** (If `destinationType === 'new'`) The body of the new screen that will be created */
  newScreenBody?: string[];
  /** (If `destinationType === 'existing'`) The ID of the existing screen to link to */
  existingScreenId?: string;

  /* PRINT ACTIONS */
  printMessage?: string[];
}

/* RESPONSE DTOs */
export interface SubmitCommandNavigationSuccessResponseDto {
  success: true;
  type: CommandActionType.Navigate;
  screen: GameScreenDto;
  state: string;
  itemsAdded: string[],
  itemsRemoved: string[],
}

export interface SubmitCommandPrintMessageSuccessResponseDto {
  success: true;
  type: CommandActionType.PrintMessage,
  printMessage: string[];
  state: string;
  itemsAdded: string[];
  itemsRemoved: string[];
}

interface SubmitCommandFailureResponseDto {
  success: false;
  message: string;
}

/* PARSED RESPONSES */
export interface SubmitCommandNavigationSuccessResponse {
  success: true;
  type: CommandActionType.Navigate;
  screen: GameScreen;
  state: string;
  itemsAdded: string[];
  itemsRemoved: string[];
}

export interface SubmitCommandPrintMessageSuccessResponse {
  success: true;
  type: CommandActionType.PrintMessage,
  printMessage: string[];
  state: string;
  itemsAdded: string[];
  itemsRemoved: string[];
}

export interface SubmitCommandFailureResponse {
  success: false;
  message: string;
}

/* MODEL ENUMS */
// @TODO move to model?
export enum CommandActionType {
  Navigate = 'navigate',
  PrintMessage = 'print',
}
export enum DestinationType {
  New = 'new',
  Existing = 'existing',
}

class CommandService {
  public async createPath(dto: CreatePathRequestDto): Promise<void> {
    return loggedApiRequest(async () => {
      await Api.postJson<string>(Endpoints.Command.addPath(), {
        body: dto,
      });
    });
  }

  public async submitCommand(contextScreenId: string, command: string, stateString: string): Promise<SubmitCommandNavigationSuccessResponse | SubmitCommandPrintMessageSuccessResponse | SubmitCommandFailureResponse> {
    return loggedApiRequest(async () => {
      // Fetch from API
      const request: SubmitCommandRequestDto = {
        contextScreenId,
        command,
        state: stateString,
      };

      const rawResponse = await Api.postJson<SubmitCommandNavigationSuccessResponseDto | SubmitCommandPrintMessageSuccessResponseDto | SubmitCommandFailureResponseDto>(Endpoints.Command.submit(), {
        body: request,
      });

      // Parse response
      // @NOTE code is not inlined so the fricken compiler enforces type safety
      //  on these properties (??)
      if (rawResponse.success === true) {

        if (rawResponse.type === CommandActionType.Navigate) {
          // Success
          const parsedResponse: SubmitCommandNavigationSuccessResponse = {
            success: true,
            screen: new GameScreen(rawResponse.screen),
            type: rawResponse.type,
            state: rawResponse.state,
            itemsAdded: rawResponse.itemsAdded,
            itemsRemoved: rawResponse.itemsRemoved,
          };

          return parsedResponse;
        } else if (rawResponse.type === CommandActionType.PrintMessage) {
          // Success
          const parsedResponse: SubmitCommandPrintMessageSuccessResponse = {
            success: true,
            type: rawResponse.type,
            printMessage: rawResponse.printMessage,
            state: rawResponse.state,
            itemsAdded: rawResponse.itemsAdded,
            itemsRemoved: rawResponse.itemsRemoved,
          };

          return parsedResponse;
        } else {
          throw new Error(`Unhandled command type (likely unimplemented): '${(rawResponse as any).type}'`);
        }
      } else if (rawResponse.success === false) {
        // Failure
        const parsedResponse: SubmitCommandFailureResponse = {
          success: false,
          message: rawResponse.message,
        };
        return parsedResponse;
      } else {
        // For unimplemented responses or crazy edge-cases (theoretically impossible)
        // i.e. a 200 from the API but no `success` property
        throw new Error("Got unknown response from API\n" + JSON.stringify(rawResponse));
      }

    });
  }
}

export default new CommandService();
