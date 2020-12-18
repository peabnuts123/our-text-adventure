import { APIGatewayProxyResultV2 } from 'aws-lambda';

import Logger from '../Logger';
import ApiError from '../../errors/ApiError';

/**
 * Create a generic error response that returns HTTP 500
 *
 * @param errors Error to include in the response
 */
export default function errorResponse(error: ApiError): APIGatewayProxyResultV2 {
  Logger.logError("Error response: ", error);

  return {
    statusCode: 500,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(error),
  };
}
