import { handler } from '@app/handlers/test';
import GameScreen from '@app/db/models/GameScreen';
import Command from '@app/db/models/Command';
import { CommandActionType } from '@app/constants/CommandActionType';

import SimpleRequest from '@test/local/util/SimpleRequest';
import { invokeHandler } from '@test/util/invoke-handler';
import MockDb from '@test/mocks/mockDb';

describe('Test Handler', () => {
  beforeEach(() => {
    MockDb.reset();
  });

  test('returns all screen data', async () => {
    // Setup
    const mockScreens: GameScreen[] = [
      new GameScreen({
        id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
        body: ["Test", "body", "A"],
        commands: [],
      }),
      new GameScreen({
        id: 'bcfc72df-4e16-4ef6-b41f-961edcbdf729',
        body: ["Test", "body", "B"],
        commands: [
          new Command({
            id: '2ae7dc7e-a766-401e-9200-a4a0060d3579',
            command: 'look bone',
            type: CommandActionType.Navigate,
            targetScreenId: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
            itemsTaken: [],
            itemsGiven: [],
            itemsRequired: [],
          }),
        ],
      }),
    ];
    const mockRequest: SimpleRequest = {
      path: "/test/123456",
    };

    MockDb.screens = mockScreens;

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.headers).toBeDefined();
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual({
      message: "[DEBUG] All screens",
      allScreens: mockScreens,
    });
  });
});
