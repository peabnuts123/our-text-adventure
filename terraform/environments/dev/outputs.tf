# OUTPUTS - all passthrough from app module
output "api_url" {
  value = module.app.api_url
}
output "lambda_function_names" {
  value = module.app.lambda_function_names
}
output "www_bucket_name" {
  value = module.app.www_bucket_name
}
output "cloudfront_domain_name" {
  value = module.app.cloudfront_domain_name
}
