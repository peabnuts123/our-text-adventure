output "invoke_url" {
  # @TODO can we get the URL better here? Can we use the ARN or something?
  value       = trim(aws_apigatewayv2_stage.default.invoke_url, "https://")
  description = "URL for invoking / accessing the API through API gateway"
}

output "all_lambda_functions" {
  value = local.all_lambda_functions
}