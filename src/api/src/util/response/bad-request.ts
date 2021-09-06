import { APIGatewayProxyResultV2 } from 'aws-lambda';

import Logger from '@app/util/Logger';

/**
 * Create a bad-request response that returns HTTP 400
 *
 * @param errors Error to include in the response
 */
export default function badRequestResponse(error: unknown): APIGatewayProxyResultV2 {
  Logger.log("Bad request response: ", JSON.stringify(error));

  return {
    statusCode: 400,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(error),
  };
}
