# Invoke main app module, pass through variables
module "app" {
  source = "../../modules/app"

  aws_region      = var.aws_region
  project_id      = var.project_id
  environment_id  = var.environment_id
  domain_name     = var.domain_name
}