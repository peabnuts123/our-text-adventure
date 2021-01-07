import { handler } from '@app/handlers/add-path';
import { AddPathDto } from '@app/handlers/add-path/dto';
import GameScreen from '@app/db/models/GameScreen';
import ErrorId from '@app/errors/ErrorId';

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
      screenBody: ["This is a ", "mock screen"],
      command: 'mock bone',
    };

    const expectedResponse = {
      body: requestPayload.screenBody,
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
        screenBody: ["This is a ", "mock screen"],
      }),
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
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: "   ",
        sourceScreenId: mockScreen.id,
        screenBody: ["This is a ", "mock screen"],
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
        command: 2,
        sourceScreenId: mockScreen.id,
        screenBody: ["This is a ", "mock screen"],
      }),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });

  /* VALIDATION TESTS: `screenBody` property */
  test("Missing `screenBody` property returns 400", async () => {
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
        field: 'screenBody',
        message: "Field must be a non-empty array of strings",
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
      }),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Non-array `screenBody` property returns 400", async () => {
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
        field: 'screenBody',
        message: "Field must be a non-empty array of strings",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        screenBody: "This is a mock screen",
        command: "mock bone",
        sourceScreenId: mockScreen.id,
      }),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
  test("Array of non-strings for `screenBody` property returns 400", async () => {
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
        field: 'screenBody',
        message: "Field must be a non-empty array of strings",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        screenBody: [
          "String",
          2,
          true,
        ],
        command: "mock bone",
        sourceScreenId: mockScreen.id,
      }),
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
        screenBody: ["This is a ", "mock screen"],
      }),
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
        screenBody: ["This is a ", "mock screen"],
      }),
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
        sourceScreenId: 2,
        command: "mock bone",
        screenBody: ["This is a ", "mock screen"],
      }),
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
        id: ErrorId.AddPath_NoScreenExistsWithId,
        message: `No screen exists with id: ${mockScreenId}`,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/path`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceScreenId: mockScreenId,
        screenBody: ["This is a ", "mock screen"],
        command: 'mock bone',
      }),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });

});

