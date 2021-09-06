# Our Text Adventure - Terraform / Cloud Infrastructure

This folder contains all the infrastructure code to run and manage the different environments. One can easily spin-up an environment by providing some config in a `.tfvars` file and running `terraform apply`.

## Architecture

Each component has its own module and takes in the dependencies it needs as variables. Each environment deploys the modules it needs.

```md
# List of environments
  - dev
  - local
  - (test)
  - etc.

# Environment definition
  - environments/dev
    - main.tf - specifies modules as-needed e.g. `db`, `api`, etc.
    - outputs.tf
    - providers.tf
    - etc.

# Modules / components
  - modules/api
    - api-gateway.tf
    - cloudwatch.tf
    - etc.
  - modules/db
    - heroku.tf
    - etc.
  - etc.
```


## Deploying an environment

Since Terraform is designed to be idempotent, you can use the same process to create a new environment or update an existing one.

### Prerequisites
You need to have a few things before you can create an environment:

  - You are expected to know how to configure authentication with AWS. Some ways I know about include:
    - Specifying a profile with environment variable `AWS_PROFILE` e.g.
      ```sh
        AWS_PROFILE='ota-deploy' ./scripts/deploy.js dev
      ```
    - Specifying a `[default]` profile in shared credentials file (`~/.aws/credentials`)
    - Assuming a role with the AWS CLI (e.g. `aws sts assume-role`) and then saving the credentials into environment variables (e.g. `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`)

    - You can read more about authentication with AWS [here](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html).

  - However you choose to authenticate with AWS, you need to use role/user with the following permissions:
    - IAMFullAccess
    - AmazonDynamoDBFullAccess
    - CloudWatchLogsFullAccess
    - AmazonAPIGatewayAdministrator
    - AWSLambda_FullAccess
    - AmazonS3FullAccess
    - CloudFrontFullAccess
    - AWSCertificateManagerFullAccess

  - A domain set up (and active) in ACM
    - TL;DR:
      1. Add your domain to ACM
      1. Add a CNAME record to your DNS settings with the name/value that ACM gives you
      1. Wait for it to validate (usually only a few minutes)
      1. Now you are good to go
    - You will use this domain in the config e.g. `dev.myproject.com`

### Deploying

Once you have everything you need, you can do the following to create the infrastructure for an environment:

1. Within an environment folder, copy the file `example.tfvars` and name it `terraform.tfvars`
1. Fill in all the values in the new file. Some are already provided for you. You must provide every value.
1. If this is the first time you have deployed, or you've made module/provider changes, run `terraform init`
1. Now you are good to go. Run `terraform apply`
1. Terraform will do a bunch of processing and then provide you with a plan. You will be asked if you want to continue; type 'yes' and hit enter. It will take a while to spin up all the infrastructure it needs (the first time), but eventually your environment will finish creating, and you will be presented with some outputs
1. You've just created the skeleton infrastructure needed to run your environment - now you need to deploy the code for each component 🙂

## Deploying to localstack

This project is set-up to be able to deploy its infrastructure to a running instance of [localstack](https://github.com/localstack/localstack). This does not deploy an entire environment of infrastructure (mostly because it is limited by localstack's _free tier_), it only deploys the components that cannot be run locally manually (basically just the DB).

1. Make sure localstack is running. You can run this with the provided docker-compose.yml file by running `docker-compose up -d localstack`. This is a pre-configured containerised instance of localstack that will run only the needed components.
1. Deploy the infrastructure as per the normal method above.

## Deploying components' code

Each component has code that needs to be deployed into the environment as a separate step. Each component folder will have some deploy scripts for doing this, and the documentation for deploying the code for each component lives in each respective README.

Generally speaking, these scripts just need the ID of the environment that is being deployed to (e.g. `node scripts/deploy.js dev`).

_Remember that code cannot be deployed to the local environment, it is for development purposes only._

## Backlog / TODO

  - _Nothing at-present_.