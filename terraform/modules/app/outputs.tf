# OUTPUTS

output "api_url" {
  value = module.api.invoke_url
}

output "lambda_function_names" {
  value = module.api.lambda_function_names
}

# Output the cloudfront domain, so we know how to access the distribution
#   We will also need this to add as a CNAME DNS record for our domain
output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.app.domain_name
  description = "CloudFront distribution domain name. Add DNS record `CNAME <DOMAIN_NAME> <CLOUDFRONT_DOMAIN_NAME>` to finish configuration"
}

output "www_bucket_name" {
  value       = module.www.s3_bucket_name
  description = "S3 bucket name, for deploying www project"
}
