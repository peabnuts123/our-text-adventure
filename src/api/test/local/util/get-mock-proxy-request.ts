import { APIGatewayProxyEventV2 } from "aws-lambda";

import SimpleRequest from "@test/local/util/SimpleRequest";

/**
 * Create a mock API Gateway proxy request from a set of config options / overrides
 * @param requestOptions Options to specify for the request
 */
export default function getMockProxyRequest(requestOptions: SimpleRequest): APIGatewayProxyEventV2 {
  return {
    "version": "2.0",
    "routeKey": "ANY /test/{proxy+}",
    "body": requestOptions.body,
    "rawPath": requestOptions.path,
    "rawQueryString": requestOptions.queryParams === undefined ? "" :
      Object.keys(requestOptions.queryParams)
        .map((queryParam) => `${queryParam}=${encodeURIComponent(requestOptions.queryParams![queryParam])}`)
        .join('&'),
    "headers": requestOptions.headers === undefined ? {} : requestOptions.headers,
    "queryStringParameters": requestOptions.queryParams === undefined ? {} : requestOptions.queryParams,
    "requestContext": {
      "accountId": "123457890123",
      "apiId": "jgr1prjk9g",
      "domainName": "jgr1prjk9g.execute-api.us-east-1.amazonaws.com",
      "domainPrefix": "jgr1prjk9g",
      "http": {
        "method": requestOptions.httpMethod === undefined ? "GET" : requestOptions.httpMethod,
        "path": requestOptions.path,
        "protocol": "HTTP/1.1",
        "sourceIp": "219.88.234.235",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
      },
      "requestId": "XHLXWgBhoAMESfA=",
      "routeKey": "ANY /{proxy+}",
      "stage": "$default",
      "time": "06/Dec/2020:04:07:23 +0000",
      "timeEpoch": 1607227643715,
    },
    "pathParameters": requestOptions.pathParams === undefined ? {} : requestOptions.pathParams,
    "isBase64Encoded": false,
  };
}
