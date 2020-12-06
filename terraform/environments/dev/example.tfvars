# Copy or rename this file to `terraform.tfvars` and fill in the values below
# e.g. `cp example.tfvars terraform.tfvars`

# Access config
aws_access_key       = ""
aws_secret_key       = ""

# General
# AWS region to create resources in (unless not available)
aws_region = "us-east-1"
# URL used for this environment.
# @NOTE will need to be MANUALLY set up in ACM for HTTPS
# domain_name = ""
# Unique identifier for this project. All resources will be tagged with this id. Also used for naming resources.
# Must be a simple A-Z0-9 string with optional dashes (-) or underscores (_)
# e.g. "our-text-adventure"
project_id = "our-text-adventure"
# Unique environment identifier. All resources will be tagged with this id. Also used for naming resources.
# Must be a simple A-Z0-9 string with optional dashes (-) or underscores (_)
# e.g. dev
environment_id = "dev"
