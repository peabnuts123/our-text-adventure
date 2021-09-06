/* COMMON */
variable "aws_region" {
  description = "AWS Region to create resources in e.g. us-east-1"
  type        = string
}
variable "aws_account_id" {
  description = "ID of the current AWS account"
  type        = string
}
variable "project_id" {
  description = "Unique simple identifier for project. Must only use A-Z, 0-9, - or _ characters e.g. \"our-text-adventure\""
  type        = string

  validation {
    condition     = can(regex("^[A-Za-z0-9-]+$", var.project_id))
    error_message = "Variable `project_id` must only be characters A-Z (or a-z), 0-9, or hypen (-)."
  }
}
variable "environment_id" {
  description = "Unique simple identifier for environment. Must only use A-Z, 0-9, - or _ characters e.g. \"dev\" or \"test-2\""
  type        = string

  validation {
    condition     = can(regex("^[A-Za-z0-9-]+$", var.environment_id))
    error_message = "Variable `environment_id` must only be characters A-Z (or a-z), 0-9, or hypen (-)."
  }
}

/* API */
variable "code_package_file_path" {
  description = "Path to a zip file containing the compiled code for the API"
  type        = string
}
variable "dynamodb_table_name" {
  type = string
  description = "Name of data table DynamoDB. Used for IAM policy"
}