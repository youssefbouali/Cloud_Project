#!/bin/bash
set -e

echo "Resuming FitTrack Infrastructure..."

# --- RDS ---
DB_IDENTIFIER=$(terraform output -raw db_instance_identifier 2>/dev/null || echo "fittrack-dev-db")
aws rds start-db-instance --db-instance-identifier $DB_IDENTIFIER

# --- EB ---
EB_ENV_NAME=$(terraform output -raw eb_environment_name 2>/dev/null || echo "fittrack-dev-env")
aws elasticbeanstalk update-environment \
  --environment-name $EB_ENV_NAME \
  --option-settings \
    Namespace=aws:autoscaling:asg,OptionName=MinSize,Value=1 \
    Namespace=aws:autoscaling:asg,OptionName=MaxSize,Value=2

# --- CloudFront ---
CF_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")
if [ -n "$CF_ID" ]; then
  CONFIG=$(aws cloudfront get-distribution-config --id $CF_ID --query 'DistributionConfig' --output json)
  ETAG=$(aws cloudfront get-distribution-config --id $CF_ID --query 'ETag' --output text)
  echo "$CONFIG" | jq '.Enabled=true' > /tmp/cf-config.json
  aws cloudfront update-distribution --id $CF_ID --distribution-config file:///tmp/cf-config.json --if-match $ETAG
fi

echo "Infrastructure resumed! Wait 5-10 mins for full availability."