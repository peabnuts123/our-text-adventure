# A few different lambdas, one for each endpoint
#  - Get the details of a screen by ID
#  - Given a screen ID and an action text, return the result

# ===
# Function - Test
# ===
resource "aws_lambda_function" "test" {
  function_name = local.lambda_name_test
  filename      = var.code_package_file_path
  description   = "Test API component for ${var.project_id}. Just playing around and debugging"
  role          = aws_iam_role.lambda.arn
  handler       = "handlers/test.handler"
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
  function_name = aws_lambda_function.test.function_name
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # The /*/*/* part allows invocation from any stage, method and resource path
  # within API Gateway REST API.
  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*/*"
}


# ===
# Function - GetScreenById
# ===
resource "aws_lambda_function" "get_screen_by_id" {
  function_name = local.lambda_name_get_screen_by_id
  filename      = var.code_package_file_path
  description   = "GetScreenById API component for ${var.project_id}."
  role          = aws_iam_role.lambda.arn
  handler       = "handlers/get-screen-by-id.handler"
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

resource "aws_lambda_permission" "get_screen_by_id" {
  function_name = aws_lambda_function.get_screen_by_id.function_name
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # The /*/*/* part allows invocation from any stage, method and resource path
  # within API Gateway REST API.
  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*/*"
}


# ===
# Function - AddPath
# ===
resource "aws_lambda_function" "add_path" {
  function_name = local.lambda_name_add_path
  filename      = var.code_package_file_path
  description   = "AddPath API component for ${var.project_id}."
  role          = aws_iam_role.lambda.arn
  handler       = "handlers/add-path.handler"
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

resource "aws_lambda_permission" "add_path" {
  function_name = aws_lambda_function.add_path.function_name
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # The /*/*/* part allows invocation from any stage, method and resource path
  # within API Gateway REST API.
  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*/*"
}
