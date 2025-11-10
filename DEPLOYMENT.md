# FitTrack Full Stack Deployment Guide

This guide covers deploying FitTrack with Redux, Cognito, and AWS infrastructure (Elastic Beanstalk, S3, CloudFront).

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      FITTRACK ARCHITECTURE                   │
└─────────────────────────────────────────────────────────────┘

┌─ FRONTEND (S3 + CloudFront) ─────────────────────────────┐
│                                                             │
│  CloudFront CDN                                             │
│  └─> S3 Static Hosting                                      │
│      ├─> Next.js React App (Redux Store)                   │
│      ├─> Login/Register Pages                              │
│      └─> Dashboard                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
              │
              └─> COGNITO (Authentication)
                  └─> Manage Users & Sessions

┌─ BACKEND (Elastic Beanstalk) ────────────────────────────┐
│                                                             │
│  NestJS API                                                 │
│  ├─> Auth Controller (Cognito Token Validation)            │
│  ├─> Activities Controller                                  │
│  ├─> Users Service                                          │
│  └─> Prisma ORM                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
              │
              └─> RDS PostgreSQL (Database)
              └─> S3 (Activity Photos)
                  └─> CloudFront (CDN for Photos)

Secrets Manager
└─> Store: DB Credentials, Cognito Settings, AWS Keys
```

## Prerequisites

1. **AWS Account** with billing enabled
2. **AWS CLI** v2 installed and configured
3. **Terraform** v1.0+
4. **Node.js** 18+
5. **Git** (for version control)
6. **Bash** (for deployment scripts)

## Step 1: Prepare Infrastructure

### 1.1 Create S3 Backend for Terraform State

```bash
# Create S3 bucket
aws s3api create-bucket \
  --bucket fittrack-terraform-state-$(date +%s) \
  --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket fittrack-terraform-state-XXXXX \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

### 1.2 Update Terraform Backend Configuration

Edit `terraform/provider.tf` and update the S3 bucket name:

```hcl
backend "s3" {
  bucket = "fittrack-terraform-state-XXXXX"  # Your bucket name
  key    = "prod/terraform.tfstate"
  region = "us-east-1"
}
```

## Step 2: Deploy Infrastructure with Terraform

### 2.1 Initialize Terraform

```bash
cd terraform
terraform init
```

### 2.2 Create terraform.tfvars

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:

```hcl
aws_region     = "us-east-1"
environment    = "prod"
app_name       = "fittrack"
db_username    = "postgres"
db_password    = "GenerateStrongPassword123!"
db_instance_class = "db.t3.micro"

# Optional: Add your domains after setting up Route53
frontend_domain = "fittrack.example.com"
api_domain      = "api.fittrack.example.com"

tags = {
  Project     = "FitTrack"
  Environment = "prod"
  Owner       = "YourName"
}
```

### 2.3 Plan and Apply Infrastructure

```bash
# Review changes
terraform plan -out=tfplan

# Apply infrastructure (takes 20-30 minutes)
terraform apply tfplan
```

### 2.4 Save Terraform Outputs

```bash
# Export outputs to file
terraform output > outputs.json

# Extract specific values
COGNITO_USER_POOL_ID=$(terraform output -raw cognito_user_pool_id)
COGNITO_CLIENT_ID=$(terraform output -raw cognito_user_pool_client_id)
CLOUDFRONT_DOMAIN=$(terraform output -raw frontend_cloudfront_domain)
PHOTOS_CLOUDFRONT=$(terraform output -raw photos_cloudfront_domain)
EB_ENDPOINT=$(terraform output -raw elastic_beanstalk_endpoint)
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
```

## Step 3: Deploy Frontend

### 3.1 Configure Frontend Environment

Update `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_ENDPOINT=https://api.fittrack.example.com
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_S3_BUCKET=fittrack-photos-prod-xxxxxxxx
NEXT_PUBLIC_CLOUDFRONT_DOMAIN=https://d123456789.cloudfront.net
```

### 3.2 Build Frontend

```bash
cd frontend
npm install
npm run build
npm run export
```

### 3.3 Deploy to S3 and CloudFront

```bash
# Set AWS credentials
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_S3_BUCKET=fittrack-frontend-prod-xxxxxxxx
export AWS_CLOUDFRONT_DISTRIBUTION_ID=E123ABCDEF456

# Make script executable
chmod +x scripts/deploy-s3.sh

# Run deployment script
./scripts/deploy-s3.sh
```

Or use npm script:

```bash
npm run deploy:s3
npm run deploy:invalidate
```

## Step 4: Deploy Backend

### 4.1 Configure Backend Environment

Update `backend/.env`:

