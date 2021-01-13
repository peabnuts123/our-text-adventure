import { handler } from '@app/handlers/get-screen-by-id';
import Command from '@app/db/models/Command';
import GameScreen, { GameScreenDto } from '@app/db/models/GameScreen';
import ErrorId from '@app/errors/ErrorId';

import MockDb from '@test/mocks/mockDb';
import { invokeHandler } from '@test/util/invoke-handler';
import SimpleRequest from '@test/local/util/SimpleRequest';

describe("GetScreenById handler", () => {
  beforeEach(() => {
    MockDb.reset();
  });

  test('Requesting a screen with a valid ID returns the correct screen', async () => {
    // Setup
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });

    MockDb.screens = [
      mockScreen,
      new GameScreen({
        id: 'bcfc72df-4e16-4ef6-b41f-961edcbdf729',
        body: ["Test", "body", "B"],
        commands: [
          new Command({
            id: '2ae7dc7e-a766-401e-9200-a4a0060d3579',
            command: 'look bone',
            targetScreenId: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
            itemsTaken: [],
            itemsGiven: [],
            itemsRequired: [],
          }),
        ],
      }),
    ];

    const mockRequest: SimpleRequest = {
      path: `/screen/${mockScreen.id}`,
      pathParams: {
        id: mockScreen.id,
      },
    };

    const expectedResponse: GameScreenDto = {
      id: mockScreen.id,
      body: mockScreen.body,
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });

  test("Getting a screen with an ID that doesn't exist returns a 404", async () => {
    // Setup
    MockDb.screens = [];

    const mockScreenId = '51e5db90-0587-471f-a281-0b37b7eccb8c';

    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'GenericError',
        modelVersion: 1,
        id: ErrorId.GetScreenById_NoScreenExistsWithId,
        message: `No screen exists with id: ${mockScreenId}`,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/screen/${mockScreenId}`,
      pathParams: {
        id: mockScreenId,
      },
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(404);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });

  test("Making a request with an empty ID param returns a 400", async () => {
    // @NOTE technically this cannot happen, as the id param is a path param, used for routing
    // Setup
    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'id',
        message: "Missing path parameter",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/screen/`,
      pathParams: {
        id: '',
      },
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);


    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
});
