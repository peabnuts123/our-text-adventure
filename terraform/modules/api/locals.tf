locals {
  lambda_name_prefix = "${var.project_id}_${var.environment_id}"

  all_lambda_functions = {
    "test" = {
      name = "${local.lambda_name_prefix}_project-create"
      handler = "test.handler"
      route_key = "GET /api/test/{proxy+}"
    }
    "get_screen_by_id" = {
      name = "${local.lambda_name_prefix}_get-screen-by-id"
      handler = "get-screen-by-id.handler"
      route_key = "GET /api/screen/{id}"
    }
    "add_path" = {
      name = "${local.lambda_name_prefix}_add-path"
      handler = "add-path.handler"
      route_key = "POST /api/path"
    }
    "command" = {
      name = "${local.lambda_name_prefix}_command"
      handler = "command.handler"
      route_key = "POST /api/command"
    }
  }
}