```bash
NODE_ENV=production
PORT=5000

# Get from Terraform outputs
DATABASE_URL=postgresql://postgres:password@fittrack-dev-db.xxxxx.rds.amazonaws.com:5432/fittrack_db
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx

# Frontend URLs
FRONTEND_URL=https://fittrack.example.com
CLOUDFRONT_DOMAIN=https://d123456789.cloudfront.net
```

### 4.2 Build Backend

```bash
cd backend
npm install
npm run build
```

### 4.3 Deploy to Elastic Beanstalk

#### Option A: Using EB CLI (Recommended)

```bash
# Install EB CLI
pip install awsebcli

# Initialize Elastic Beanstalk
cd backend
eb init -p "Node.js 18 running on 64bit Amazon Linux 2" fittrack-prod

# Create environment
eb create fittrack-prod-env --instance-type t3.micro

# Deploy
eb deploy

# View logs
eb logs
eb ssh
```

#### Option B: ZIP and Upload Manually

```bash
# Create deployment package
cd backend
npm run build

# Create ZIP file
zip -r fittrack-backend.zip dist/ package.json .ebextensions/ node_modules/

# Upload to Elastic Beanstalk
aws elasticbeanstalk create-application-version \
  --application-name fittrack-prod \
  --version-label v1 \
  --source-bundle S3Bucket=fittrack-builds,S3Key=fittrack-backend.zip

# Deploy version
aws elasticbeanstalk update-environment \
  --application-name fittrack-prod \
  --environment-name fittrack-prod-env \
  --version-label v1
```

### 4.4 Verify Backend Deployment

```bash
# Check health
curl https://api.fittrack.example.com/api/health

# View logs
aws logs tail /aws/elasticbeanstalk/fittrack-prod-env/var/log/eb-engine.log --follow
```

## Step 5: Configure Custom Domains (Optional)

### 5.1 Set Up Route53

```bash
# List hosted zones
aws route53 list-hosted-zones

# Create alias records for CloudFront
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123ABCDEF456 \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "fittrack.example.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "d123456789.cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
```

### 5.2 Set Up ACM SSL Certificate

```bash
# Request certificate
aws acm request-certificate \
  --domain-name fittrack.example.com \
  --validation-method DNS

# Once issued, update CloudFront distribution to use certificate
```

## Step 6: Post-Deployment Setup

### 6.1 Initialize Database

```bash
# SSH into Elastic Beanstalk instance
eb ssh

# Run migrations (should be automatic via .ebextensions)
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

### 6.2 Test Authentication Flow

1. Go to `https://fittrack.example.com`
2. Click "Sign Up"
3. Create a test account
4. Verify email (check spam folder)
5. Login with credentials
6. Add test activity
7. Verify photo upload to S3

### 6.3 Monitor Deployment

```bash
# CloudWatch Logs
aws logs describe-log-groups --query 'logGroups[?contains(logGroupName, `fittrack`)].logGroupName'

# RDS Monitoring
aws rds describe-db-instances --db-instance-identifier fittrack-prod-db

# Elastic Beanstalk Monitoring
aws elasticbeanstalk describe-environments --application-name fittrack-prod

# CloudFront Metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value=E123ABCDEF456 \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

## Troubleshooting

### Frontend not loading

1. Check S3 bucket policy
2. Verify CloudFront distribution is enabled
3. Check CloudFront cache settings
4. Verify CORS configuration

### Backend not connecting to database

1. Check RDS security group rules
2. Verify DATABASE_URL in EB environment
3. Check RDS parameter group settings
4. Verify VPC routing

### Authentication failures

1. Check Cognito User Pool configuration
2. Verify client ID in frontend env variables
3. Check CORS settings in backend
4. Review Cognito logs

### S3 photo upload failures

1. Check S3 bucket CORS configuration
2. Verify IAM role permissions
3. Check Cognito identity pool configuration
4. Review CloudFront cache settings

## Cost Optimization

1. Use reserved instances for RDS
2. Set CloudFront auto-deletion policies
3. Enable S3 Intelligent-Tiering
4. Use Lambda@Edge for optimization
5. Monitor CloudWatch for unused resources

## Cleanup

To destroy all infrastructure:

```bash
cd terraform
terraform destroy
```

**Warning**: This will delete all data. Ensure you have backups.

## Next Steps

1. Set up CI/CD pipeline (GitHub Actions, CodePipeline)
2. Enable AWS WAF for protection
3. Configure CloudWatch alarms
4. Set up backup and disaster recovery
5. Implement custom domain with SSL
6. Set up email notifications
7. Enable access logging for S3 and CloudFront

## Support

For issues:

- Check AWS CloudWatch logs
- Review Terraform state file
- Consult AWS documentation
- Review application logs

---

**Last Updated**: 2024
**Infrastructure Version**: 1.0
**Terraform Version**: 1.5+
