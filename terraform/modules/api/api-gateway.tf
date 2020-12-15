# API Gateway
resource "aws_apigatewayv2_api" "api" {
  name          = "Our Text Adventure - api (${var.environment_id})"
  protocol_type = "HTTP"

  tags = {
    project = var.project_id
    environment = var.environment_id
  }
}

# Default stage, auto-deploy
# @NOTE no need for other stages, as separate environments will be
#   entirely separate deployments of this whole infrastructure.
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}

# Integrations
# Function - Test
resource "aws_apigatewayv2_integration" "test" {
  api_id      = aws_apigatewayv2_api.api.id
  description = "Proxy to Test Lambda"

  integration_type       = "AWS_PROXY"
  # @TODO VPC probably
  connection_type        = "INTERNET"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.test.invoke_arn
  payload_format_version = "2.0"
}
# Function - GetScreenById
resource "aws_apigatewayv2_integration" "get_screen_by_id" {
  api_id      = aws_apigatewayv2_api.api.id
  description = "Proxy to GetScreenById Lambda"

  integration_type       = "AWS_PROXY"
  # @TODO VPC probably
  connection_type        = "INTERNET"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.get_screen_by_id.invoke_arn
  payload_format_version = "2.0"
}
# Function - AddPath
resource "aws_apigatewayv2_integration" "add_path" {
  api_id      = aws_apigatewayv2_api.api.id
  description = "Proxy to AddPath Lambda"

  integration_type       = "AWS_PROXY"
  # @TODO VPC probably
  connection_type        = "INTERNET"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.add_path.invoke_arn
  payload_format_version = "2.0"
}

# Routes
# GET /test/*
resource "aws_apigatewayv2_route" "test" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /api/test/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.test.id}"
}
# GET /screen/:id
resource "aws_apigatewayv2_route" "get_screen_by_id" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /api/screen/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.get_screen_by_id.id}"
}
# POST /path
resource "aws_apigatewayv2_route" "add_path" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /api/path"
  target    = "integrations/${aws_apigatewayv2_integration.add_path.id}"
}
