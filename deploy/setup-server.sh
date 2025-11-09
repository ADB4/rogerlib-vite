#!/bin/bash
set -e

echo "Setting up Digital Ocean droplet for rogerlib"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

# Update system
echo "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install Docker
echo "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl start docker
    systemctl enable docker
else
    echo "Docker already installed"
fi

# Install Docker Compose
echo "Installing Docker Compose..."
if ! docker compose version &> /dev/null; then
    apt-get install -y docker-compose-plugin
else
    echo "Docker Compose already installed"
fi

# Verify installation
docker --version
docker compose version

cd rogerlib-vite
# Create application directory
echo "Creating application directory..."
mkdir -p /opt/rogerlib
cd /opt/rogerlib

# Prompt for credentials
echo ""
echo "Please enter your credentials:"
read -p "Docker Hub Username: " DOCKER_USER
read -sp "Flask Secret Key: " FLASK_KEY
echo ""
read -p "AWS Access Key: " AWS_KEY
read -sp "AWS Secret Key: " AWS_SECRET
echo ""

# Create .env file
cat > .env <<EOF
DOCKER_USERNAME=$DOCKER_USER
FLASK_SECRET_KEY=$FLASK_KEY
AWS_ACCESS_KEY=$AWS_KEY
AWS_SECRET_KEY=$AWS_SECRET
EOF

chmod 600 .env

# Create docker-compose.yml
cat > docker-compose.yml <<'EOF'
version: '3.8'

services:
  web:
    image: ${DOCKER_USERNAME}/rogerlib:latest
    restart: always
    environment:
      - FLASK_ENV=production
      - FLASK_SECRET_KEY=${FLASK_SECRET_KEY}
      - POSTGRESQL_DATABASE_PASSWORD=unused
      - AWS_ACCESS_KEY=${AWS_ACCESS_KEY}
      - AWS_SECRET_KEY=${AWS_SECRET_KEY}
    networks:
      - app-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - /var/log/nginx:/var/log/nginx
    depends_on:
      - web
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
EOF

# Create nginx.conf
cat > nginx.conf <<'EOF'
events {
    worker_connections 1024;
}

http {
    upstream flask_app {
        server web:8000;
    }

    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    server {
        listen 80;
        server_name rogerlibrary.com www.rogerlibrary.com;
        
        location / {
            proxy_pass http://flask_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_redirect off;
        }
        
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://flask_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /health {
            proxy_pass http://flask_app;
            access_log off;
        }
    }
}
EOF

# Create SSL directory
mkdir -p ssl

# Setup firewall
echo "Configuring firewall..."
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Pull and start the application
echo "Pulling and starting application..."
docker pull $DOCKER_USER/rogerlib:latest
docker compose up -d

echo ""
echo "Setup complete!"
echo ""
echo "Your application should be running at http://$(curl -s ifconfig.me)"
echo ""
echo "Next steps:"
echo "1. Configure your domain DNS to point to this IP"
echo "2. Setup SSL certificates (Let's Encrypt recommended)"
echo "3. Update nginx.conf with your domain name"
echo ""
echo "Check status with: docker compose ps"
echo "View logs with: docker compose logs -f"