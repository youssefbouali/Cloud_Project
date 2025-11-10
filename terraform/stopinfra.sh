#!/bin/bash
set -e

echo "Pausing FitTrack AWS Infrastructure..."

# --- RDS ---
DB_IDENTIFIER=$(terraform output -raw db_instance_identifier 2>/dev/null || echo "fittrack-dev-db")
echo "Stopping RDS: $DB_IDENTIFIER"
aws rds stop-db-instance --db-instance-identifier $DB_IDENTIFIER || echo "RDS already stopped or not found"

# --- Elastic Beanstalk ---
EB_ENV_NAME=$(terraform output -raw eb_environment_name 2>/dev/null || echo "fittrack-dev-env")
echo "Scaling EB to 0: $EB_ENV_NAME"
aws elasticbeanstalk update-environment \
  --environment-name $EB_ENV_NAME \
  --option-settings \
    Namespace=aws:autoscaling:asg,OptionName=MinSize,Value=0 \
    Namespace=aws:autoscaling:asg,OptionName=MaxSize,Value=0 || echo "EB already scaled down"

# --- CloudFront ---
CF_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")
if [ -n "$CF_ID" ]; then
  echo "Disabling CloudFront: $CF_ID"
  CONFIG=$(aws cloudfront get-distribution-config --id $CF_ID --query 'DistributionConfig' --output json)
  ETAG=$(aws cloudfront get-distribution-config --id $CF_ID --query 'ETag' --output text)
  echo "$CONFIG" | jq '.Enabled=false' > /tmp/cf-config.json
  aws cloudfront update-distribution --id $CF_ID --distribution-config file:///tmp/cf-config.json --if-match $ETAG || echo "CloudFront already disabled"
fi

echo "All billable resources paused!"
echo "To resume: run 'resume-fittrack.sh'"