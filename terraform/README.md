# FitTrack Infrastructure as Code (Terraform)

This directory contains Terraform code to provision all AWS infrastructure for the FitTrack application.

## Architecture Overview

The infrastructure includes:

- **Cognito**: User authentication and authorization
- **S3**: Frontend static hosting and activity photo storage
- **CloudFront**: CDN for frontend and activity photos
- **RDS PostgreSQL**: Database for activities and users
- **Elastic Beanstalk**: Backend application hosting
- **Secrets Manager**: Secure storage for credentials
- **VPC**: Network infrastructure with public and private subnets

## Prerequisites

1. **AWS Account** - Active AWS account with appropriate permissions
2. **Terraform** - Version 1.0 or higher ([Install](https://www.terraform.io/downloads))
3. **AWS CLI** - Configured with your credentials ([Configure](https://docs.aws.amazon.com/cli/latest/userguide/configure-quickstart.html))
4. **Terraform State Backend** - S3 bucket and DynamoDB table for state (see below)

## Setup S3 Backend for Terraform State

Before running Terraform, create an S3 bucket and DynamoDB table to store Terraform state:

```bash
# Create S3 bucket for state
aws s3api create-bucket \
  --bucket fittrack-terraform-state \
  --region us-east-1

# Enable versioning on the bucket
aws s3api put-bucket-versioning \
  --bucket fittrack-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

## Configuration

### 1. Create Variables File

Copy the example variables file:

```bash
cp terraform.tfvars.example terraform.tfvars
```

### 2. Update terraform.tfvars

Edit `terraform.tfvars` and update:

```hcl
aws_region  = "us-east-1"
environment = "dev"
app_name    = "fittrack"

# Database Configuration
db_name           = "fittrack_db"
db_username       = "postgres"
db_password       = "ChangeThisStrongPassword123!"
db_instance_class = "db.t3.micro"

# Optional: Add your custom domain names
frontend_domain = "fittrack.example.com"
api_domain      = "api.fittrack.example.com"
```

### 3. Initialize Terraform

```bash
terraform init
```

This downloads the required providers and initializes the backend.

## Planning and Applying Infrastructure

### Review Changes

```bash
terraform plan -out=tfplan
```

This shows all resources that will be created.

### Apply Configuration

```bash
terraform apply tfplan
```

This provisions all AWS resources.

## Deployment

Once Terraform completes successfully:

1. **Retrieve Outputs**:
   ```bash
   terraform output
   ```

2. **Configure Frontend Environment Variables**:
   
   Update `frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_ENDPOINT=https://api.fittrack.example.com
   NEXT_PUBLIC_AWS_REGION=us-east-1
   NEXT_PUBLIC_COGNITO_USER_POOL_ID=<from terraform output>
   NEXT_PUBLIC_COGNITO_CLIENT_ID=<from terraform output>
   NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=<from terraform output>
   NEXT_PUBLIC_S3_BUCKET=<from terraform output>
   NEXT_PUBLIC_CLOUDFRONT_DOMAIN=<from terraform output>
   ```

3. **Build and Deploy Frontend**:
   ```bash
   cd frontend
   npm run build
   npm run deploy:s3
   npm run deploy:invalidate
   ```

4. **Deploy Backend to Elastic Beanstalk**:
   ```bash
   cd backend
   npm run build
   eb init -p "Node.js 18 running on 64bit Amazon Linux 2"
   eb create fittrack-prod
   eb deploy
   ```

## Managing Infrastructure

### Update Existing Resources

```bash
# Modify terraform.tfvars as needed
terraform plan
terraform apply
```

### View Current State

```bash
terraform show
terraform state list
```

### Destroy Infrastructure (Caution!)

```bash
terraform destroy
```

This will delete all AWS resources. Use with caution!

## Monitoring and Logs

### Check Elastic Beanstalk Logs

```bash
eb logs
```

### View CloudWatch Logs

```bash
aws logs tail /aws/elasticbeanstalk/fittrack-dev-env/var/log/eb-engine.log --follow
```

### Monitor RDS

```bash
aws rds describe-db-instances --db-instance-identifier fittrack-dev-db
```

## Cost Management

### Estimate Costs

```bash
terraform plan
# Review the output for resource creation costs
```

### Cost Optimization Tips

1. Use smaller instance types for development (`db.t3.micro`)
2. Set up auto-scaling for Elastic Beanstalk
3. Use S3 Intelligent-Tiering for storage
4. Enable CloudFront to reduce bandwidth costs

## Troubleshooting

### Error: "state lock timeout"

Another user is modifying the infrastructure. Wait for the lock to clear.

### Error: "Insufficient capacity"

Try a different availability zone or instance type in `terraform.tfvars`.

### Error: "Authorization failed"

Verify your AWS credentials are configured:

```bash
aws sts get-caller-identity
```

## Terraform Files Structure

- **provider.tf** - AWS provider and backend configuration
- **variables.tf** - Input variables
- **cognito.tf** - AWS Cognito configuration
- **s3.tf** - S3 buckets for frontend and photos
- **cloudfront.tf** - CloudFront distributions
- **rds.tf** - PostgreSQL database
- **elastic_beanstalk.tf** - Backend application hosting
- **networking.tf** - VPC and networking
- **secrets.tf** - Secrets Manager
- **outputs.tf** - Output values

## Security Best Practices

1. **Secrets Management**:
   - Never commit `terraform.tfvars` with real passwords
   - Use AWS Secrets Manager for sensitive data
   - Rotate secrets regularly

2. **IAM**:
   - Use least privilege principle
   - Enable MFA for AWS console
   - Audit IAM roles regularly

3. **Network**:
   - Keep databases in private subnets
   - Use security groups to restrict access
   - Enable VPC Flow Logs

4. **Encryption**:
   - Enable RDS encryption
   - Use HTTPS/TLS for all communications
   - Encrypt S3 buckets

## Additional Resources

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Security Best Practices](https://aws.amazon.com/architecture/security-identity-compliance/)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices.html)
