locals {
  lambda_name_prefix = "${var.project_id}_${var.environment_id}"
  lambda_name_test = "${local.lambda_name_prefix}_test"
}
