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