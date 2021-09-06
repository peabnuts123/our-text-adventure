# Copy or rename this file to `terraform.tfvars` and fill in the values below
# e.g. `cp example.tfvars terraform.tfvars`

# General
# AWS region to create resources in (unless not available)
aws_region = "us-east-1"
# Must be a simple A-Z0-9 string with optional dashes (-)
# e.g. "our-text-adventure"
project_id = "our-text-adventure"
# Unique environment identifier. All resources will be tagged with this id. Also used for naming resources.
# Must be a simple A-Z0-9 string with optional dashes (-)
# e.g. dev
environment_id = "local"
