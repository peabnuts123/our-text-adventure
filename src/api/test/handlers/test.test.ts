import { handler } from '@app/handlers/test';

import SimpleRequest from '@test/local/util/SimpleRequest';
import { invokeHandler } from '@test/util/invoke-handler';

describe('Test Handler', () => {
  test('Returns a result', async () => {
    // Setup
    const mockRequest: SimpleRequest = {
      path: "/test/123465",
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response).not.toBeNull();
  });
});
