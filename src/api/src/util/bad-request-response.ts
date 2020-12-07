import { APIGatewayProxyResultV2 } from 'aws-lambda';

import Logger from './Logger';

/**
 * Create a generic bad-request response that returns HTTP 400 and displays a message
 *
 * @param message Message to display
 */
export default function badRequestResponse(message: string): APIGatewayProxyResultV2 {
  Logger.logError("Bad request: ", message);

  return {
    statusCode: 400,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
    }),
  };
}
