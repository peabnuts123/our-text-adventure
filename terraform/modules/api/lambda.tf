# A few different lambdas, one for each endpoint
#  - Get the details of a screen by ID
#  - Given a screen ID and an action text, return the result

resource "aws_lambda_function" "test" {
  function_name = local.lambda_name_test
  filename      = var.code_package_file_path
  description   = "Test API component for ${var.project_id}. Just playing around and debugging"
  role          = aws_iam_role.lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs12.x"
  memory_size   = 256
  timeout       = 3

  tags = {
    project     = var.project_id
    environment = var.environment_id
  }

  environment {
    variables = {
      NODE_ENV = "production"
      ENVIRONMENT_ID = var.environment_id
    }
  }
}

resource "aws_lambda_permission" "test" {
  count = var.environment_id == "local" ? 0 : 1
  function_name = aws_lambda_function.test.function_name
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # The /*/*/* part allows invocation from any stage, method and resource path
  # within API Gateway REST API.
  source_arn = "${aws_apigatewayv2_api.api[count.index].execution_arn}/*/*/*"
}
