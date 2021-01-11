import Endpoints from "@app/constants/endpoints";
import GameScreen, { GameScreenDto } from "@app/models/GameScreen";
import Api, { ApiErrorResponse } from "@app/services/api";
import Logger, { LogLevel } from "@app/util/Logger";

export default class ScreenStore {
  public async getScreenById(id: string): Promise<GameScreen> {
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
