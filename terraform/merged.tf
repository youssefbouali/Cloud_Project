# ========================================
# merged.tf – FitTrack Infrastructure (كامل + مُصحح 100%)
# ========================================
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
  backend "s3" {
    bucket       = "fittrack-terraform-state"
    key          = "prod/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true  # تم إصلاح التحذير
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = var.tags
  }
}

provider "random" {}

# ========================================
# Variables
# ========================================
variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "app_name" {
  type    = string
  default = "fittrack"
}

variable "db_name" {
  type    = string
  default = "fittrack_db"
}

variable "db_username" {
  type      = string
  sensitive = true
  default   = "postgres"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "db_instance_class" {
  type    = string
  default = "db.t3.micro"
}

variable "db_allocated_storage" {
  type    = number
  default = 20
}

variable "cognito_password_min_length" {
  type    = number
  default = 8
}

variable "frontend_domain" {
  type    = string
  default = ""
}

variable "api_domain" {
  type    = string
  default = ""
}

variable "tags" {
  type = map(string)
  default = {
    Project     = "FitTrack"
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}

# ========================================
# Random suffix for bucket names
# ========================================
resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

# ========================================
# S3 Buckets
# ========================================
resource "aws_s3_bucket" "frontend" {
  bucket = "${var.app_name}-frontend-${var.environment}-${random_string.bucket_suffix.result}"
  tags   = var.tags
}

resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket" "activity_photos" {
  bucket = "${var.app_name}-photos-${var.environment}-${random_string.bucket_suffix.result}"
  tags   = var.tags
}

resource "aws_s3_bucket_versioning" "activity_photos" {
  bucket = aws_s3_bucket.activity_photos.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_cors_configuration" "activity_photos" {
  bucket = aws_s3_bucket.activity_photos.id
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE"]
    allowed_origins = concat(
      ["http://localhost:3000", "http://localhost:3001"],
      var.frontend_domain != "" ? ["https://${var.frontend_domain}"] : []
    )
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_public_access_block" "activity_photos" {
  bucket                  = aws_s3_bucket.activity_photos.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# ========================================
# CloudFront OAI
# ========================================
resource "aws_cloudfront_origin_access_identity" "frontend" {
  comment = "OAI for FitTrack frontend"
}

# ========================================
# Cognito
# ========================================
resource "aws_cognito_user_pool" "fittrack" {
  name = "${var.app_name}-${var.environment}-pool"
  password_policy {
    minimum_length    = var.cognito_password_min_length
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }
  auto_verified_attributes = ["email"]
  username_attributes      = ["email"]
  tags                     = var.tags
}

resource "aws_cognito_user_pool_client" "fittrack_web" {
  name                                 = "${var.app_name}-${var.environment}-web-client"
  user_pool_id                         = aws_cognito_user_pool.fittrack.id
  generate_secret                      = false
  explicit_auth_flows                  = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_scopes                 = ["phone", "email", "openid", "profile"]
  allowed_oauth_flows_user_pool_client = true
  callback_urls                        = concat(["http://localhost:3000/auth/callback"], var.frontend_domain != "" ? ["https://${var.frontend_domain}/auth/callback"] : [])
  logout_urls                          = concat(["http://localhost:3000"], var.frontend_domain != "" ? ["https://${var.frontend_domain}"] : [])
  depends_on                           = [aws_cognito_user_pool.fittrack]
}

resource "aws_cognito_identity_pool" "fittrack" {
  identity_pool_name                = "${var.app_name}_${var.environment}_identity_pool"
  allow_unauthenticated_identities = false
  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.fittrack_web.id
    provider_name           = aws_cognito_user_pool.fittrack.endpoint
    server_side_token_check = false
  }
  depends_on = [aws_cognito_user_pool_client.fittrack_web]
}

# ========================================
# IAM Roles
# ========================================
resource "aws_iam_role" "cognito_authenticated" {
  name = "${var.app_name}-${var.environment}-cognito-auth-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = "cognito-identity.amazonaws.com" }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = { "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.fittrack.id }
        "ForAnyValue:StringLike" = { "cognito-identity.amazonaws.com:amr" = "authenticated" }
      }
    }]
  })
}

