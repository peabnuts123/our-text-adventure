import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import AWS from 'aws-sdk';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';

import Logger, { LogLevel } from './util/Logger';
import errorResponse from './util/error-response';

const { NODE_ENV } = process.env;

const baseOptions: ServiceConfigurationOptions = {
  region: 'us-east-1',
};

if (NODE_ENV !== 'production') {
  Logger.setLogLevel(LogLevel.debug);

  baseOptions.endpoint = `http://localhost:4566`;
  Logger.log(LogLevel.debug, "Setting AWS endpoint to localstack");
  process.env['AWS_PROFILE'] = 'our-text-adventure';
}

// const dbClient = new AWS.DynamoDB({
//   ...baseOptions,
// });
const docClient = new AWS.DynamoDB.DocumentClient({
  ...baseOptions,
});

const SCREENS_TABLE_NAME = 'AdventureScreens';

export const handler: APIGatewayProxyHandlerV2 = async (event, _context) => {
  Logger.log(`Handling request: ${event.rawPath}${event.rawQueryString ? '?' + event.rawQueryString : ''}`);

  try {
    const INSERT_MOCK_DATA = true;
    if (INSERT_MOCK_DATA) {
      await debug_insertMockData();
    }

    Logger.log(`Fetching all data from table: '${SCREENS_TABLE_NAME}'`);

    const allData = await debug_getAllScreenData();

    Logger.log("Successfully finished processing.");
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: allData,
      }),
    };

  } catch (err) {
    Logger.logError("An error occurred while processing.", err);
    return errorResponse("An error occurred while processing.", err);
  }
};

async function debug_getAllScreenData(): Promise<AWS.DynamoDB.DocumentClient.ItemList | undefined> {
  const result = await docClient.scan({
    TableName: SCREENS_TABLE_NAME,
  }).promise();

  Logger.log(LogLevel.debug, "All screen data:");


  return result.Items;
}

async function debug_insertMockData(): Promise<void> {
  const MOCK_DATA: Record<string, any>[] = [
    {
      id: '0290922a-59ce-458b-8dbc-1c33f646580a',
      body: [
        "+---------------+",
        "| This is a     |",
        "| sample dialog |",
        "| showing       |",
        "| something.    |",
        "+---------------+",
      ],
      commands: [
        {
          id: '51e5db90-0587-471f-a281-0b37b7eccb8c',
          command: `look bone`,
          target_screen: '9bdd1cdb-d7c9-4c34-9eac-6775fa94d087',
        },
      ],
    },
    {
      id: '9bdd1cdb-d7c9-4c34-9eac-6775fa94d087',
      body: [
        "This is a second",
        "screen.",
      ],
      commands: [
      ],
    },
  ];

  await Promise.all(MOCK_DATA.map((mockItem) => {
    return docClient.put({
      TableName: SCREENS_TABLE_NAME,
      Item: mockItem,
    }).promise();
  }));

  Logger.log(LogLevel.debug, `Successfully inserted ${MOCK_DATA.length} items into table.`);
}
