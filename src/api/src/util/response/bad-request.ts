import { APIGatewayProxyResultV2 } from 'aws-lambda';

import Logger from '../Logger';
import ApiError from '../../errors/ApiError';

/**
 * Create a generic bad-request response that returns HTTP 400
 *
 * @param errors Error to include in the response
 */
export default function badRequestResponse(error: ApiError): APIGatewayProxyResultV2 {
  Logger.log("Bad request response: ", error);

  return {
    statusCode: 400,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(error),
  };
}
