output "invoke_url" {
  # @TODO can we get the URL better here? Can we use the ARN or something?
  value       = trim(aws_apigatewayv2_stage.default.invoke_url, "https://")
  description = "URL for invoking / accessing the API through API gateway"
}

output "lambda_function_names" {
  value = [
    aws_lambda_function.test.function_name,
    aws_lambda_function.get_screen_by_id.function_name,
    aws_lambda_function.add_path.function_name
  ]
}