# Lambda functions
resource "aws_cloudwatch_log_group" "lambda" {
  for_each = local.all_lambda_functions

  name              = "/aws/lambda/${each.value.name}"
  retention_in_days = 14
}
