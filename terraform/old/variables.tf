variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "fittrack"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "fittrack_db"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  sensitive   = true
  default     = "postgres"
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
  default     = ""
}

variable "db_instance_class" {
  description = "Database instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Database allocated storage in GB"
  type        = number
  default     = 20
}

variable "cognito_password_min_length" {
  description = "Cognito password minimum length"
  type        = number
  default     = 8
}

variable "frontend_domain" {
  description = "Frontend domain name"
  type        = string
  default     = ""
}

variable "api_domain" {
  description = "API domain name"
  type        = string
  default     = ""
}

variable "enable_https" {
  description = "Enable HTTPS/SSL"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default = {
    Project     = "FitTrack"
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}
