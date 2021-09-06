# Our Text Adventure - WWW / Frontend Client

This is the frontend project. It is a Next.js (React) project that is served statically and cached by CloudFront. It communicates to the API on the same domain using AJAX (fetch) calls for requesting data as it is needed. The site is pre-rendered at compile-time, meaning you will always be served the page you request, not just `index.html` all the time (which is how most single-page-apps behave). The site also returns correct 404 responses for pages that don't exist. This all makes for much better SEO, and performance for users.

## Architecture

The project is a single-page-app / static site generated using [Next.js](https://github.com/vercel/next.js/), which means it is a React project. The site is pre-rendered at compile-time from a set of managed content. At runtime, once the site has loaded, React takes over as a single-page-app, and fetches dynamic data from the API. You can learn more about Next.js [here](https://nextjs.org/).

The frontend project fetches all of the data it needs through the [API](../api/README.md) project. Domain-specific "Services" are written to abstract API implementation details away from the business logic of the app, exposing functions for interacting with the API. Usually these Services will be used from within a Store, and the results stored in mobx-observed state, rather than from a component directly.

For production, the API is expected to be hosted on the same domain as the frontend, on the path `/api`. For development purposes, though, the API is expected to be on a separate domain (e.g. https://localhost:8000 vs. http://localhost:3000). For projects that use authentication (e.g. OAuth), cookies will not work cross-domain unless you are on a secure context e.g. localhost, which is why the project is set up this way.

### Static site behaviour (SEO, performance)
When running in a cloud environment, CloudFront is configured to serve the frontend client such that the corresponding statically generated page is served when the site is requested. e.g. if you request `/about` you will be served `about.tsx`. This means that whenever you load the site, the page you are landing on is what is rendered immediately. This contrasts with how most single-page-app frameworks work wherein you are generally served `index.html`, and once the site loads, it quickly routes to the page specified in the URL. This has performance and SEO implications, which are mitigated by correctly serving the page that is requested. This also allows the CloudFront distribution to correctly serve 404s for pages that don't exist, leveraging S3's "static website hosting" feature to serve the `404.tsx` page whenever a request is unmatched. This all comes together to make the frontend behave like a super-fast server-rendered web page, with none of the associated costs.

## Local development

### Prerequisites (local)

In order to run the project locally, you will need the following:

  - [Node.js and npm](https://nodejs.org)
  - You must have an instance of the API running in order for the site to work properly. You can run it locally in another terminal window, or by running it in docker. See [the API's README](../api/README.md) on how to do this.

### Running the project (local)

1. Make sure you are in the `src/www` directory
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
    - You must set the `ENVIRONMENT_ID` environment variable to specify which environment configuration is included in the build e.g. `ENVIRONMENT_ID=dev`. _NOTE: This is done automatically when using the deploy script. `deploy.js`_
  - `npm test` - Run the tests
    - You can also run `npm run test:coverage` to run the tests and collect test coverage statistics, which will then be served on a URL upon completion (to be opened in your browser). Hit CTRL-C to stop the web server after you're finished with it.
  - `npm run lint` - Run code-quality checks across the project
  - `npm run type-check` - Use the TypeScript compiler to check your project has no errors
  - `npm run simulate-build` - "Simulate" the CI server by running all of `test`, `lint`, `type-check` and `build` in-order, to verify that everything is okay

## Docker

### Prerequisites (docker)

You don't need as much stuff to run the project in docker, as the application's dependencies are included in the Docker container. However, you still need an instance of the API running (which can also run in Docker).

  - [docker](https://docs.docker.com/get-docker/) and [docker-compose](https://docs.docker.com/compose/install/)
  - You must have an instance of the API running in order for the site to work properly. You can run it locally in another terminal window, or by running it in docker. See [the API's README](../api/README.md) on how to do this.


### Running the project (docker)

Running the WWW component in docker-compose is very simple.

1. From a terminal, ensure you are in the repository root directory (i.e. NOT in `src/www`)
1. Run the docker container with the following command:
    ```sh
    docker-compose up -d www
    ```

You should be good to go! This will run a development server in a docker container. It is a bit slow so may take a moment to spin up.

## Deploying to a cloud environment

Lastly, the WWW component can obviously be hosted in an AWS cloud environment. It is hosted in S3, and served by CloudFront.

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
To deploy the frontend client to a cloud environment:

1. Ensure the environment exists. Run Terraform to make sure the infrastructure exists / is up to date. See the [terraform documentation](../../terraform/README.md) for more details on this.
1. From a terminal in the `src/www` directory, run the following script:
    ```sh
    ./scripts/deploy.js [environment_id]
    ```
    - The `environment_id` parameter specifies which environment to deploy to e.g. `dev`:
      ```sh
      ./scripts/deploy.js dev
      ```


## Work backlog / TODO

  <!-- - _Nothing at-present_. -->
  - 404 page
  - Add a "Are you sure you wish to leave" thing
  - Make the command input `>` not span multiple lines and make text wrapping the same as the terminal
  - Add some F*** margin to the bottom of the command input
  - Scroll command input with terminal
  - Don't judderscroll terminal when submitting a command
  - Make command submit 100% match result in terminal
  - Scroll on create command
  - Add alias for "add command"
  - Collapse similar items into " - Receipt x2"
  - Only show "Add command" after text has finished printing
  - Indicate when items were limited to the player
  - Gracefully handle uncaught errors in the frontend
    - Sending a command when sourceScreenId is invalid
  - Have some kind of "save/load" thing for when your state detects different states
    - State should have a unique ID?
  - Figure out how to delete deployments older than X

### Ideas
  - Add command "aliases"? Command separated?
  - Allow requirements of "BLah x100"?
  - Store some stuff globally for production debugging (e.g. `window.ota.config`)
  - Make a utility for wrapping words or something