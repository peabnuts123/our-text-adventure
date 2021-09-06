terraform {
  backend "s3" {
    bucket="our-text-adventure-terraform-backend"
    region="us-east-1"
    key = "environments/dev.tfstate"
  }
}
