import Endpoints from "@app/constants/endpoints";
import GameScreen, { GameScreenDto } from "@app/models/GameScreen";
import Api, { ApiErrorResponse } from "@app/services/api";
import Logger, { LogLevel } from "@app/util/Logger";

export default class ScreenStore {
  public readonly BaseScreenId: string = '0290922a-59ce-458b-8dbc-1c33f646580a';

  public async getScreenById(id: string): Promise<GameScreen | undefined> {
    try {
      const result = await Api.get<GameScreenDto>(Endpoints.Screen.getById(id));
      return new GameScreen(result);
    } catch (e) {
      if (e instanceof ApiErrorResponse) {
        // @TODO do something better
        Logger.logError(LogLevel.debug, `API returned error: `, e);
      }

      throw e;
    }
  }
}
