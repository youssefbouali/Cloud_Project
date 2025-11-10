resource "aws_secretsmanager_secret" "cognito_credentials" {
  name                    = "${var.app_name}/${var.environment}/cognito"
  description             = "Cognito credentials for FitTrack"
  recovery_window_in_days = 7

  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "cognito_credentials" {
  secret_id = aws_secretsmanager_secret.cognito_credentials.id
  secret_string = jsonencode({
    user_pool_id = aws_cognito_user_pool.fittrack.id
    client_id    = aws_cognito_user_pool_client.fittrack_web.id
    region       = var.aws_region
  })
}

resource "aws_secretsmanager_secret" "aws_credentials" {
  name                    = "${var.app_name}/${var.environment}/aws"
  description             = "AWS credentials for FitTrack"
  recovery_window_in_days = 7

  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "aws_credentials" {
  secret_id = aws_secretsmanager_secret.aws_credentials.id
  secret_string = jsonencode({
    region           = var.aws_region
    s3_bucket        = aws_s3_bucket.activity_photos.id
    identity_pool_id = aws_cognito_identity_pool.fittrack.id
  })
}

output "cognito_credentials_secret_arn" {
  value       = aws_secretsmanager_secret.cognito_credentials.arn
  description = "ARN of the Cognito credentials secret"
}

output "aws_credentials_secret_arn" {
  value       = aws_secretsmanager_secret.aws_credentials.arn
  description = "ARN of the AWS credentials secret"
}
