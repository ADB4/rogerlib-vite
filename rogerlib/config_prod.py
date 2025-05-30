"""
Production configuration.
"""
import os

# Secret key for encrypting cookies.
SECRET_KEY = os.environ.get("FLASK_SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("No FLASK_SECRET_KEY environment variable.")
POSTGRESQL_DATABASE_PASSWORD = os.environ.get("POSTGRESQL_DATABASE_PASSWORD")
if not POSTGRESQL_DATABASE_PASSWORD:
    raise ValueError("No POSTGRESQL_DATABASE_PASSWORD environment variable.")

# Production Database Config

# Use your own AWS database host
POSTGRESQL_DATABASE_HOST = "FIXME_AWS_RDS_HOSTNAME" 
POSTGRESQL_DATABASE_PORT = 5432
POSTGRESQL_DATABASE_USER = "postgres"
POSTGRESQL_DATABASE_DB = "rogerlib"

# AWS S3 static files
# https://flask-s3.readthedocs.io/en/latest/
FLASKS3_DEBUG = True
FLASKS3_ACTIVE = True
FLASKS3_BUCKET_NAME = 'static.rogerlib.com'
FLASKS3_REGION = "us-east-2"
FLASKS3_FORCE_MIMETYPE = True
FLASKS3_USE_HTTPS = False
FLASKS3_CDN_DOMAIN = 'd2fhlomc9go8mv.cloudfront.netE'

AWS_S3_DOWNLOAD_BUCKET = 'downloads.rogerlib.com'


