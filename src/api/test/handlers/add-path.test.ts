import { handler } from '@app/handlers/add-path';
import { AddPathDto } from '@app/handlers/add-path/dto';
import GameScreen from '@app/db/models/GameScreen';
import ErrorId from '@app/errors/ErrorId';
import { PathDestinationType } from '@app/constants/PathDestinationType';
import { GAME_SCREEN_MAX_LINE_LENGTH } from '@app/constants';

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
      newScreenBody: ["This is a ", "mock screen"],
      command: 'mock bone',
      destinationType: PathDestinationType.New,
      itemsGiven: ['Key of Goldenrod'],
      itemsTaken: ['Thunder Badge'],
      itemsRequired: ['Thunder Stone'],
    };

    const expectedResponse = {
      body: requestPayload.newScreenBody,
      commands: [],
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
    const responseBodyRaw: string = response.body as string;
    expect(responseBodyRaw).toBeDefined();
    const responseBody = JSON.parse(responseBodyRaw) as GameScreen;

    // Assert
    expect(response.statusCode).toBe(201);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(responseBody.body).toEqual(expectedResponse.body); // New screen has correct body
    expect(mockScreen.commands.some((c) => c.command === requestPayload.command)).toBe(true); // Command has been appended to correct screen
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
        newScreenBody: ["This is a ", "mock screen"],
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
        newScreenBody: ["This is a ", "mock screen"],
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
        newScreenBody: ["This is a ", "mock screen"],
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
        newScreenBody: ["This is a ", "mock screen"],
        command: 'mock bone',
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
        newScreenBody: ["This is a ", "mock screen"],
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
        command: "   ",
        sourceScreenId: mockScreen.id,
        newScreenBody: ["This is a ", "mock screen"],
        destinationType: PathDestinationType.New,
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
        command: 2 as unknown,
        sourceScreenId: mockScreen.id,
        newScreenBody: ["This is a ", "mock screen"],
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

  /* VALIDATION TESTS: `destinationType` property */
  test("Missing `destinationType` property returns 400", async () => {
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
        message: "Field must be a non-empty string with value either 'new' or 'existing'",
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
        message: "Field must be a non-empty string with value either 'new' or 'existing'",
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
        message: "Field must be a non-empty string with value either 'new' or 'existing'",
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
  test("Missing `newScreenBody` property returns 400 when destinationType === 'new'", async () => {
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
        message: "Field must be a non-empty array of strings when `destinationType === 'new'`",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: "mock bone",
        sourceScreenId: mockScreen.id,
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
  test("Non-array `newScreenBody` property returns 400 when destinationType === 'new'", async () => {
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
        message: "Field must be a non-empty array of strings when `destinationType === 'new'`",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newScreenBody: "This is a mock screen" as unknown,
        command: "mock bone",
        sourceScreenId: mockScreen.id,
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
  test("Array of non-strings for `newScreenBody` property returns 400 when destinationType === 'new'", async () => {
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
        message: "Field must be a non-empty array of strings when `destinationType === 'new'`",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newScreenBody: [
          "String",
          2,
          true,
        ],
        command: "mock bone",
        sourceScreenId: mockScreen.id,
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
  test("Empty array for `newScreenBody` property returns 400 when destinationType === 'new'", async () => {
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
        message: "Field must be a non-empty array of strings when `destinationType === 'new'`",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newScreenBody: [],
        command: "mock bone",
        sourceScreenId: mockScreen.id,
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
  test("array of empty strings for `newScreenBody` property returns 400 when destinationType === 'new'", async () => {
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
        message: "Field must be a non-empty array of strings when `destinationType === 'new'`",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newScreenBody: ['   ', '   '],
        command: "mock bone",
        sourceScreenId: mockScreen.id,
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
  test("Specifying property `newScreenBody` when destinationType !== 'new' returns 400", async () => {
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
        message: "Field can only be specified when `destinationType === 'new'`",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newScreenBody: ['This is a', 'mock screen'],
        command: "mock bone",
        sourceScreenId: mockSourceScreen.id,
        destinationType: PathDestinationType.Existing,
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
  test(`Specifying property \`newScreenBody\` with any lines bigger than ${GAME_SCREEN_MAX_LINE_LENGTH} are invalid`, async () => {
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
        message: `Maximum line length of ${GAME_SCREEN_MAX_LINE_LENGTH} exceeded`,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newScreenBody: ['This is a', 'mock screen', 'with a really long line: ', new Array(2*GAME_SCREEN_MAX_LINE_LENGTH).join('A')],
        command: "mock bone",
        sourceScreenId: mockSourceScreen.id,
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

  /* VALIDATION TESTS: `existingScreenId` property */
  test("Missing `existingScreenId` property returns 400 when destinationType === 'existing'", async () => {
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
        command: "mock bone",
        sourceScreenId: mockScreen.id,
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
  test("Empty `existingScreenId` property returns 400 when destinationType === 'existing'", async () => {
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
        existingScreenId: "   ",
        command: "mock bone",
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
  test("Non-string `existingScreenId` property returns 400 when destinationType === 'existing'", async () => {
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
        existingScreenId: 2 as unknown,
        command: "mock bone",
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
  test("Non-existant value for `existingScreenId` property returns 400 when destinationType === 'existing'", async () => {
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
        existingScreenId: mockScreenId,
        command: 'mock bone',
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
  test("Specifying property `existingScreenId` when destinationType !== 'existing' returns 400", async () => {
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
        message: "Field can only be specified when `destinationType === 'existing'`",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newScreenBody: ['This is a', 'mock screen'],
        command: "mock bone",
        sourceScreenId: mockSourceScreen.id,
        destinationType: PathDestinationType.New,
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
  test("Specifying property `existingScreenId` with same value as `sourceScreenId` returns 400", async () => {
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
        command: "mock bone",
        sourceScreenId: mockScreen.id,
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

});


/**
 * TEST BACKLOG
 *  - Specifying property `command` with a value that already exists on screen returns 400
 */
