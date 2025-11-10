output "region" {
  value       = var.aws_region
  description = "AWS region"
}

output "vpc_id" {
  value       = aws_vpc.main.id
  description = "VPC ID"
}

output "frontend_bucket_name" {
  value       = aws_s3_bucket.frontend.id
  description = "S3 bucket for frontend"
}

output "activity_photos_bucket_name" {
  value       = aws_s3_bucket.activity_photos.id
  description = "S3 bucket for activity photos"
}

output "frontend_cloudfront_domain" {
  value       = aws_cloudfront_distribution.frontend.domain_name
  description = "CloudFront domain for frontend"
}

output "photos_cloudfront_domain" {
  value       = aws_cloudfront_distribution.activity_photos.domain_name
  description = "CloudFront domain for activity photos"
}

output "frontend_cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.frontend.id
  description = "CloudFront distribution ID for frontend"
}

output "photos_cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.activity_photos.id
  description = "CloudFront distribution ID for photos"
}

output "cognito_user_pool_id" {
  value       = aws_cognito_user_pool.fittrack.id
  description = "Cognito User Pool ID"
}

output "cognito_user_pool_client_id" {
  value       = aws_cognito_user_pool_client.fittrack_web.id
  description = "Cognito User Pool Client ID"
}

output "cognito_identity_pool_id" {
  value       = aws_cognito_identity_pool.fittrack.id
  description = "Cognito Identity Pool ID"
}

output "rds_endpoint" {
  value       = aws_db_instance.fittrack.endpoint
  description = "RDS database endpoint"
  sensitive   = true
}

output "elastic_beanstalk_endpoint" {
  value       = aws_elastic_beanstalk_environment.fittrack.endpoint_url
  description = "Elastic Beanstalk endpoint URL"
}

output "secrets_manager_arn_db" {
  value       = aws_secretsmanager_secret.db_credentials.arn
  description = "ARN for DB credentials in Secrets Manager"
}

output "secrets_manager_arn_cognito" {
  value       = aws_secretsmanager_secret.cognito_credentials.arn
  description = "ARN for Cognito credentials in Secrets Manager"
}

output "secrets_manager_arn_aws" {
  value       = aws_secretsmanager_secret.aws_credentials.arn
  description = "ARN for AWS credentials in Secrets Manager"
}
