# OUTPUTS - all passthrough from app module
output "aws_region" {
  value = var.aws_region
}
output "api_url" {
  value = module.app.api_url
}
output "all_lambda_functions" {
  value = module.app.all_lambda_functions
}
output "www_bucket_name" {
  value = module.app.www_bucket_name
}
output "cloudfront_domain_name" {
  value = module.app.cloudfront_domain_name
}
output "domain_name" {
  value = module.app.domain_name
}