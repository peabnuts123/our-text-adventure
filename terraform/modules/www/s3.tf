# RESOURCES
# S3 Bucket
resource "aws_s3_bucket" "www" {
  bucket = local.s3_bucket_name
  acl    = "public-read"

  # AWS tags
  tags = {
    project = var.project_id
    environment = var.environment_id
  }

  # Static site hosting / redirects
  website {
    error_document = "404.html"
    index_document = "index.html"
  }
}
