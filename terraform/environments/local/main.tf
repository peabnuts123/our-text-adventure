# "local" infrastructure does not build the whole app.
# Rather, it just deploys what is needed to be able to run
#   the individual components locally

# DynamoDB database
module "db" {
  source = "../../modules/db"

  # Common
  project_id       = var.project_id
  environment_id   = var.environment_id
}
