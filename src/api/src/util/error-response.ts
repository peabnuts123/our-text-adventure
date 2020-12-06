import { APIGatewayProxyResultV2 } from 'aws-lambda';

/**
 * Create a generic error response that returns HTTP 500 and displays some kind of error information
 *
 * @param status Error message to display
 * @param error Any kind of error data you want to return
 */
export default function errorResponse(status: string, error: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode: 500,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status,
      error,
    }),
  };
}
