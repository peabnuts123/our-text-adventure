import GameScreen from '@app/db/models/GameScreen';
import IDatabase from '@app/db/IDatabase';

import MockDb from '@test/mocks/mockDb';

describe('MockDB', () => {

  beforeEach(() => {
    MockDb.reset();
  });

  test('Adding mock data works', async () => {
    // Setup
    const mockScreen: GameScreen = new GameScreen(
      '5998098e-5fe4-4d11-a87e-d30c73612ca6',
      ["this", "is", "body"],
      [],
    );

    const db: IDatabase = new MockDb();

    // Test
    await db.addScreen(mockScreen);
    const screen = MockDb.screens[0];

    // Assert
    expect(MockDb.screens.length).toBe(1);
    expect(screen.id).toBe(mockScreen.id);
    expect(screen.body).toBe(mockScreen.body);
    expect(screen.commands).toBe(mockScreen.commands);
  });
});
