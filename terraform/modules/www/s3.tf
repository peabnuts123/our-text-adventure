# RESOURCES
# S3 Bucket
resource "aws_s3_bucket" "www" {
  bucket = local.s3_bucket_name
  acl    = "public-read"

  # Static site hosting / redirects
  website {
    error_document = "404/index.html"
    index_document = "index.html"
  }
}