resource "aws_iam_role_policy" "cognito_authenticated_s3" {
  name = "${var.app_name}-${var.environment}-cognito-s3-policy"
  role = aws_iam_role.cognito_authenticated.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
      Resource = "${aws_s3_bucket.activity_photos.arn}/activities/*"
    }]
  })
}

# ========================================
# VPC & Networking
# ========================================
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags                 = merge(var.tags, { Name = "${var.app_name}-${var.environment}-vpc" })
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = merge(var.tags, { Name = "${var.app_name}-${var.environment}-igw" })
}

resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
    map_public_ip_on_launch = true
  tags                    = merge(var.tags, { Name = "${var.app_name}-${var.environment}-public-${count.index + 1}" })
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = merge(var.tags, { Name = "${var.app_name}-${var.environment}-public-rt" })
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

data "aws_availability_zones" "available" {
  state = "available"
}

# ========================================
# RDS
# ========================================
resource "aws_db_subnet_group" "fittrack" {
  name       = "${var.app_name}-${var.environment}-db-subnet-group"
  subnet_ids = aws_subnet.public[*].id
  tags       = var.tags
}

resource "aws_security_group" "rds" {
  name        = "${var.app_name}-${var.environment}-rds-sg"
  vpc_id      = aws_vpc.main.id
  description = "Allow DB access from EB"

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    #security_groups = [aws_security_group.elastic_beanstalk.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

resource "aws_db_instance" "fittrack" {
  identifier                = "${var.app_name}-${var.environment}-db"
  engine                    = "postgres"
  engine_version            = "14.15"
  instance_class            = var.db_instance_class
  allocated_storage         = var.db_allocated_storage
  storage_encrypted         = true
  db_name                   = replace(var.db_name, "-", "_")
  username                  = var.db_username
  password                  = var.db_password
  db_subnet_group_name      = aws_db_subnet_group.fittrack.name
  vpc_security_group_ids    = [aws_security_group.rds.id]
  publicly_accessible       = true
  backup_retention_period   = 7
  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.app_name}-${var.environment}-final-snapshot"
  tags                      = var.tags
  depends_on                = [aws_db_subnet_group.fittrack]
}

# ========================================
# Elastic Beanstalk
# ========================================
resource "aws_iam_instance_profile" "elastic_beanstalk_ec2" {
  name = "${var.app_name}-${var.environment}-eb-ec2-profile"
  role = aws_iam_role.elastic_beanstalk_ec2.name
}

resource "aws_iam_role" "elastic_beanstalk_ec2" {
  name = "${var.app_name}-${var.environment}-eb-ec2-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "elastic_beanstalk_web_tier" {
  role       = aws_iam_role.elastic_beanstalk_ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

resource "aws_security_group" "elastic_beanstalk" {
  name        = "${var.app_name}-${var.environment}-eb-sg"
  vpc_id      = aws_vpc.main.id
  description = "Allow HTTP/HTTPS"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

resource "aws_elastic_beanstalk_application" "fittrack" {
  name        = "${var.app_name}-${var.environment}"
  description = "FitTrack application"
  tags        = var.tags
}

# تم إصلاح: name + DATABASE_URL + VPC settings
resource "aws_elastic_beanstalk_environment" "fittrack" {
  name                = "${var.app_name}-${var.environment}-env"
  application         = aws_elastic_beanstalk_application.fittrack.name
  solution_stack_name = "64bit Amazon Linux 2023 v6.6.8 running Node.js 20"

  # Environment Variables
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NODE_ENV"
    value     = var.environment
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "PORT"
    value     = "5000"
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "AWS_REGION"
    value     = var.aws_region
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "COGNITO_USER_POOL_ID"
    value     = aws_cognito_user_pool.fittrack.id
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "COGNITO_CLIENT_ID"
    value     = aws_cognito_user_pool_client.fittrack_web.id
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DATABASE_URL"
    value     = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.fittrack.endpoint}/${aws_db_instance.fittrack.db_name}"
  }

  # IAM
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.elastic_beanstalk_ec2.name
  }

  # VPC Configuration (AL2023 - الصحيح 100%)
  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = aws_vpc.main.id
  }
  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = join(",", aws_subnet.public[*].id)
  }
  setting {
    namespace = "aws:ec2:vpc"
    name      = "ELBSubnets"
    value     = join(",", aws_subnet.public[*].id)
  }
  setting {
    namespace = "aws:ec2:vpc"
    name      = "AssociatePublicIpAddress"
    value     = "true"
  }

  # Security Group
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "SecurityGroups"
    value     = aws_security_group.elastic_beanstalk.id
  }

  tags = var.tags

  depends_on = [
    aws_db_instance.fittrack,
    aws_iam_instance_profile.elastic_beanstalk_ec2,
    aws_security_group.elastic_beanstalk
  ]
}


