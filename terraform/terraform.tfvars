aws_region  = "us-east-1"
environment = "dev"
app_name    = "fittrack"

# Database Configuration
db_name           = "fittrack_db"
db_username       = "postgres"
db_password       = "ChangeThisStrongPassword123!"
db_instance_class = "db.t3.micro"

# Domain Configuration (optional)
frontend_domain = ""
api_domain      = ""

# Tags
tags = {
  Project     = "FitTrack"
  Environment = "dev"
  ManagedBy   = "Terraform"
}
