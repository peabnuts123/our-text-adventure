import { handler } from '@app/handlers/add-path';
import { AddPathDto } from '@app/handlers/add-path/dto';
import GameScreen from '@app/db/models/GameScreen';
import ErrorId from '@app/errors/ErrorId';
import { PathDestinationType } from '@app/constants/PathDestinationType';
import { TERMINAL_MAX_LINE_LENGTH } from '@app/constants';
import { CommandActionType } from '@app/constants/CommandActionType';
import Command from '@app/db/models/Command';

import MockDb from '@test/mocks/mockDb';
import { invokeHandler } from '@test/util/invoke-handler';
import SimpleRequest from '@test/local/util/SimpleRequest';

describe("AddPath handler", () => {
  beforeEach(() => {
    MockDb.reset();
  });

  test("Correct request creates a new path", async () => {
    // Setup
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });

    MockDb.screens = [
      mockScreen,
    ];

    const requestPayload: AddPathDto = {
      sourceScreenId: mockScreen.id,
      command: 'mock bone',
      itemsGiven: ['Key of Goldenrod'],
      limitItemsGiven: false,
      itemsTaken: ['Thunder Badge'],
      itemsRequired: ['Thunder Stone'],
      actionType: CommandActionType.Navigate,
      destinationType: PathDestinationType.New,
      newScreenBody: ["This is a ", "mock screen"],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);
    const responseBody: string = response.body as string;

    // Assert
    expect(responseBody).not.toBeDefined();
    expect(response.statusCode).toBe(201);
    expect(response.headers && response.headers['Content-Type']).toBeUndefined();
    expect(mockScreen.commands.some((c) => c.command === requestPayload.command)).toBe(true); // Command has been appended to correct screen
  });

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

  /* VALIDATION TESTS: `sourceScreenId` property */
  test("Missing `sourceScreenId` property returns 400", async () => {
    // Setup
    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'sourceScreenId',
        message: "Field must be a non-empty string",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: "mock bone",
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ["This is a ", "mock screen"],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Empty `sourceScreenId` property returns 400", async () => {
    // Setup
    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'sourceScreenId',
        message: "Field must be a non-empty string",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: "   ",
        command: "mock bone",
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ["This is a ", "mock screen"],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Non-string `sourceScreenId` property returns 400", async () => {
    // Setup
    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'sourceScreenId',
        message: "Field must be a non-empty string",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: 2 as unknown,
        command: "mock bone",
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ["This is a ", "mock screen"],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Non-existant value for `sourceScreenId` property returns 400", async () => {
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
        id: ErrorId.AddPath_NoSourceScreenExistsWithId,
        message: `No source screen exists with id: ${mockScreenId}`,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreenId,
        command: 'mock bone',
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ["This is a ", "mock screen"],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });

  /* VALIDATION TESTS: `command` property */
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
        sourceScreenId: mockScreen.id,
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ["This is a ", "mock screen"],
      } as AddPathDto),
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
        sourceScreenId: mockScreen.id,
        command: "   ",
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ["This is a ", "mock screen"],
      }),
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
        sourceScreenId: mockScreen.id,
        command: 2 as unknown,
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ["This is a ", "mock screen"],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Specifying property `command` with a value that already exists on screen returns 400", async () => {
    // Setup
    const mockCommand = 'mock command';

    const mockScreenA: GameScreen = new GameScreen({
      id: '8cb9bbeb-51d0-44c9-97eb-0dc04217cac5',
      body: ["Test", "Body", "A"],
      commands: [],
    });
    const mockScreenB: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "B"],
      commands: [
        new Command({
          id: '381ac970-3229-47a5-9650-43ba8cdfe5f9',
          command: mockCommand,
          itemsGiven: [],
          itemsRequired: [],
          itemsTaken: [],
          type: CommandActionType.Navigate,
          targetScreenId: mockScreenA.id,
        }),
      ],
    });

    MockDb.screens = [
      mockScreenA,
      mockScreenB,
    ];

    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'GenericError',
        modelVersion: 1,
        id: ErrorId.AddPath_CommandAlreadyExistsForScreen,
        message: `A command already exists on this screen with name: '${mockCommand}'`,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreenB.id,
        command: mockCommand,
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ["This is a ", "mock screen"],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  // @TODO Whitespace is trimmed from `command` property when saved

  /* VALIDATION TESTS: `itemsTaken` property */
  test("Array of non-strings for `itemsTaken` property returns 400", async () => {
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
        field: 'itemsTaken',
        message: "Field must be an array of strings",
      }],
    };

    const mockRequest: SimpleRequest = {
      httpMethod: 'POST',
      path: `/path`,
      headers: {
        [`Content-Type`]: 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: 'look bone',
        itemsTaken: [
          "String",
          2,
          true,
        ],
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ["This is a", "mock screen"],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);


    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Non-array `itemsTaken` property returns 400", async () => {
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
        field: 'itemsTaken',
        message: "Field must be an array of strings",
      }],
    };

    const mockRequest: SimpleRequest = {
      httpMethod: 'POST',
      path: `/path`,
      headers: {
        [`Content-Type`]: 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: 'look bone',
        itemsTaken: 2 as unknown,
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ["This is a", "mock screen"],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);


    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Empty strings are removed from \`itemsTaken\` property when saved`, async () => {
    // Setup
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });
    const mockItemA = 'Key of Goldenrod';
    const mockItemB = 'Rambotan';

    MockDb.screens = [
      mockScreen,
    ];

    const requestPayload: AddPathDto = {
      sourceScreenId: mockScreen.id,
      command: 'mock bone',
      itemsTaken: [mockItemA, '    ', '', mockItemB], // Add whatever bullshit unicode tests you want here
      actionType: CommandActionType.Navigate,
      destinationType: PathDestinationType.New,
      newScreenBody: ["This is a ", "mock screen"],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);
    const responseBody: string = response.body as string;

    const newCommand: Command = mockScreen.commands.find((c) => c.isEquivalentTo(requestPayload.command!)) as Command;

    // Assert
    expect(responseBody).not.toBeDefined();
    expect(response.statusCode).toBe(201);
    expect(response.headers && response.headers['Content-Type']).toBeUndefined();
    expect(newCommand.itemsTaken).toEqual([mockItemA, mockItemB]);
  });
  test(`Whitespace is trimmed from item names specified in \`itemsTaken\` property when saved`, async () => {
    // Setup
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });
    const mockItemA = '    Key of Goldenrod               ';
    const mockItemB = '            Rambotan    ';

    MockDb.screens = [
      mockScreen,
    ];

    const requestPayload: AddPathDto = {
      sourceScreenId: mockScreen.id,
      command: 'mock bone',
      itemsTaken: [mockItemA, '    ', '', mockItemB], // Add whatever bullshit unicode tests you want here
      actionType: CommandActionType.Navigate,
      destinationType: PathDestinationType.New,
      newScreenBody: ["This is a ", "mock screen"],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);
    const responseBody: string = response.body as string;

    const newCommand: Command = mockScreen.commands.find((c) => c.isEquivalentTo(requestPayload.command!)) as Command;

    // Assert
    expect(responseBody).not.toBeDefined();
    expect(response.statusCode).toBe(201);
    expect(response.headers && response.headers['Content-Type']).toBeUndefined();
    expect(newCommand.itemsTaken).toEqual([mockItemA.trim(), mockItemB.trim()]);
  });

  /* VALIDATION TESTS: `itemsGiven` property */
  test("Array of non-strings for `itemsGiven` property returns 400", async () => {
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
        field: 'itemsGiven',
        message: "Field must be an array of strings",
      }],
    };

    const mockRequest: SimpleRequest = {
      httpMethod: 'POST',
      path: `/path`,
      headers: {
        [`Content-Type`]: 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: 'look bone',
        itemsGiven: [
          "String",
          2,
          true,
        ],
        limitItemsGiven: false,
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ["This is a", "mock screen"],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);


    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Non-array `itemsGiven` property returns 400", async () => {
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
        field: 'itemsGiven',
        message: "Field must be an array of strings",
      }],
    };

    const mockRequest: SimpleRequest = {
      httpMethod: 'POST',
      path: `/path`,
      headers: {
        [`Content-Type`]: 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: 'look bone',
        itemsGiven: 2 as unknown,
        limitItemsGiven: false,
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ["This is a", "mock screen"],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);


    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Empty strings are removed from \`itemsGiven\` property when saved`, async () => {
    // Setup
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });
    const mockItemA = 'Key of Goldenrod';
    const mockItemB = 'Rambotan';

    MockDb.screens = [
      mockScreen,
    ];

    const requestPayload: AddPathDto = {
      sourceScreenId: mockScreen.id,
      command: 'mock bone',
      itemsGiven: [mockItemA, '    ', '', mockItemB], // Add whatever bullshit unicode tests you want here
      limitItemsGiven: false,
      actionType: CommandActionType.Navigate,
      destinationType: PathDestinationType.New,
      newScreenBody: ["This is a ", "mock screen"],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);
    const responseBody: string = response.body as string;

    const newCommand: Command = mockScreen.commands.find((c) => c.isEquivalentTo(requestPayload.command!)) as Command;

    // Assert
    expect(responseBody).not.toBeDefined();
    expect(response.statusCode).toBe(201);
    expect(response.headers && response.headers['Content-Type']).toBeUndefined();
    expect(newCommand.itemsGiven).toEqual([mockItemA, mockItemB]);
  });
  test(`Whitespace is trimmed from item names specified in \`itemsGiven\` property when saved`, async () => {
    // Setup
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });
    const mockItemA = '    Key of Goldenrod               ';
    const mockItemB = '            Rambotan    ';

    MockDb.screens = [
      mockScreen,
    ];

    const requestPayload: AddPathDto = {
      sourceScreenId: mockScreen.id,
      command: 'mock bone',
      itemsGiven: [mockItemA, '    ', '', mockItemB], // Add whatever bullshit unicode tests you want here
      limitItemsGiven: false,
      actionType: CommandActionType.Navigate,
      destinationType: PathDestinationType.New,
      newScreenBody: ["This is a ", "mock screen"],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);
    const responseBody: string = response.body as string;

    const newCommand: Command = mockScreen.commands.find((c) => c.isEquivalentTo(requestPayload.command!)) as Command;

    // Assert
    expect(responseBody).not.toBeDefined();
    expect(response.statusCode).toBe(201);
    expect(response.headers && response.headers['Content-Type']).toBeUndefined();
    expect(newCommand.itemsGiven).toEqual([mockItemA.trim(), mockItemB.trim()]);
  });

  /* VALIDATION TESTS: `limitItemsGiven` property */
  test(`Specifying property \`limitItemsGiven\` when \`itemsGiven\` is not provided returns 400`, async () => {
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
        field: 'limitItemsGiven',
        message: "Field can only be provided if `itemsGiven` is not empty",
      }],
    };

    const mockRequest: SimpleRequest = {
      httpMethod: 'POST',
      path: `/path`,
      headers: {
        [`Content-Type`]: 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: 'look bone',
        limitItemsGiven: false,
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ["This is a", "mock screen"],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);


    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Specifying property \`limitItemsGiven\` when \`itemsGiven\` is empty returns 400`, async () => {
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
        field: 'limitItemsGiven',
        message: "Field can only be provided if `itemsGiven` is not empty",
      }],
    };

    const mockRequest: SimpleRequest = {
      httpMethod: 'POST',
      path: `/path`,
      headers: {
        [`Content-Type`]: 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: 'look bone',
        itemsGiven: [],
        limitItemsGiven: false,
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ["This is a", "mock screen"],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);


    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Missing \`limitItemsGiven\` property when \`itemsGiven\` is provided returns 400`, async () => {
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
        field: 'limitItemsGiven',
        message: "Field must be a boolean",
      }],
    };

    const mockRequest: SimpleRequest = {
      httpMethod: 'POST',
      path: `/path`,
      headers: {
        [`Content-Type`]: 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: 'look bone',
        itemsGiven: ['Book of rambotan'],
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ["This is a", "mock screen"],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);


    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Non-boolean \`limitItemsGiven\` property returns 400`, async () => {
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
        field: 'limitItemsGiven',
        message: "Field must be a boolean",
      }],
    };

    const mockRequest: SimpleRequest = {
      httpMethod: 'POST',
      path: `/path`,
      headers: {
        [`Content-Type`]: 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: 'look bone',
        itemsGiven: ['Book of rambotan'],
        limitItemsGiven: 2 as unknown,
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ["This is a", "mock screen"],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);


    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });

  /* VALIDATION TESTS: `itemsRequired` property */
  test("Array of non-strings for `itemsRequired` property returns 400", async () => {
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
        field: 'itemsRequired',
        message: "Field must be an array of strings",
      }],
    };

    const mockRequest: SimpleRequest = {
      httpMethod: 'POST',
      path: `/path`,
      headers: {
        [`Content-Type`]: 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: 'look bone',
        itemsRequired: [
          "String",
          2,
          true,
        ],
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ["This is a", "mock screen"],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);


    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Non-array `itemsRequired` property returns 400", async () => {
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
        field: 'itemsRequired',
        message: "Field must be an array of strings",
      }],
    };

    const mockRequest: SimpleRequest = {
      httpMethod: 'POST',
      path: `/path`,
      headers: {
        [`Content-Type`]: 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: 'look bone',
        itemsRequired: 2 as unknown,
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ["This is a", "mock screen"],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);


    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Empty strings are removed from \`itemsRequired\` property when saved`, async () => {
    // Setup
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });
    const mockItemA = 'Key of Goldenrod';
    const mockItemB = 'Rambotan';

    MockDb.screens = [
      mockScreen,
    ];

    const requestPayload: AddPathDto = {
      sourceScreenId: mockScreen.id,
      command: 'mock bone',
      itemsRequired: [mockItemA, '    ', '', mockItemB], // Add whatever bullshit unicode tests you want here
      actionType: CommandActionType.Navigate,
      destinationType: PathDestinationType.New,
      newScreenBody: ["This is a ", "mock screen"],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);
    const responseBody: string = response.body as string;

    const newCommand: Command = mockScreen.commands.find((c) => c.isEquivalentTo(requestPayload.command!)) as Command;

    // Assert
    expect(responseBody).not.toBeDefined();
    expect(response.statusCode).toBe(201);
    expect(response.headers && response.headers['Content-Type']).toBeUndefined();
    expect(newCommand.itemsRequired).toEqual([mockItemA, mockItemB]);
  });
  test(`Whitespace is trimmed from item names specified in \`itemsRequired\` property when saved`, async () => {
    // Setup
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });
    const mockItemA = '    Key of Goldenrod               ';
    const mockItemB = '            Rambotan    ';

    MockDb.screens = [
      mockScreen,
    ];

    const requestPayload: AddPathDto = {
      sourceScreenId: mockScreen.id,
      command: 'mock bone',
      itemsRequired: [mockItemA, '    ', '', mockItemB], // Add whatever bullshit unicode tests you want here
      actionType: CommandActionType.Navigate,
      destinationType: PathDestinationType.New,
      newScreenBody: ["This is a ", "mock screen"],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);
    const responseBody: string = response.body as string;

    const newCommand: Command = mockScreen.commands.find((c) => c.isEquivalentTo(requestPayload.command!)) as Command;

    // Assert
    expect(responseBody).not.toBeDefined();
    expect(response.statusCode).toBe(201);
    expect(response.headers && response.headers['Content-Type']).toBeUndefined();
    expect(newCommand.itemsRequired).toEqual([mockItemA.trim(), mockItemB.trim()]);
  });

  /* VALIDATION TESTS: `actionType` property */
  test("Missing `actionType` property returns 400", async () => {
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
        field: 'actionType',
        message: `Field must be a non-empty string with value either '${CommandActionType.Navigate}' or '${CommandActionType.PrintMessage}'`,
      }],
    };

    const mockRequest: SimpleRequest = {
      httpMethod: 'POST',
      path: `/path`,
      headers: {
        [`Content-Type`]: 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: 'look bone',
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);


    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Empty `actionType` property returns 400", async () => {
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
        field: 'actionType',
        message: `Field must be a non-empty string with value either '${CommandActionType.Navigate}' or '${CommandActionType.PrintMessage}'`,
      }],
    };

    const mockRequest: SimpleRequest = {
      httpMethod: 'POST',
      path: `/path`,
      headers: {
        [`Content-Type`]: 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: 'look bone',
        actionType: '  ' as unknown,
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);


    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Non-string `actionType` property returns 400", async () => {
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
        field: 'actionType',
        message: `Field must be a non-empty string with value either '${CommandActionType.Navigate}' or '${CommandActionType.PrintMessage}'`,
      }],
    };

    const mockRequest: SimpleRequest = {
      httpMethod: 'POST',
      path: `/path`,
      headers: {
        [`Content-Type`]: 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: 'look bone',
        actionType: 2 as unknown,
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);


    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Invalid enum value for `actionType` property returns 400", async () => {
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
        field: 'actionType',
        message: `Field must be a non-empty string with value either '${CommandActionType.Navigate}' or '${CommandActionType.PrintMessage}'`,
      }],
    };

    const mockRequest: SimpleRequest = {
      httpMethod: 'POST',
      path: `/path`,
      headers: {
        [`Content-Type`]: 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: 'look bone',
        actionType: 'something' as unknown,
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);


    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });

  /* VALIDATION TESTS: `destinationType` property */
  test(`Missing \`destinationType\` property when actionType is '${CommandActionType.Navigate}' returns 400`, async () => {
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
        field: 'destinationType',
        message: `Field must be a string with value either '${PathDestinationType.New}' or '${PathDestinationType.Existing}' when \`actionType === '${CommandActionType.Navigate}'\``,
      }],
    };

    const mockRequest: SimpleRequest = {
      httpMethod: 'POST',
      path: `/path`,
      headers: {
        [`Content-Type`]: 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: 'look bone',
        actionType: CommandActionType.Navigate,
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);


    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Specifying property \`destinationType\` when field \`actionType\` is not '${CommandActionType.Navigate}' returns 400`, async () => {
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
        field: 'destinationType',
        message: `Field can only be provided when \`actionType === '${CommandActionType.Navigate}'\``,
      }],
    };

    const mockRequest: SimpleRequest = {
      httpMethod: 'POST',
      path: `/path`,
      headers: {
        [`Content-Type`]: 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: 'look bone',
        actionType: CommandActionType.PrintMessage,
        destinationType: PathDestinationType.New,
        printMessage: ['This is a', 'mock message'],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);


    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Empty `destinationType` property returns 400", async () => {
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
        field: 'destinationType',
        message: `Field must be a string with value either '${PathDestinationType.New}' or '${PathDestinationType.Existing}' when \`actionType === '${CommandActionType.Navigate}'\``,
      }],
    };

    const mockRequest: SimpleRequest = {
      httpMethod: 'POST',
      path: `/path`,
      headers: {
        [`Content-Type`]: 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: 'look bone',
        actionType: CommandActionType.Navigate,
        destinationType: '  ' as unknown,
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);


    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Non-string `destinationType` property returns 400", async () => {
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
        field: 'destinationType',
        message: `Field must be a string with value either '${PathDestinationType.New}' or '${PathDestinationType.Existing}' when \`actionType === '${CommandActionType.Navigate}'\``,
      }],
    };

    const mockRequest: SimpleRequest = {
      httpMethod: 'POST',
      path: `/path`,
      headers: {
        [`Content-Type`]: 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: 'look bone',
        actionType: CommandActionType.Navigate,
        destinationType: 2 as unknown,
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);


    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Invalid enum value for `destinationType` property returns 400", async () => {
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
        field: 'destinationType',
        message: `Field must be a string with value either '${PathDestinationType.New}' or '${PathDestinationType.Existing}' when \`actionType === '${CommandActionType.Navigate}'\``,
      }],
    };

    const mockRequest: SimpleRequest = {
      httpMethod: 'POST',
      path: `/path`,
      headers: {
        [`Content-Type`]: 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: 'look bone',
        actionType: CommandActionType.Navigate,
        destinationType: 'something' as unknown,
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);


    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });

  /* VALIDATION TESTS: `newScreenBody` property */
  test(`Missing \`newScreenBody\` property returns 400 when \`destinationType\` === '${PathDestinationType.New}' and \`actionType\` === '${CommandActionType.Navigate}'`, async () => {
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
        field: 'newScreenBody',
        message: `Field must be a non-empty array of strings when \`actionType === '${CommandActionType.Navigate}'\` and \`destinationType === '${PathDestinationType.New}'\``,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: "mock bone",
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Non-array \`newScreenBody\` property returns 400 when \`destinationType\` === '${PathDestinationType.New}' and \`actionType\` === '${CommandActionType.Navigate}'`, async () => {
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
        field: 'newScreenBody',
        message: `Field must be a non-empty array of strings when \`actionType === '${CommandActionType.Navigate}'\` and \`destinationType === '${PathDestinationType.New}'\``,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: "mock bone",
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: "This is a mock screen" as unknown,
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Array of non-strings for \`newScreenBody\` property returns 400 when \`destinationType\` === '${PathDestinationType.New}' and \`actionType\` === '${CommandActionType.Navigate}'`, async () => {
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
        field: 'newScreenBody',
        message: `Field must be a non-empty array of strings when \`actionType === '${CommandActionType.Navigate}'\` and \`destinationType === '${PathDestinationType.New}'\``,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: "mock bone",
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: [
          "String",
          2,
          true,
        ],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Empty array for \`newScreenBody\` property returns 400 when \`destinationType\` === '${PathDestinationType.New}' and \`actionType\` === '${CommandActionType.Navigate}'`, async () => {
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
        field: 'newScreenBody',
        message: `Field must be a non-empty array of strings when \`actionType === '${CommandActionType.Navigate}'\` and \`destinationType === '${PathDestinationType.New}'\``,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: "mock bone",
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: [],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Array of empty strings for \`newScreenBody\` property returns 400 when \`destinationType\` === '${PathDestinationType.New}' and \`actionType\` === '${CommandActionType.Navigate}'`, async () => {
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
        field: 'newScreenBody',
        message: `Field must be a non-empty array of strings when \`actionType === '${CommandActionType.Navigate}'\` and \`destinationType === '${PathDestinationType.New}'\``,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: "mock bone",
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ['   ', '   '],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Specifying property \`newScreenBody\` when \`actionType\` !== '${CommandActionType.Navigate}' returns 400`, async () => {
    // Setup
    const mockSourceScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });
    const mockTargetScreen: GameScreen = new GameScreen({
      id: 'ac9528f2-86d2-485f-b0ab-5542ba70cd2c',
      body: ["Test", "body", "B"],
      commands: [],
    });

    MockDb.screens = [
      mockSourceScreen,
      mockTargetScreen,
    ];

    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'newScreenBody',
        message: `Field can only be provided when \`actionType === '${CommandActionType.Navigate}'\` and \`destinationType === '${PathDestinationType.New}'\``,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockSourceScreen.id,
        command: "mock bone",
        actionType: CommandActionType.PrintMessage,
        newScreenBody: ['This is a', 'mock screen'],
        printMessage: ['This is a', 'mock message'],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Specifying property \`newScreenBody\` when \`destinationType\` !== '${PathDestinationType.New}' returns 400`, async () => {
    // Setup
    const mockSourceScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });
    const mockTargetScreen: GameScreen = new GameScreen({
      id: 'ac9528f2-86d2-485f-b0ab-5542ba70cd2c',
      body: ["Test", "body", "B"],
      commands: [],
    });

    MockDb.screens = [
      mockSourceScreen,
      mockTargetScreen,
    ];

    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'newScreenBody',
        message: `Field can only be provided when \`actionType === '${CommandActionType.Navigate}'\` and \`destinationType === '${PathDestinationType.New}'\``,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockSourceScreen.id,
        command: "mock bone",
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.Existing,
        existingScreenId: mockTargetScreen.id,
        newScreenBody: ['This is a', 'mock screen'],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Specifying property \`newScreenBody\` with any lines bigger than ${TERMINAL_MAX_LINE_LENGTH} are invalid`, async () => {
    // Setup
    const mockSourceScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });
    const mockTargetScreen: GameScreen = new GameScreen({
      id: 'ac9528f2-86d2-485f-b0ab-5542ba70cd2c',
      body: ["Test", "body", "B"],
      commands: [],
    });

    MockDb.screens = [
      mockSourceScreen,
      mockTargetScreen,
    ];

    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'newScreenBody',
        message: `Maximum line length of ${TERMINAL_MAX_LINE_LENGTH} exceeded`,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockSourceScreen.id,
        command: "mock bone",
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ['This is a', 'mock screen', 'with a really long line: ', new Array(2 * TERMINAL_MAX_LINE_LENGTH).join('A')],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });

  /* VALIDATION TESTS: `existingScreenId` property */
  test(`Missing \`existingScreenId\` property returns 400 when \`destinationType\` === '${PathDestinationType.Existing}' and \`actionType\` === '${CommandActionType.Navigate}'`, async () => {
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
        field: 'existingScreenId',
        message: "Field must be a non-empty string",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: "mock bone",
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.Existing,
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Empty \`existingScreenId\` property returns 400 when \`destinationType\` === '${PathDestinationType.Existing}' and \`actionType\` === '${CommandActionType.Navigate}'`, async () => {
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
        field: 'existingScreenId',
        message: "Field must be a non-empty string",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: "mock bone",
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.Existing,
        existingScreenId: "   ",
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Non-string \`existingScreenId\` property returns 400 when \`destinationType\` === '${PathDestinationType.Existing}' and \`actionType\` === '${CommandActionType.Navigate}'`, async () => {
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
        field: 'existingScreenId',
        message: "Field must be a non-empty string",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: "mock bone",
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.Existing,
        existingScreenId: 2 as unknown,
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Non-existant value for \`existingScreenId\` property returns 400 when \`destinationType\` === '${PathDestinationType.Existing}' and \`actionType\` === '${CommandActionType.Navigate}'`, async () => {
    // Setup
    const mockScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });

    MockDb.screens = [
      mockScreen,
    ];

    const mockScreenId = 'ac9528f2-86d2-485f-b0ab-5542ba70cd2c';

    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'GenericError',
        modelVersion: 1,
        id: ErrorId.AddPath_NoDestinationScreenExistsWithId,
        message: `No existing destination screen exists with id: ${mockScreenId}`,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: 'mock bone',
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.Existing,
        existingScreenId: mockScreenId,
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Specifying property \`existingScreenId\` when \`actionType\` !== '${CommandActionType.Navigate}' returns 400`, async () => {
    // Setup
    const mockSourceScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });
    const mockTargetScreen: GameScreen = new GameScreen({
      id: 'ac9528f2-86d2-485f-b0ab-5542ba70cd2c',
      body: ["Test", "body", "B"],
      commands: [],
    });

    MockDb.screens = [
      mockSourceScreen,
      mockTargetScreen,
    ];

    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'existingScreenId',
        message: `Field can only be provided when \`actionType === '${CommandActionType.Navigate}'\` and \`destinationType === '${PathDestinationType.Existing}'\``,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockSourceScreen.id,
        command: "mock bone",
        actionType: CommandActionType.PrintMessage,
        printMessage: ['This is a', 'mock message'],
        existingScreenId: mockTargetScreen.id,
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Specifying property \`existingScreenId\` when \`destinationType\` !== '${PathDestinationType.Existing}' returns 400`, async () => {
    // Setup
    const mockSourceScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });
    const mockTargetScreen: GameScreen = new GameScreen({
      id: 'ac9528f2-86d2-485f-b0ab-5542ba70cd2c',
      body: ["Test", "body", "B"],
      commands: [],
    });

    MockDb.screens = [
      mockSourceScreen,
      mockTargetScreen,
    ];

    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'existingScreenId',
        message: `Field can only be provided when \`actionType === '${CommandActionType.Navigate}'\` and \`destinationType === '${PathDestinationType.Existing}'\``,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockSourceScreen.id,
        command: "mock bone",
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ['This is a', 'mock screen'],
        existingScreenId: mockTargetScreen.id,
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Specifying property \`existingScreenId\` with same value as \`sourceScreenId\` returns 400`, async () => {
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
        field: 'existingScreenId',
        message: "Field cannot have the same value as `sourceScreenId`",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: "mock bone",
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.Existing,
        existingScreenId: mockScreen.id,
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });

  /* VALIDATION TESTS: `printMessage` property */
  test(`Missing \`printMessage\` property returns 400 when \`actionType\` === '${CommandActionType.PrintMessage}'`, async () => {
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
        field: 'printMessage',
        message: `Field must be a non-empty array of strings when \`actionType === '${CommandActionType.PrintMessage}'\``,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: "mock bone",
        actionType: CommandActionType.PrintMessage,
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Non-array \`printMessage\` property returns 400 when \`actionType\` === '${CommandActionType.PrintMessage}'`, async () => {
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
        field: 'printMessage',
        message: `Field must be a non-empty array of strings when \`actionType === '${CommandActionType.PrintMessage}'\``,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: "mock bone",
        actionType: CommandActionType.PrintMessage,
        printMessage: "This is a mock screen" as unknown,
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Array of non-strings for \`printMessage\` property returns 400 when \`actionType\` === '${CommandActionType.PrintMessage}'`, async () => {
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
        field: 'printMessage',
        message: `Field must be a non-empty array of strings when \`actionType === '${CommandActionType.PrintMessage}'\``,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: "mock bone",
        actionType: CommandActionType.PrintMessage,
        printMessage: [
          "String",
          2,
          true,
        ],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Empty array for \`printMessage\` property returns 400 when \`actionType\` === '${CommandActionType.PrintMessage}'`, async () => {
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
        field: 'printMessage',
        message: `Field must be a non-empty array of strings when \`actionType === '${CommandActionType.PrintMessage}'\``,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: "mock bone",
        actionType: CommandActionType.PrintMessage,
        printMessage: [],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Array of empty strings for \`printMessage\` property returns 400 when \`actionType\` === '${CommandActionType.PrintMessage}'`, async () => {
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
        field: 'printMessage',
        message: `Field must be a non-empty array of strings when \`actionType === '${CommandActionType.PrintMessage}'\``,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreen.id,
        command: "mock bone",
        actionType: CommandActionType.PrintMessage,
        printMessage: ['   ', '   '],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Specifying property \`printMessage\` when \`actionType\` !== '${CommandActionType.PrintMessage}' returns 400`, async () => {
    // Setup
    const mockSourceScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });
    const mockTargetScreen: GameScreen = new GameScreen({
      id: 'ac9528f2-86d2-485f-b0ab-5542ba70cd2c',
      body: ["Test", "body", "B"],
      commands: [],
    });

    MockDb.screens = [
      mockSourceScreen,
      mockTargetScreen,
    ];

    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'printMessage',
        message: `Field can only be provided when \`actionType === '${CommandActionType.PrintMessage}'\``,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockSourceScreen.id,
        command: "mock bone",
        actionType: CommandActionType.Navigate,
        destinationType: PathDestinationType.New,
        newScreenBody: ['This is a', 'mock screen'],
        printMessage: ['This is a', 'mock message'],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test(`Specifying property \`printMessage\` with any lines bigger than ${TERMINAL_MAX_LINE_LENGTH} are invalid`, async () => {
    // Setup
    const mockSourceScreen: GameScreen = new GameScreen({
      id: 'd9ba40f7-cc19-485b-88c9-43aae7fd32d4',
      body: ["Test", "body", "A"],
      commands: [],
    });
    const mockTargetScreen: GameScreen = new GameScreen({
      id: 'ac9528f2-86d2-485f-b0ab-5542ba70cd2c',
      body: ["Test", "body", "B"],
      commands: [],
    });

    MockDb.screens = [
      mockSourceScreen,
      mockTargetScreen,
    ];

    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'printMessage',
        message: `Maximum line length of ${TERMINAL_MAX_LINE_LENGTH} exceeded`,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockSourceScreen.id,
        command: "mock bone",
        actionType: CommandActionType.PrintMessage,
        printMessage: ['This is a', 'mock screen', 'with a really long line: ', new Array(2 * TERMINAL_MAX_LINE_LENGTH).join('A')],
      } as AddPathDto),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
});
