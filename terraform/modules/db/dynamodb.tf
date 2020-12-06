# @NOTE we assume we just need 1 table for now
# If we have multiple tables, will need to update:
#   - API IAM lambda worker policy
#   - db module outputs
#   - API module variables
resource "aws_dynamodb_table" "table" {
  name = local.table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    project = var.project_id
    environment = var.environment_id
  }
}
