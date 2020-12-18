import { APIGatewayProxyResultV2 } from 'aws-lambda';

import Logger from '../Logger';
import ApiError from '../../errors/ApiError';

/**
 * Create a generic not-found response that returns HTTP 404
 *
 * @param errors Error to include in the response
 */
export default function notFoundResponse(error: ApiError): APIGatewayProxyResultV2 {
  Logger.log("Not-found response: ", error);

  return {
    statusCode: 404,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(error),
  };
}
