#!/bin/bash
set -e

echo "Quick Deploy Script"
echo "====================="

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "AWS CLI not configured. Run 'aws configure' first."
    exit 1
fi

# Build frontend
echo "Building frontend..."
cd frontend
npm ci
npm run build
cd ..

# Upload to S3
echo "Uploading to S3..."
aws s3 cp rogerlib/static/assets/bundle.roger.js \
  s3://static.rogerlib.com/static/js/rogerlib/bundle.roger.js \
  --cache-control "public, max-age=31536000"

aws s3 cp rogerlib/static/assets/styles.css \
  s3://static.rogerlib.com/static/js/rogerlib/styles.css \
  --cache-control "public, max-age=31536000"

# Invalidate CloudFront (optional, costs money)
read -p "Invalidate CloudFront cache? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    DIST_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[0]=='d2fhlomc9go8mv.cloudfront.net'].Id" --output text)
    aws cloudfront create-invalidation --distribution-id $DIST_ID \
      --paths "/static/js/rogerlib/*"
fi

echo "Frontend deployed!"

# Ask about backend
read -p "Deploy backend too? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Building and pushing Docker image..."
    docker build -t $DOCKER_USERNAME/rogerlib:latest .
    docker push $DOCKER_USERNAME/rogerlib:latest
    
    echo "Deploying to Digital Ocean..."
    ssh root@$DO_HOST "cd /opt/rogerlib && docker-compose pull && docker-compose up -d"
    
    echo "Backend deployed!"
fi

echo "Deployment complete!"