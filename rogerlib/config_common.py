"""
rogerlib common configuration
"""
import pathlib

# Root of this application, useful if it doesn't occupy an entire domain
APPLICATION_ROOT = '/'
CORS_HEADERS = 'Content-Type'
# Cookies
SESSION_COOKIE_NAME = 'login'

# File upload limitations
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])
MAX_CONTENT_LENGTH = 16 * 1024 * 1024

# Local file upload to var/uploads/
ROGERLIB_ROOT = pathlib.Path(__file__).resolve().parent.parent
