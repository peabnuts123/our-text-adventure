import { APIGatewayProxyResultV2 } from 'aws-lambda';

import Logger from './Logger';

/**
 * Create a generic error response that returns HTTP 500 and displays some kind of error information
 *
 * @param status Error message to display
 * @param error Any kind of error data you want to return
 */
export default function errorResponse(status: string, error: Error | string): APIGatewayProxyResultV2 {
  Logger.logError("Error response: ", status, error);

  let errorMessage: string;
  if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = error;
  }

  return {
    statusCode: 500,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status,
      error: errorMessage,
    }),
  };
}
