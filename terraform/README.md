# Terraform / cloud infrastructure

This folder contains all the infrastructure code to run and manage the different environments. One can easily spin-up an environment by providing some config in a `.tfvars` file and running `terraform apply`.

## Architecture

Currently, the code for all of the infrastructure is in one place (rather than in the same place as the code for each component). Each component has its own module and takes in the dependencies it needs as variables. Each environment deploys the modules it needs.

```md
# List of environments
  - dev
  - local
  - (test)
  - etc.

# Environment definition
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

In the future, the module code will likely move into each component, along with their deployment scripts, especially as they are split into separate repositories. However, orchestrating all these separate pieces will become more and more difficult as the code becomes more separated. These problems of scale are left to be solved only when they are needed to be solved, and so all the code will live in a central location for now.

## Deploying an environment

Since Terraform is designed to be idempotent, you can use the same process to create a new environment or update an existing one.

### Prerequisites

You need to have a few things before you can create an environment:
  - The Access/Secret Key of an AWS user with the following permissions:
    - IAMFullAccess
    - AmazonDynamoDBFullAccess
    - CloudWatchLogsFullAccess
    - AmazonAPIGatewayAdministrator
    - AWSLambda_FullAccess

    <!-- @TODO will probably need these permissions too  -->
    <!-- - AmazonS3FullAccess -->
    <!-- - CloudFrontFullAccess -->
    <!-- - AWSCertificateManagerFullAccess -->
  <!-- - A domain set up (and active) in ACM
    - TL;DR:
    1. Add your domain to ACM
    1. Add a CNAME record to your domain with the name/value that ACM gives you
    1. Wait for it to validate
    1. Now you are good to go
    - You will use this domain in the config e.g. `pet-game.winsauce.com` -->

### Deploying

Once you have everything you need, you can do the following to create the infrastructure for an environment:

1. Within an environment folder, copy the file `example.tfvars` and name it `terraform.tfvars`
  - For the `local` environment, you don't need to do this (it already exists, as it does not contain any secrets). See [deploying to localstack](#Deploying-to-localstack)
1. Fill in all the values in the new file. Some are already provided for you. You must provide every value.
1. If this is the first time you have deployed, or you've made module/provider changes, run `terraform init`
1. Now you are good to go. Run `terraform apply`
1. Terraform will do a bunch of processing and then provide you with a plan. You will be asked if you want to continue; type 'yes' and hit enter. It will take a while to spin up all the infrastructure it needs (the first time), but eventually your environment will finish creating, and you will be presented with some outputs
1. You've just created the skeleton infrastructure needed to run your environment - now you need to deploy the code for each component 🙂

## Deploying to localstack

This project is set-up to be able to deploy its infrastructure to a running instance of [localstack](https://github.com/localstack/localstack). This does not deploy an entire environment of infrastructure (mostly because it uses services not in localstack's _free tier_), it only deploys the components needed to be able to run the project locally.

1. Make sure localstack is running. You can run this with the provided docker-compose.yml file by running `docker-compose up -d localstack`. This is a pre-configured containerised instance of localstack that will run only the needed components.
1. Deploy the infrastructure as per the normal method above.

## Deploying components' code

Each component has code that needs to be deployed into the environment as a separate step. Each component folder will have some deploy scripts for doing this, and the documentation for deploying the code for each component lives in each respective README.

Generally speaking, these scripts just need the ID of the infrastructure component they are deploying to e.g. the name of the S3 bucket, or the name of the Lambda function. These come from the Terraform outputs, and can be viewed by running `terraform output` (from the terraform environment folder e.g. `terraform/environments/dev/`).

## Backlog / TODO

  - Update project_id/environment_id validation to remove underscores
  - For that matter, document build/deploy scripts dependencies
  - Add "Comment" to each Cloudfront to describe what the heck it is