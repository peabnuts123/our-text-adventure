import Endpoints from "@app/constants/endpoints";
import GameScreen, { GameScreenDto } from "@app/models/GameScreen";
import Api from "@app/services/api";
import { loggedApiRequest } from "@app/util/logged-api-request";

class ScreenService {
  public async getScreenById(id: string): Promise<GameScreen> {
    return loggedApiRequest(async () => {
      const result = await Api.get<GameScreenDto>(Endpoints.Screen.getById(id));
      return new GameScreen(result);
    });
  }
}

export default new ScreenService();
