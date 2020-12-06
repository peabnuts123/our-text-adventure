import { APIGatewayProxyEventV2 } from 'aws-lambda';

import Logger from '../src/util/Logger';
import { handler } from '../src/index';

const mockEvent: APIGatewayProxyEventV2 = {
  "version": "2.0",
  "routeKey": "ANY /test/{proxy+}",
  "rawPath": "/test/123456",
  "rawQueryString": "",
  "headers": {
    "accept": "*/*",
    "content-length": "0",
    "host": "jgr1prjk9g.execute-api.us-east-1.amazonaws.com",
    "user-agent": "insomnia/2020.4.2",
    "x-amzn-trace-id": "Root=1-5fcc58fb-6636f5ef426d54b470dbd2b4",
    "x-forwarded-for": "219.88.234.235",
    "x-forwarded-port": "443",
    "x-forwarded-proto": "https",
  },
  "requestContext": {
    "accountId": "123457890123",
    "apiId": "jgr1prjk9g",
    "domainName": "jgr1prjk9g.execute-api.us-east-1.amazonaws.com",
    "domainPrefix": "jgr1prjk9g",
    "http": {
      "method": "GET",
      "path": "/test/123456",
      "protocol": "HTTP/1.1",
      "sourceIp": "219.88.234.235",
      "userAgent": "insomnia/2020.4.2",
    },
    "requestId": "XHLXWgBhoAMESfA=",
    "routeKey": "ANY /test/{proxy+}",
    "stage": "$default",
    "time": "06/Dec/2020:04:07:23 +0000",
    "timeEpoch": 1607227643715,
  },
  "pathParameters": {
    "proxy": "123456",
  },
  "isBase64Encoded": false,
};

async function main(): Promise<void> {
  const response = await handler(mockEvent, {} as any, () => { });
  Logger.log(`Got response: `, response);
}

void main();
