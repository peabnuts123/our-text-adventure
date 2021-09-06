# PROVIDERS
provider "aws" {
  region     = var.aws_region

  default_tags {
    tags = {
      project = var.project_id
      environment = var.environment_id
    }
  }
}