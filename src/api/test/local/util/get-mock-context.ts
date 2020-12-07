import { Context } from "aws-lambda/handler";

export interface ContextOverrides {
  functionName?: string;
  memoryLimitInMB?: string;
  remainingTimeMillis?: number;
}

/** Create a mock `Context` for API Gateway proxy handler functions */
export default function getMockContext(overrides: ContextOverrides = {}): Context {
  return {
    "callbackWaitsForEmptyEventLoop": true,
    "functionVersion": "$LATEST",
    "functionName": overrides.functionName || "our-text-adventure_dev_test",
    "memoryLimitInMB": overrides.memoryLimitInMB || "256",
    "logGroupName": `/aws/lambda/${overrides.functionName || "our-text-adventure_dev_test"}`,
    "logStreamName": "2020/12/06/[$LATEST]41e19aea1e6c442e90036499465ea5d4",
    "invokedFunctionArn": `arn:aws:lambda:us-east-1:115233234257:function:${overrides.functionName || "our-text-adventure_dev_test"}`,
    "awsRequestId": "76b27f23-a2cc-4b9e-891c-a8fead0f2893",
    getRemainingTimeInMillis: () => overrides.remainingTimeMillis || 2500,

    done: (_error?: Error, _result?: any) => { },
    fail: (_error: Error | string) => { },
    succeed: (_message: any, _object?: any) => { },
  };
}