# ========================================
# CloudFront Managed Policies (استيراد من AWS)
# ========================================
data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_cache_policy" "caching_disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_origin_request_policy" "all_viewer" {
  name = "Managed-AllViewer"
}

data "aws_cloudfront_origin_request_policy" "all_viewer_except_host" {
  name = "Managed-AllViewerExceptHostHeader"
}

# ========================================
# CloudFront Distribution (يجب أن يكون بعد EB)
# ========================================
resource "aws_cloudfront_distribution" "frontend" {
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3Frontend"
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.frontend.cloudfront_access_identity_path
    }
  }

  origin {
    domain_name = aws_elastic_beanstalk_environment.fittrack.cname
    origin_id   = "ElasticBeanstalkAPI"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Frontend"
	
    cache_policy_id          = data.aws_cloudfront_cache_policy.caching_optimized.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id
	
    viewer_protocol_policy = "redirect-to-https"
    min_ttl = 0
    default_ttl = 3600
    max_ttl = 86400
  }

  ordered_cache_behavior {
    path_pattern     = "/api/*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ElasticBeanstalkAPI"
	
	cache_policy_id          = data.aws_cloudfront_cache_policy.caching_disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer_except_host.id
	
    viewer_protocol_policy = "https-only"
    min_ttl = 0
    default_ttl = 0
    max_ttl = 0
  }

  ordered_cache_behavior {
    path_pattern     = "/static/*"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Frontend"
	cache_policy_id          = data.aws_cloudfront_cache_policy.caching_optimized.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id
    viewer_protocol_policy = "https-only"
    min_ttl = 31536000
    default_ttl = 31536000
    max_ttl = 31536000
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = var.tags

  depends_on = [aws_elastic_beanstalk_environment.fittrack] # تم إصلاح الاعتمادية
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AllowCloudFront"
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.frontend.arn}/*"
      Condition = { StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn } }
    }]
  })
  depends_on = [aws_cloudfront_distribution.frontend]
}

# ========================================
# Outputs
# ========================================
output "frontend_url" {
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
  description = "Frontend URL"
}

output "api_url" {
  value       = aws_elastic_beanstalk_environment.fittrack.endpoint_url
  description = "Backend API URL"
}

output "database_endpoint" {
  value       = aws_db_instance.fittrack.endpoint
  description = "RDS Endpoint"
  sensitive   = true
}

output "db_password" {
  value     = var.db_password
  sensitive = true
  description = "Database password (use with -raw to show)"
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.fittrack.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.fittrack_web.id
}

output "cognito_identity_pool_id" {
  value       = aws_cognito_identity_pool.fittrack.id
  description = "Cognito Identity Pool ID"
}

output "frontend_bucket" {
  value = aws_s3_bucket.frontend.bucket
}