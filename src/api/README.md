# Our Text Adventure - API

This is the API project. It is specifically designed for a serverless architecture, so each endpoint is implemented as a separate "lambda" function handler that handles one specific type of request. These individual handlers are wired-together either locally or in AWS environments to form an API that is run on-demand.

## Architecture

The API is a simple TypeScript project. It has no "framework" to speak of, each endpoint is a pure function that adheres to a specific AWS interface (to communicate with API Gateway). Each endpoint's job is to validate a request, then persist and return the result.

Classically, more sophisticated APIs would adopt a repository pattern for defining operations on the database, to manage complexity. Since this project is intentionally kept simple, a single shared "IDatabase" repository-like module is used for all operations on the database. This module uses the AWS SDK to communicate to DynamoDB for reading and writing persistent data. When under test, the database module is replaced with a mock implementation that stores data in memory.

For production, the API is expected to be hosted on the same domain as the frontend, on the path `/api`. For development purposes, though, the API is expected to be on a separate domain (e.g. https://localhost:8000 vs. http://localhost:3000). For projects that use authentication (e.g. OAuth), cookies will not work cross-domain unless you are on a secure context e.g. localhost, which is why the project is set up this way.

## Debugging

For interacting with and testing the API I recommend using [Insomnia](https://insomnia.rest/). To this end, I've included (and you should include in your projects too) an Insomnia workspace in `insomnia.json` which can be imported. It includes a full set of working requests and their various exceptions / error cases, to allow you to test the API manually, easily.


## Local development

### Prerequisites (local)

In order to run the project locally, you will need the following:

  - [Node.js and npm](https://nodejs.org/en/)

### Running the project (local)

1. Make sure you are in the `src/api` directory
1. First make sure you have installed the project's dependencies by running:
    ```sh
    npm install
    ```
1. You can start the development server by running:
    ```sh
    npm start
    ```

There are more npm scripts that you can run. Here is what each of them does:
  - `npm run build` - Build the project
  - `npm test` - Run the tests
    - You can also run `npm run test:coverage` to run the tests and collect test coverage statistics, which will then be served on a URL upon completion (to be opened in your browser). Hit CTRL-C to stop the web server after you're finished with it.
    - You can also run `npm run test:watch` to continually run the tests every time a file is changed.
  - `npm run lint` - Run code-quality checks across the project
  - `npm run type-check` - Use the TypeScript compiler to check your project has no errors
  - `npm run simulate-build` - "Simulate" the CI server by running all of `test`, `lint`, `type-check` and `build` in-order, to verify that everything is okay


## Docker

### Prerequisites (docker)

You don't need as much stuff to run the project in docker, as the application's dependencies are included in the Docker container.

  - [docker](https://docs.docker.com/get-docker/) and [docker-compose](https://docs.docker.com/compose/install/)


### Running the project (docker)

Running the API in docker-compose is very simple.

1. From a terminal, ensure you are in the repository root directory (i.e. NOT in `src/api`)
1. Run the docker container with the following command:
    ```sh
    docker-compose up -d api
    ```
    - This will compile the current code into a new docker image.
    - If you have made some changes to the code, you will need to rebuild the docker image:
      ```sh
      docker-compose up --build -d api
      ```
    - **Note:** Don't run `--build` every time as it will fill up your system with identical images.

You should be good to go!

## Deploying to a cloud environment

Lastly, the API component is obviously designed run in an AWS cloud environment. Each handler is deployed to a separate Lambda function, and wired together using API Gateway (which is ultimately served by CloudFront).

### Prerequisites
You are expected to know how to configure authentication with AWS. Some ways I know about include:
  - Specifying a profile with environment variable `AWS_PROFILE` e.g.
      ```sh
        AWS_PROFILE='ota-deploy' ./scripts/deploy.js dev
      ```
  - Specifying a `[default]` profile in shared credentials file (`~/.aws/credentials`)
  - Assuming a role with the AWS CLI (e.g. `aws sts assume-role`) and then saving the credentials into environment variables (e.g. `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`)

You can read more about authentication with AWS [here](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html).

### Deploying

To deploy the API to a cloud environment:

1. Ensure the environment exists. Run Terraform to make sure the infrastructure exists / is up to date. See the [terraform documentation](../../terraform/README.md) for more details on this.
1. From a terminal in the `src/api` directory, run the following script:
    ```sh
    ./scripts/deploy.js [environment_id]
    ```
    - The `environment_id` parameter specifies which environment to deploy to e.g. `dev`:
      ```sh
      ./scripts/deploy.js dev
      ```


## Work backlog / TODO
  - Do a big ol concision refactor to the API, validation utilities, tests etc.
  - Refactor the `/test` route to at least be clear what it does
  - Update Insomnia.json
    - Add Command handler
    - Add new exceptions for add-path
  - Remove path params from test handler and make it more "debug"-y or something

### Ideas
  - Some kind of rate limiting?