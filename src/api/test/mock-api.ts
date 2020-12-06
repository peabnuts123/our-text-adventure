import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, APIGatewayProxyStructuredResultV2, Context } from 'aws-lambda';
import express, { Request, RequestHandler, Response } from 'express';
import morgan from 'morgan';

import Logger, { LogLevel } from '../src/util/Logger';
import { handler as testHandler } from '../src/index';

// CONFIG
const app = express();
app.use(morgan('combined'));

const SERVER_PORT: number = 8080;
app.listen(SERVER_PORT, () => {
  Logger.log(`Server listening on http://localhost:${SERVER_PORT}`);
});

/** Mock `Context` for API Gateway proxy handler functions */
const mockContext: Context = {
  "callbackWaitsForEmptyEventLoop": true,
  "functionVersion": "$LATEST",
  "functionName": "our-text-adventure_dev_test",
  "memoryLimitInMB": "256",
  "logGroupName": "/aws/lambda/our-text-adventure_dev_test",
  "logStreamName": "2020/12/06/[$LATEST]41e19aea1e6c442e90036499465ea5d4",
  "invokedFunctionArn": "arn:aws:lambda:us-east-1:115233234257:function:our-text-adventure_dev_test",
  "awsRequestId": "76b27f23-a2cc-4b9e-891c-a8fead0f2893",
  getRemainingTimeInMillis: () => 2500,

  done: (_error?: Error, _result?: any) => { },
  fail: (_error: Error | string) => { },
  succeed: (_message: any, _object?: any) => { },
};


// ROUTES
app.all('/test/:something', proxyHandler(testHandler));


// FUNCTIONS
/**
 * Create a request handler from an API Gateway handler function
 * @param handler The API Gateway handler function to call
 */
function proxyHandler(handler: APIGatewayProxyHandlerV2): RequestHandler {
  return async (req, res) => {
    Logger.log(LogLevel.debug, "Proxy handler path:", req.path);
    const event = convertRequestToApiGatewayPayload(req);
    const response: APIGatewayProxyStructuredResultV2 = await handler(event, mockContext, () => { }) as APIGatewayProxyStructuredResultV2;
    return convertApiGatewayResultToResponse(response, res);
  };
}

/**
 * Convert an Express `Request` object into an API Gateway proxy event (v2)
 * @param req Express request to convert
 */
function convertRequestToApiGatewayPayload(req: Request): APIGatewayProxyEventV2 {
  // Mostly just a bunch of mock data with overrides from the request
  // Started implemented some kind of overrides system but it got complex for nested properties
  //  so figured this was probably good enough
  return {
    "version": "2.0",
    "routeKey": "ANY /test/{proxy+}",
    "rawPath": req.path,
    "rawQueryString": Object.keys(req.query).map((queryParam) => `${queryParam}=${encodeURIComponent(req.query[queryParam] as string)}`).join('&'),
    "headers": req.headers as Record<string, string>,
    "queryStringParameters": req.query as Record<string, string>,
    "requestContext": {
      "accountId": "123457890123",
      "apiId": "jgr1prjk9g",
      "domainName": "jgr1prjk9g.execute-api.us-east-1.amazonaws.com",
      "domainPrefix": "jgr1prjk9g",
      "http": {
        "method": req.method,
        "path": req.path,
        "protocol": `HTTP/${req.httpVersion}`,
        "sourceIp": "219.88.234.235",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
      },
      "requestId": "XHLXWgBhoAMESfA=",
      "routeKey": "ANY /test/{proxy+}",
      "stage": "$default",
      "time": "06/Dec/2020:04:07:23 +0000",
      "timeEpoch": 1607227643715,
    },
    "pathParameters": req.params,
    "isBase64Encoded": false,
  };
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
