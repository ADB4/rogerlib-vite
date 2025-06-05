import flask
from rogerlib import app
from flask_cors import cross_origin

@app.route('/', methods=['GET'])
@cross_origin()
def show_index():
    return flask.render_template("index.html")

@app.route('/about', methods=['GET'])
@cross_origin()
def show_about():
    return flask.render_template("index.html")

@app.route('/cntct', methods=['GET'])
@cross_origin()
def show_cntct():
    return flask.render_template("index.html")

@app.route('/changelog', methods=['GET'])
@cross_origin()
def show_changelog():
    return flask.render_template("index.html")

@app.route('/gallery', methods=['GET'])
@cross_origin()
def show_gallery():
    """Display / route"""
    return flask.render_template("index.html")
