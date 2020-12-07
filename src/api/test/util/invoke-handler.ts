import { APIGatewayProxyHandlerV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

import SimpleRequest from '@test/local/util/SimpleRequest';
import getMockContext, { ContextOverrides } from '@test/local/util/get-mock-context';
import getMockProxyRequest from '@test/local/util/get-mock-proxy-request';

export function invokeHandler(handler: APIGatewayProxyHandlerV2, request: SimpleRequest, contextOverrides?: ContextOverrides): Promise<APIGatewayProxyStructuredResultV2> {
  return handler(
    getMockProxyRequest(request),
    getMockContext(contextOverrides),
    () => { },
  ) as Promise<APIGatewayProxyStructuredResultV2>;
}
