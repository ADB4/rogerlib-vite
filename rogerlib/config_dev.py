"""
rogerlib development configuration
"""
import os
# Secret key for encrypting cookies.  Never hardcode this in production!
SECRET_KEY = os.environ.get("FLASK_SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("No FLASK_SECRET_KEY environment variable.")
POSTGRESQL_DATABASE_PASSWORD = os.environ.get("POSTGRESQL_DATABASE_PASSWORD")
if not POSTGRESQL_DATABASE_PASSWORD:
    raise ValueError("No POSTGRESQL_DATABASE_PASSWORD environment variable.")

# Development Database Config
POSTGRESQL_DATABASE_HOST = 'rogerlib.ch4kieukgz0i.us-east-2.rds.amazonaws.com'
POSTGRESQL_DATABASE_PORT = 5432
POSTGRESQL_DATABASE_USER = 'postgres'
POSTGRESQL_DATABASE_DB = "rogerlib"

CORS_HEADERS = 'Content-Type, Origin'
CORS_ORIGINS = ['https://ndybui.dev', 'https://d2fhlomc9go8mv.cloudfront.net']
# AWS S3 static files
# https://flask-s3.readthedocs.io/en/latest/
FLASKS3_DEBUG = True
FLASKS3_ACTIVE = True
FLASKS3_BUCKET_NAME = 'static.rogerlib.com'
FLASKS3_REGION = "us-east-2"
FLASKS3_FORCE_MIMETYPE = True
FLASKS3_USE_HTTPS = True
FLASKS3_CDN_DOMAIN = 'd2fhlomc9go8mv.cloudfront.net'

AWS_ACCESS_KEY = os.environ.get('AWS_ACCESS_KEY')
AWS_SECRET_KEY = os.environ.get('AWS_SECRET_KEY')
AWS_S3_DOWNLOAD_BUCKET = 'downloads.rogerlib.com'