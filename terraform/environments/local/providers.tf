# PROVIDERS
provider "aws" {
  region     = var.aws_region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key

  # Overrides for localstack
  s3_force_path_style         = true
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  # @NOTE don't forget to add these to docker-compose too
  endpoints {
    apigateway      = "http://localhost:4566"
    cloudwatchlogs  = "http://localhost:4566"
    iam             = "http://localhost:4566"
    dynamodb        = "http://localhost:4566"
    lambda          = "http://localhost:4566"
    sts             = "http://localhost:4566"
  }
}