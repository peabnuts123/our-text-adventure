# Function - Test
resource "aws_cloudwatch_log_group" "test" {
  name              = "/aws/lambda/${local.lambda_name_test}"
  retention_in_days = 14

  tags = {
    project = var.project_id
    environment = var.environment_id
  }
}
# Function - GetScreenById
resource "aws_cloudwatch_log_group" "get_screen_by_id" {
  name              = "/aws/lambda/${local.lambda_name_get_screen_by_id}"
  retention_in_days = 14

  tags = {
    project = var.project_id
    environment = var.environment_id
  }
}
# Function - AddPath
resource "aws_cloudwatch_log_group" "add_path" {
  name              = "/aws/lambda/${local.lambda_name_add_path}"
  retention_in_days = 14

  tags = {
    project = var.project_id
    environment = var.environment_id
  }
}
