import AWS, { AWSError } from 'aws-sdk';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';

import Logger, { LogLevel } from './util/Logger';

/*
  @TODO questions
    - Can you mark screens as like "Leaf nodes" or something?
    - Set ENV_NAME stuff to production in production
 */

Logger.setLogLevel(LogLevel.debug);

const baseOptions: ServiceConfigurationOptions = {
  region: 'us-east-1',
  endpoint: "http://localhost:4566",
};

const dbClient = new AWS.DynamoDB({
  ...baseOptions,
});
const docClient = new AWS.DynamoDB.DocumentClient({
  ...baseOptions,
});

const SCREENS_TABLE_NAME = 'AdventureScreens';

async function main(): Promise<void> {
  try {
    const tableExists: boolean = await doesTableExist(SCREENS_TABLE_NAME);

    if (!tableExists) {
      Logger.log(LogLevel.debug, `Table '${SCREENS_TABLE_NAME}' does not exist, will attempt to create...`);
      await debug_createScreenTable();
      Logger.log(LogLevel.debug, `Successfully created table: ${SCREENS_TABLE_NAME}`);
    } else {
      Logger.log(LogLevel.debug, `Table '${SCREENS_TABLE_NAME}' already exists. Will use this table.`);
    }

    const INSERT_MOCK_DATA = false;
    if (INSERT_MOCK_DATA) {
      await debug_insertMockData();
    }

    const LIST_SCREEN_DATA = true;
    if (LIST_SCREEN_DATA) {
      await debug_listAllScreenData();
    }

    Logger.log("Successfully finished processing.");
  } catch (err) {
    Logger.logError("An error occurred while processing.", err);
    process.exit(1);
  }
}

async function debug_listAllScreenData(): Promise<void> {
  const result = await docClient.scan({
    TableName: SCREENS_TABLE_NAME,
  }).promise();

  Logger.log(LogLevel.debug, "All screen data:");


  result.Items?.forEach((item) => {
    Logger.log(LogLevel.debug, item);
  });
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

async function debug_createScreenTable(): Promise<void> {
  await dbClient.createTable({
    TableName: SCREENS_TABLE_NAME,
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" },
    ],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
    ],
    BillingMode: "PAY_PER_REQUEST",
    Tags: [
      { Key: 'project', Value: "our-text-adventure" },
    ],
  }).promise();
}

/**
 * Test whether a DynamoDB table exists in the current AWS environment.
 * @param tableName Name of the table to test
 */
async function doesTableExist(tableName: string): Promise<boolean> {
  try {
    // Attempt to describe table (throws if table doesn't exist)
    await dbClient.describeTable({
      TableName: tableName,
    }).promise();

    // We got a result - table must exist
    return true;
  } catch (_e) {
    // An error means either:
    //  - The table does not exist
    //  - Some other processing error happened (e.g. AZ is down, or something)
    const err = _e as AWSError;

    // Test for specific "table does not exist" error code
    if (err.code === 'ResourceNotFoundException') {
      return false;
    } else {
      // Continue throwing if this is another type of exception
      throw _e;
    }
  }
}

// Run async context
void main();
