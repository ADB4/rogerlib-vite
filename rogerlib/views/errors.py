import flask
from rogerlib import app

@app.errorhandler(404)
def not_found_error(error):
    context = {'error': 404}
    print("error 404")
    print(error)
    return flask.render_template('error.html', **context)

@app.errorhandler(500)
def internal_error(error):
    context = {'error': 500}
    print("error 500")
    return flask.render_template('error.html', **context)
