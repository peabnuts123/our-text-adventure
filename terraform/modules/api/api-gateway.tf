# API Gateway
resource "aws_apigatewayv2_api" "api" {
  count = var.environment_id == "local" ? 0 : 1
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
  count = var.environment_id == "local" ? 0 : 1
  api_id      = aws_apigatewayv2_api.api[count.index].id
  name        = "$default"
  auto_deploy = true
}

# Integrations
# API / Lambda integration
resource "aws_apigatewayv2_integration" "test" {
  count = var.environment_id == "local" ? 0 : 1
  api_id      = aws_apigatewayv2_api.api[count.index].id
  description = "Proxy to Test Lambda"

  integration_type       = "AWS_PROXY"
  # @TODO VPC probably
  connection_type        = "INTERNET"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.test.invoke_arn
  payload_format_version = "2.0"
}

# Routes
resource "aws_apigatewayv2_route" "test" {
  count = var.environment_id == "local" ? 0 : 1
  api_id    = aws_apigatewayv2_api.api[count.index].id
  route_key = "ANY /test/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.test[count.index].id}"
}
