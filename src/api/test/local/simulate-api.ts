import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import express, { Request, RequestHandler, Response } from 'express';
import bodyParser from 'body-parser';

import getMockContext from '@test/local/util/get-mock-context';
import getMockProxyRequest from '@test/local/util/get-mock-proxy-request';

import Logger, { LogLevel } from '@app/util/Logger';
import { handler as testHandler } from '@app/handlers/test';
import { handler as getScreenByIdHandler } from '@app/handlers/get-screen-by-id';
import { handler as addPathHandler } from '@app/handlers/add-path';

// EXPRESS APP
const app = express();
app.use(bodyParser.text({
  type: [ '*/*' ],
}));

const SERVER_PORT: number = 8000;
app.listen(SERVER_PORT, () => {
  Logger.log(`Server listening on http://localhost:${SERVER_PORT}`);
});


// ROUTES
// These need to match the definitions in `terraform/modules/api/api-gateway.tf`
app.get('/test/*', proxyHandler(testHandler));
app.get('/screen/:id', proxyHandler(getScreenByIdHandler));
app.post('/path', proxyHandler(addPathHandler));


// FUNCTIONS
/**
 * Create a request handler from an API Gateway handler function
 * @param handler The API Gateway handler function to call
 */
function proxyHandler(handler: APIGatewayProxyHandlerV2): RequestHandler {
  return async (req, res) => {
    // 1. Convert express request to API Gateway proxy request
    const event = convertRequestToApiGatewayPayload(req);
    // 2. Handle request
    const response: APIGatewayProxyStructuredResultV2 = await handler(event, getMockContext(), () => { }) as APIGatewayProxyStructuredResultV2;
    // 3. Convert API Gateway proxy response to express response (and send)
    return convertApiGatewayResultToResponse(response, res);
  };
}

/**
 * Convert an Express `Request` object into an API Gateway proxy event (v2)
 * @param req Express request to convert
 */
function convertRequestToApiGatewayPayload(req: Request): APIGatewayProxyEventV2 {
  return getMockProxyRequest({
    path: req.path,
    body: req.body as (string | undefined),
    queryParams: req.query as Record<string, string>,
    headers: req.headers as Record<string, string>,
    httpMethod: req.method,
    pathParams: req.params as Record<string, string>,
  });
}

/**
 * Convert the result of an API Gateway proxy handler function into an Express response.
 * @NOTE: The response is sent immediately.
 * @param result API Gateway proxy response
 * @param res Express Response object, to send the response in
 */
function convertApiGatewayResultToResponse(result: APIGatewayProxyStructuredResultV2, res: Response): Response {
  // Set status code
  if (result.statusCode) {
    res.statusCode = result.statusCode;
  }

  // Set cookies
  // @TODO - just log them for now to see what values these are
  if (result.cookies) {
    result.cookies.forEach((cookie) => {
      Logger.log(LogLevel.debug, "Cookie: ", cookie);
    });
  }

  // Set Headers
  if (result.headers) {
    Object.keys(result.headers).forEach((header) => {
      res.setHeader(header, `${result.headers![header]}`);
    });
  }

  // @NOTE `event.isBase64Encoded` is not handled. Not entirely sure on what needs to be set in the response
  //   to flag this. Probably update `Content-Encoding` ?

  // Set body
  if (result.body) {
    return res.send(result.body);
  } else {
    return res;
  }
}
