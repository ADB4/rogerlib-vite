"""
Production configuration.
"""
import os

# Secret key for encrypting cookies.
SECRET_KEY = os.environ.get("FLASK_SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("No FLASK_SECRET_KEY environment variable.")

# Not using PostgreSQL, but keeping for compatibility
POSTGRESQL_DATABASE_PASSWORD = os.environ.get("POSTGRESQL_DATABASE_PASSWORD", "unused")

# AWS S3 static files
FLASKS3_DEBUG = False  # Changed to False for production
FLASKS3_ACTIVE = True
FLASKS3_BUCKET_NAME = 'static.rogerlib.com'
FLASKS3_REGION = "us-east-2"
FLASKS3_FORCE_MIMETYPE = True
FLASKS3_USE_HTTPS = True  # Changed to True
FLASKS3_CDN_DOMAIN = 'd2fhlomc9go8mv.cloudfront.net'

AWS_ACCESS_KEY = os.environ.get('AWS_ACCESS_KEY')
AWS_SECRET_KEY = os.environ.get('AWS_SECRET_KEY')
AWS_S3_DOWNLOAD_BUCKET = 'downloads.rogerlib.com'