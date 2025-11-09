#!/bin/bash
set -e

echo "Setting up server"

# Update system
apt-get update
apt-get upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    apt-get install -y docker-compose-plugin
fi

# Create application directory
mkdir -p /opt/rogerlib
cd /opt/rogerlib

# Create .env file (you'll need to edit this with real values)
cat > .env <<EOF
DOCKER_USERNAME=your-dockerhub-username
FLASK_SECRET_KEY=your-secret-key-here
AWS_ACCESS_KEY=your-aws-access-key
AWS_SECRET_KEY=your-aws-secret-key
EOF

echo "IMPORTANT: Edit /opt/rogerlib/.env with your actual credentials"

# Create nginx.conf (copy the content from above)
# Create docker-compose.yml (copy the content from above)

# Create SSL directory
mkdir -p ssl

# Setup log rotation
cat > /etc/logrotate.d/docker-nginx <<EOF
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
    postrotate
        docker-compose -f /opt/rogerlib/docker-compose.yml exec nginx nginx -s reload
    endscript
}
EOF

echo "Setup complete"
echo "Next steps:"
echo "1. Edit /opt/rogerlib/.env with your credentials"
echo "2. Add SSL certificates to /opt/rogerlib/ssl/"
echo "3. Run: cd /opt/rogerlib && docker-compose pull && docker-compose up -d"