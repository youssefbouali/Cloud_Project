#!/bin/bash

set -e

echo "FitTrack Frontend S3 Deployment Script"
echo "========================================"

# Check if bucket name is provided
if [ -z "$AWS_S3_BUCKET" ]; then
  echo "Error: AWS_S3_BUCKET environment variable not set"
  echo "Usage: AWS_S3_BUCKET=your-bucket-name npm run deploy:s3"
  exit 1
fi

# Check if CloudFront distribution ID is provided
if [ -z "$AWS_CLOUDFRONT_DISTRIBUTION_ID" ]; then
  echo "Warning: AWS_CLOUDFRONT_DISTRIBUTION_ID not set. Cache invalidation will be skipped."
fi

# Build the application
echo "Building application..."
npm run export

if [ ! -d "out" ]; then
  echo "Error: Build failed. 'out' directory not found."
  exit 1
fi

# Sync to S3
echo "Syncing files to S3 bucket: $AWS_S3_BUCKET"
aws s3 sync out s3://$AWS_S3_BUCKET \
  --delete \
  --cache-control "public, max-age=3600" \
  --exclude ".next/*"

# Sync static assets with longer cache
echo "Syncing static assets..."
aws s3 sync out/_next s3://$AWS_S3_BUCKET/_next \
  --cache-control "public, max-age=31536000, immutable" \
  --delete

# Create CloudFront invalidation
if [ -n "$AWS_CLOUDFRONT_DISTRIBUTION_ID" ]; then
  echo "Creating CloudFront invalidation for distribution: $AWS_CLOUDFRONT_DISTRIBUTION_ID"
  aws cloudfront create-invalidation \
    --distribution-id $AWS_cloudfront_DISTRIBUTION_ID \
    --paths "/*"
fi

echo ""
echo "Deployment complete!"
echo "Frontend URL: https://d${AWS_CLOUDFRONT_DISTRIBUTION_ID}.cloudfront.net"
