# Configuration for rogerlib-vite Docker image
#

# Use a minimal Python image as a parent image
FROM python:3.13.1

# Copy list of production requirements into Docker container
COPY requirements.txt /tmp

# Install Python package requirements
RUN pip install -r /tmp/requirements.txt

# Copy application into image
COPY dist/rogerlib-0.1.0.tar.gz /tmp

# Install rogerlib web app
RUN pip install /tmp/rogerlib-0.1.0.tar.gz

# Run the web server in the container
CMD gunicorn \
  --workers 4 \
  --bind 0.0.0.0:8000 \
  rogerlib:app

# start new file

# Multi-stage build for frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Production image
FROM python:3.13.1

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy application code
COPY rogerlib/ ./rogerlib/
COPY bin/ ./bin/

# Copy built frontend (optional, if serving from container)
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
#  CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# Run with gunicorn
CMD ["gunicorn", "--bind", "localhost:5000", "--workers", "8", "-D", "rogerlib:app"]