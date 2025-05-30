# rogerlib-api package initializer.
from flask import Flask
from flask_cors import CORS, cross_origin
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

import os
import flask_s3

app = Flask(__name__)
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["100 per minute"],
    storage_uri="memory://",
)
CORS = CORS(app, resources={r"/*": {"origins": ["https://d2fhlomc9go8mv.cloudfront.net","https://s3.us-east-2.amazonaws.com"]}})
app.config.from_object('rogerlib.config_common')

# Overlay production or development settings.  Set the environment variable
# FLASK_ENV=development for a development environment.  The default is
# production.
if os.environ['FLASK_ENV'] == "development":
    app.config.from_object('rogerlib.config_dev')
    s3 = flask_s3.FlaskS3(app)
else:
    app.config.from_object('rogerlib.config_prod')
    s3 = flask_s3.FlaskS3(app)

app.config.from_envvar('ROGERLIB_SETTINGS', silent=True)

import rogerlib.api

if __name__ == "__main__":
    app.run('0.0.0.0', debug=True, port=5000)
