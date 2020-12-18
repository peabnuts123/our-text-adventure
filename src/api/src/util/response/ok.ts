import { APIGatewayProxyResultV2 } from 'aws-lambda';

/**
 * Create an OK response that returns HTTP 200
 *
 * @param errors Error to include in the response
 */
export default function okResponse(body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}
