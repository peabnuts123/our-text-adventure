# Special provider for ACM specifically
provider "aws" {
  alias      = "us_east_1"
  region     = "us-east-1"

  default_tags {
    tags = {
      project = var.project_id
      environment = var.environment_id
    }
  }
}

# MODULES
module "db" {
  source = "../db"

  # Common
  project_id       = var.project_id
  environment_id   = var.environment_id
}
module "www" {
  source = "../www"

  # Common
  project_id       = var.project_id
  environment_id   = var.environment_id
}
module "api" {
  source = "../api"

  # Common
  aws_region      = var.aws_region
  aws_account_id  = data.aws_caller_identity.current.account_id
  project_id      = var.project_id
  environment_id  = var.environment_id

  # API
  code_package_file_path  = data.archive_file.empty.output_path
  dynamodb_table_name     = module.db.table_name
}
