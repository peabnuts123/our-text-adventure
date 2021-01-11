import Endpoints from '@app/constants/endpoints';
import GameScreen, { GameScreenDto } from '@app/models/GameScreen';
import Api, { ApiErrorResponse } from '@app/services/api';
import Logger, { LogLevel } from '@app/util/Logger';


interface SubmitCommandRequestDto {
  contextScreenId: string;
  command: string;
  state: string;
}

interface SubmitCommandSuccessResponseDto {
  success: true;
  screen: GameScreenDto;
  state: string;
}

interface SubmitCommandFailureResponseDto {
  success: false;
  message: string;
}

export interface SubmitCommandSuccessResponse {
  success: true;
  screen: GameScreen;
  state: string;
}

export interface SubmitCommandFailureResponse {
  success: false;
  message: string;
}

export enum DestinationType {
  New = 'new',
  Existing = 'existing',
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
  /** Items required that the player have (but not removed) in order to successfully execute this command */
  itemsRequired?: string[];

  /** Whether the command links to a new or existing screen */
  destinationType: DestinationType;
  /** (If `destinationType === 'new'`) The body of the new screen that will be created */
  newScreenBody?: string[];
  /** (If `destinationType === 'existing'`) The ID of the existing screen to link to */
  existingScreenId?: string;
}

export default class CommandStore {
  public async createPath(dto: CreatePathRequestDto): Promise<void> {
    const response = await Api.postJson<string>(Endpoints.Command.addPath(), {
      body: dto,
    });

    Logger.log(LogLevel.debug, `Got response: '${response}' (${response.length})`);
  }

  public async submitCommand(contextScreenId: string, command: string, stateString: string): Promise<SubmitCommandSuccessResponse | SubmitCommandFailureResponse> {
    try {
      // Fetch from API
      const request: SubmitCommandRequestDto = {
        contextScreenId,
        command,
        state: stateString,
      };
      const rawResponse = await Api.postJson<SubmitCommandSuccessResponseDto | SubmitCommandFailureResponseDto>(Endpoints.Command.submit(), {
        body: request,
      });

      // Parse response
      // @NOTE code is not inlined so the fricken compiler enforces type safety
      //  on these properties (??)
      if (rawResponse.success === true) {
        // Success
        const parsedResponse: SubmitCommandSuccessResponse = {
          success: true,
          screen: new GameScreen(rawResponse.screen),
          state: rawResponse.state,
        };
        return parsedResponse;
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

    } catch (e) {
      if (e instanceof ApiErrorResponse) {
        // @TODO do something better
        Logger.logError(LogLevel.debug, `API returned error: `, e);
      }

      throw e;
    }
  }
}
