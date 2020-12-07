# OUTPUTS - all passthrough from app module
output "api_url" {
  value = module.app.api_url
}
output "lambda_function_names" {
  value = module.app.lambda_function_names
}
