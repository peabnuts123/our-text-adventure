import { CommandActionType } from '@app/constants/CommandActionType';
import Messaging from '@app/constants/Messaging';
import Command from '@app/db/models/Command';
import GameScreen from '@app/db/models/GameScreen';
import ErrorId from '@app/errors/ErrorId';
import { handler } from '@app/handlers/command';
import { SubmitCommandDto, SubmitCommandFailureDto, SubmitCommandNavigationSuccessDto, SubmitCommandPrintMessageSuccessDto } from '@app/handlers/command/dto';
import { ClientGameState, encodeClientStateAsString, parseClientStateFromString } from '@app/util/client-state';

import SimpleRequest from '@test/local/util/SimpleRequest';
import MockDb from '@test/mocks/mockDb';
import { invokeHandler } from '@test/util/invoke-handler';

describe("Command handler", () => {
  beforeEach(() => {
    MockDb.reset();
  });

  // @TODO A complex command correctly updates the state string and returns the correct result

  /* VALIDATION TESTS: headers */
  test("Request without JSON header returns 400", async () => {
    // Setup
    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'headers',
        message: "Requests must be JSON with header 'Content-Type: application/json'",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      body: '{}', // @TODO should really be a valid payload, but, whatever
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });

  /* VALIDATION TESTS: body */
  test("Request with empty body returns 400", async () => {
    // Setup
    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'body',
        message: "Missing or empty body",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: '',
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Request with invalid JSON body returns 400", async () => {
    // Setup
    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'body',
        message: "Could not parse body - likely invalid JSON",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{',
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });

  /* VALIDATION TESTS: contextScreenId */
  test("Missing `contextScreenId` property returns 400", async () => {
    // Setup
    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'contextScreenId',
        message: "Field must be a non-empty string",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: 'look bone',
        state: encodeClientStateAsString({
          inventory: [],
        }),
      } as SubmitCommandDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Empty `contextScreenId` property returns 400", async () => {
    // Setup
    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'contextScreenId',
        message: "Field must be a non-empty string",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contextScreenId: '   ',
        command: 'look bone',
        state: encodeClientStateAsString({
          inventory: [],
        }),
      } as SubmitCommandDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Non-string `contextScreenId` property returns 400", async () => {
    // Setup
    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'contextScreenId',
        message: "Field must be a non-empty string",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contextScreenId: 2 as unknown,
        command: 'look bone',
        state: encodeClientStateAsString({
          inventory: [],
        }),
      } as SubmitCommandDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Non-existant value for `contextScreenId` property returns 400", async () => {
    // Setup
    MockDb.screens = [
    ];

    const mockScreenId = 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4';

    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'GenericError',
        modelVersion: 1,
        id: ErrorId.Command_NoContextScreenExistsWithId,
        message: `No source screen exists with id: ${mockScreenId}`,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contextScreenId: mockScreenId,
        command: 'look bone',
        state: encodeClientStateAsString({
          inventory: [],
        }),
      } as SubmitCommandDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });

  /* VALIDATION TESTS: command */
  test("Missing `command` property returns 400", async () => {
    // Setup
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });

    MockDb.screens = [
      mockScreen,
    ];

    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'command',
        message: "Field must be a non-empty string",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contextScreenId: mockScreen.id,
        state: encodeClientStateAsString({
          inventory: [],
        }),
      } as SubmitCommandDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Empty `command` property returns 400", async () => {
    // Setup
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });

    MockDb.screens = [
      mockScreen,
    ];

    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'command',
        message: "Field must be a non-empty string",
      }],
    };

    const mockRequest: SimpleRequest = {
      httpMethod: 'POST', // @TODO put in other tests
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contextScreenId: mockScreen.id,
        command: '   ',
        state: encodeClientStateAsString({
          inventory: [],
        }),
      } as SubmitCommandDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Non-string `command` property returns 400", async () => {
    // Setup
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });

    MockDb.screens = [
      mockScreen,
    ];

    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'command',
        message: "Field must be a non-empty string",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contextScreenId: mockScreen.id,
        command: 2 as unknown,
        state: encodeClientStateAsString({
          inventory: [],
        }),
      } as SubmitCommandDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });

  /* VALIDATION TESTS: state */
  test("Missing `state` property returns 400", async () => {
    // Setup
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });

    MockDb.screens = [
      mockScreen,
    ];

    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'state',
        message: "Field must be a non-empty string",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contextScreenId: mockScreen.id,
        command: 'look bone',
      } as SubmitCommandDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Empty `state` property returns 400", async () => {
    // Setup
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });

    MockDb.screens = [
      mockScreen,
    ];

    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'state',
        message: "Field must be a non-empty string",
      }],
    };

    const mockRequest: SimpleRequest = {
      httpMethod: 'POST', // @TODO put in other tests
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contextScreenId: mockScreen.id,
        command: 'look bone',
        state: '   ',
      } as SubmitCommandDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Non-string `state` property returns 400", async () => {
    // Setup
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });

    MockDb.screens = [
      mockScreen,
    ];

    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'state',
        message: "Field must be a non-empty string",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contextScreenId: mockScreen.id,
        command: 'look bone',
        state: 2 as unknown,
      } as SubmitCommandDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });

  test(`An invalid state string returns a 400`, async () => {
    // Setup
    const mockCommand = 'look bone';
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [
        new Command({
          id: '84ed39a6-9430-45c5-956d-fc97d43b13ae',
          command: mockCommand,
          itemsRequired: [],
          itemsTaken: [],
          itemsGiven: [],
          type: CommandActionType.PrintMessage,
          printMessage: ['This is a', 'test message'],
        }),
      ],
    });

    MockDb.screens = [
      mockScreen,
    ];

    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      message: "An error occurred while parsing state.",
      errors: [{
        model: 'UnknownError',
        modelVersion: 1,
        message: "Cannot parse compressed and encoded state string",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contextScreenId: mockScreen.id,
        command: mockCommand,
        state: '0123456789acbdef',
      } as SubmitCommandDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`An invalid (but correctly encoded) state payload returns a 400`, async () => {
    // Setup
    const mockCommand = 'look bone';
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [
        new Command({
          id: '84ed39a6-9430-45c5-956d-fc97d43b13ae',
          command: mockCommand,
          itemsRequired: [],
          itemsTaken: [],
          itemsGiven: [],
          type: CommandActionType.PrintMessage,
          printMessage: ['This is a', 'test message'],
        }),
      ],
    });

    MockDb.screens = [
      mockScreen,
    ];

    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      message: "An error occurred while parsing state.",
      errors: [{
        model: 'UnknownError',
        modelVersion: 1,
        message: "Parsed state does not appear to be the right type",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contextScreenId: mockScreen.id,
        command: mockCommand,
        state: encodeClientStateAsString({} as any),
      } as SubmitCommandDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });

  test(`A command that does not exist returns a 200 success = false`, async () => {
    // Setup
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });

    MockDb.screens = [
      mockScreen,
    ];

    const expectedResponse: SubmitCommandFailureDto = {
      success: false,
      message: Messaging.NoCommandFound,
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contextScreenId: mockScreen.id,
        command: 'look bone',
        state: encodeClientStateAsString({
          inventory: [],
        }),
      } as SubmitCommandDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });

  test(`A command that requires an item that the state inventory does not have returns an 200, success = false`, async () => {
    // Setup
    const mockCommand = 'look bone';
    const mockRequiredItem = 'Golden Staff';
    const mockInventory: string[] = [];
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [
        new Command({
          id: '84ed39a6-9430-45c5-956d-fc97d43b13ae',
          command: mockCommand,
          itemsRequired: [mockRequiredItem],
          itemsTaken: [],
          itemsGiven: [],
          type: CommandActionType.PrintMessage,
          printMessage: ['This is a', 'test message'],
        }),
      ],
    });

    MockDb.screens = [
      mockScreen,
    ];

    const expectedResponse: SubmitCommandFailureDto = {
      success: false,
      message: Messaging.RequiredItemNotPresent,
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contextScreenId: mockScreen.id,
        command: mockCommand,
        state: encodeClientStateAsString({
          inventory: mockInventory,
        }),
      } as SubmitCommandDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`A command that requires an item does not remove it from the state inventory`, async () => {
    // Setup
    const mockCommand = 'look bone';
    const mockRequiredItem = 'Golden Staff';
    const mockInventory: string[] = [mockRequiredItem];
    const mockPrintMessage: string[] = ['This is a', 'test message'];
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [
        new Command({
          id: '84ed39a6-9430-45c5-956d-fc97d43b13ae',
          command: mockCommand,
          itemsRequired: [mockRequiredItem],
          itemsTaken: [],
          itemsGiven: [],
          type: CommandActionType.PrintMessage,
          printMessage: mockPrintMessage,
        }),
      ],
    });

    MockDb.screens = [
      mockScreen,
    ];

    const expectedInventory: string[] = [mockRequiredItem];
    const expectedResponse: SubmitCommandPrintMessageSuccessDto = {
      success: true,
      type: CommandActionType.PrintMessage,
      state: encodeClientStateAsString({
        inventory: expectedInventory,
      }),
      printMessage: mockPrintMessage,
      itemsAdded: [],
      itemsRemoved: [],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contextScreenId: mockScreen.id,
        command: mockCommand,
        state: encodeClientStateAsString({
          inventory: mockInventory,
        }),
      } as SubmitCommandDto),
    };

    // Test
    const responseRaw = await invokeHandler(handler, mockRequest);
    expect(responseRaw.body && JSON.parse(responseRaw.body)).toEqual(expectedResponse);

    const response: SubmitCommandPrintMessageSuccessDto = JSON.parse(responseRaw.body!) as SubmitCommandPrintMessageSuccessDto;
    const responseState: ClientGameState = parseClientStateFromString(response.state);


    // Assert
    expect(responseRaw.statusCode).toBe(200);
    expect(responseRaw.headers && responseRaw.headers['Content-Type']).toBe('application/json');
    expect(responseState.inventory).toEqual(expectedInventory);
  });

  test(`A command that takes an item that the state inventory does not have returns an 200, success = false`, async () => {
    // Setup
    const mockCommand = 'look bone';
    const mockTakenItem = 'Golden Staff';
    const mockInventory: string[] = [];
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [
        new Command({
          id: '84ed39a6-9430-45c5-956d-fc97d43b13ae',
          command: mockCommand,
          itemsRequired: [],
          itemsTaken: [mockTakenItem],
          itemsGiven: [],
          type: CommandActionType.PrintMessage,
          printMessage: ['This is a', 'test message'],
        }),
      ],
    });

    MockDb.screens = [
      mockScreen,
    ];

    const expectedResponse: SubmitCommandFailureDto = {
      success: false,
      message: Messaging.RequiredItemNotPresent,
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contextScreenId: mockScreen.id,
        command: mockCommand,
        state: encodeClientStateAsString({
          inventory: mockInventory,
        }),
      } as SubmitCommandDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`A command that takes an item removes it from the state inventory`, async () => {
    // Setup
    const mockCommand = 'look bone';
    const mockTakenItem = 'Golden Staff';
    const mockInventory: string[] = [mockTakenItem];
    const mockPrintMessage: string[] = ['This is a', 'test message'];
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [
        new Command({
          id: '84ed39a6-9430-45c5-956d-fc97d43b13ae',
          command: mockCommand,
          itemsRequired: [],
          itemsTaken: [mockTakenItem],
          itemsGiven: [],
          type: CommandActionType.PrintMessage,
          printMessage: mockPrintMessage,
        }),
      ],
    });

    MockDb.screens = [
      mockScreen,
    ];

    const expectedInventory: string[] = [];

    const expectedResponse: SubmitCommandPrintMessageSuccessDto = {
      success: true,
      type: CommandActionType.PrintMessage,
      state: encodeClientStateAsString({
        inventory: expectedInventory,
      }),
      printMessage: mockPrintMessage,
      itemsAdded: [],
      itemsRemoved: [mockTakenItem],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contextScreenId: mockScreen.id,
        command: mockCommand,
        state: encodeClientStateAsString({
          inventory: mockInventory,
        }),
      } as SubmitCommandDto),
    };

    // Test
    const responseRaw = await invokeHandler(handler, mockRequest);
    expect(responseRaw.body && JSON.parse(responseRaw.body)).toEqual(expectedResponse);

    const response: SubmitCommandPrintMessageSuccessDto = JSON.parse(responseRaw.body!) as SubmitCommandPrintMessageSuccessDto;
    const responseState: ClientGameState = parseClientStateFromString(response.state);


    // Assert
    expect(responseRaw.statusCode).toBe(200);
    expect(responseRaw.headers && responseRaw.headers['Content-Type']).toBe('application/json');
    expect(responseState.inventory).toEqual(expectedInventory);
  });

  test(`A command that gives an item adds it to the state inventory`, async () => {
    // Setup
    const mockCommand = 'look bone';
    const mockGivenItem = 'Golden Staff';
    const mockInventory: string[] = [];
    const mockPrintMessage: string[] = ['This is a', 'test message'];
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [
        new Command({
          id: '84ed39a6-9430-45c5-956d-fc97d43b13ae',
          command: mockCommand,
          itemsRequired: [],
          itemsTaken: [],
          itemsGiven: [mockGivenItem],
          limitItemsGiven: false,
          type: CommandActionType.PrintMessage,
          printMessage: mockPrintMessage,
        }),
      ],
    });

    MockDb.screens = [
      mockScreen,
    ];

    const expectedInventory: string[] = [mockGivenItem];

    const expectedResponse: SubmitCommandPrintMessageSuccessDto = {
      success: true,
      type: CommandActionType.PrintMessage,
      state: encodeClientStateAsString({
        inventory: expectedInventory,
      }),
      printMessage: mockPrintMessage,
      itemsAdded: [mockGivenItem],
      itemsRemoved: [],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contextScreenId: mockScreen.id,
        command: mockCommand,
        state: encodeClientStateAsString({
          inventory: mockInventory,
        }),
      } as SubmitCommandDto),
    };

    // Test
    const responseRaw = await invokeHandler(handler, mockRequest);
    expect(responseRaw.body && JSON.parse(responseRaw.body)).toEqual(expectedResponse);

    const response: SubmitCommandPrintMessageSuccessDto = JSON.parse(responseRaw.body!) as SubmitCommandPrintMessageSuccessDto;
    const responseState: ClientGameState = parseClientStateFromString(response.state);


    // Assert
    expect(responseRaw.statusCode).toBe(200);
    expect(responseRaw.headers && responseRaw.headers['Content-Type']).toBe('application/json');
    expect(responseState.inventory).toEqual(expectedInventory);
  });
  test(`A command that limits given items will not give an item if the state inventory already has it`, async () => {
    // Setup
    const mockCommand = 'look bone';
    const mockGivenItemA = 'Golden Staff';
    const mockGivenItemB = 'Blue Orb';
    const mockInventory: string[] = [mockGivenItemA];
    const mockPrintMessage: string[] = ['This is a', 'test message'];
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [
        new Command({
          id: '84ed39a6-9430-45c5-956d-fc97d43b13ae',
          command: mockCommand,
          itemsRequired: [],
          itemsTaken: [],
          itemsGiven: [mockGivenItemA, mockGivenItemB],
          limitItemsGiven: true,
          type: CommandActionType.PrintMessage,
          printMessage: mockPrintMessage,
        }),
      ],
    });

    MockDb.screens = [
      mockScreen,
    ];

    const expectedInventory: string[] = [mockGivenItemA, mockGivenItemB];

    const expectedResponse: SubmitCommandPrintMessageSuccessDto = {
      success: true,
      type: CommandActionType.PrintMessage,
      state: encodeClientStateAsString({
        inventory: expectedInventory,
      }),
      printMessage: mockPrintMessage,
      itemsAdded: [mockGivenItemB],
      itemsRemoved: [],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contextScreenId: mockScreen.id,
        command: mockCommand,
        state: encodeClientStateAsString({
          inventory: mockInventory,
        }),
      } as SubmitCommandDto),
    };

    // Test
    const responseRaw = await invokeHandler(handler, mockRequest);
    expect(responseRaw.body && JSON.parse(responseRaw.body)).toEqual(expectedResponse);

    const response: SubmitCommandPrintMessageSuccessDto = JSON.parse(responseRaw.body!) as SubmitCommandPrintMessageSuccessDto;
    const responseState: ClientGameState = parseClientStateFromString(response.state);


    // Assert
    expect(responseRaw.statusCode).toBe(200);
    expect(responseRaw.headers && responseRaw.headers['Content-Type']).toBe('application/json');
    expect(responseState.inventory).toEqual(expectedInventory);
  });

  test(`A command of type '${CommandActionType.Navigate}' returns a navigation response dto`, async () => {
    // Setup
    const mockCommand = 'look bone';
    const mockInventory: string[] = [];
    const mockScreenA: GameScreen = new GameScreen({
      id: '9ce94f10-8b42-4527-8ada-3405ba4b04f7',
      body: ["Test", "body", "A"],
      commands: [],
    });
    const mockScreenB: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "B"],
      commands: [
        new Command({
          id: '84ed39a6-9430-45c5-956d-fc97d43b13ae',
          command: mockCommand,
          itemsRequired: [],
          itemsTaken: [],
          itemsGiven: [],
          type: CommandActionType.Navigate,
          targetScreenId: mockScreenA.id,
        }),
      ],
    });

    MockDb.screens = [
      mockScreenA,
      mockScreenB,
    ];

    const expectedResponse: SubmitCommandNavigationSuccessDto = {
      success: true,
      state: encodeClientStateAsString({
        inventory: mockInventory,
      }),
      itemsAdded: [],
      itemsRemoved: [],
      screen: mockScreenA.toDto(),
      type: CommandActionType.Navigate,
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contextScreenId: mockScreenB.id,
        command: mockCommand,
        state: encodeClientStateAsString({
          inventory: mockInventory,
        }),
      } as SubmitCommandDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`A command of type '${CommandActionType.PrintMessage}' returns a print message response dto`, async () => {
    // Setup
    const mockCommand = 'look bone';
    const mockInventory: string[] = [];
    const mockPrintMessage: string[] = ['This is a', 'test message'];
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "B"],
      commands: [
        new Command({
          id: '84ed39a6-9430-45c5-956d-fc97d43b13ae',
          command: mockCommand,
          itemsRequired: [],
          itemsTaken: [],
          itemsGiven: [],
          type: CommandActionType.PrintMessage,
          printMessage: mockPrintMessage,
        }),
      ],
    });

    MockDb.screens = [
      mockScreen,
    ];

    const expectedResponse: SubmitCommandPrintMessageSuccessDto = {
      success: true,
      state: encodeClientStateAsString({
        inventory: mockInventory,
      }),
      printMessage: mockPrintMessage,
      itemsAdded: [],
      itemsRemoved: [],
      type: CommandActionType.PrintMessage,

    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contextScreenId: mockScreen.id,
        command: mockCommand,
        state: encodeClientStateAsString({
          inventory: mockInventory,
        }),
      } as SubmitCommandDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });

});
