locals {
  lambda_name_prefix = "${var.project_id}_${var.environment_id}"
  lambda_name_test = "${local.lambda_name_prefix}_test"
  lambda_name_get_screen_by_id = "${local.lambda_name_prefix}_get_screen_by_id"
  lambda_name_add_path = "${local.lambda_name_prefix}_add_path"
}
