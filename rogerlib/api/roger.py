
from re import M
import flask
import datetime
from rogerlib import app
import json
import os
import random
import secrets
from rogerlib.views.util import fetch_one_from_json, fetch_all_json, fetch_json_s3, fetch_categories, fetch_categories_json, fetch_presigned_url, fetch_quote_s3, fetch_markdown_s3, fetch_deets, fetch_changelog

@app.route('/api/v1/cntct/', methods=['GET'])
def get_cntct():
    cntct = "buiand@proton.me"
    roger = "andy@rogerlibrary.com"
    info = fetch_markdown_s3('markdown/cntct/contact.md')
    deets = fetch_deets()
    context = {
        'cntct': cntct,
        'github': deets['github'],
        'bluesky': deets['bluesky'],
        'linkedin': deets['linkedin'],
        'roger': roger,
        'content': info['content'],
    }
    return flask.jsonify(**context)

@app.route('/api/v1/cntct/deets/', methods=['GET'])
def get_deets():
    deets = fetch_deets()
    print("hello")
    context = {
        'deets': deets
    }
    return flask.jsonify(**context)

@app.route('/api/v1/images/items/all/', methods=['GET'])
def get_all_item_images():
    context = {}
    return flask.jsonify(**context)

@app.route('/api/v1/items/<itemcode>/', methods=['GET'])
def get_item(itemcode):
    """Return item from itemcode"""
    ct = datetime.datetime.now()

    model = fetch_json_s3(str.format("models/{0}/{0}.json"))
    # model = fetch_one_from_json(itemcode.lower())

    context = {
        'timestamp': str(ct),
        'preview': model['preview'],
        'imagepath': model['imagepath'],
        'models': model['models'],
        'texturemap': model['texturemap'],
        'texturesets': model['texturesets'],
        'itemcode': itemcode,
        'itemname': model['itemname'],
        'category': model['category'],
        'subcategory': model['subcategory'],
        'lods': model['lods'],
        'lodmap': model['lodmap'],
        'polycount': model['polycount'],
        'material': model['material'],
        'colormap': model['colormap'],
        'colors': model['colorcodes'],
        'description': model['description'],
        'creatornote': model['creatornote'],
        'shader': model['shader'],
        'version': model['version'],
        'url': flask.request.path,
    }
    return flask.jsonify(**context)

@app.route('/api/v1/items/all/', methods=['GET'])
def get_all_items():
    """Return all items"""
    ct = datetime.datetime.now()
    result = fetch_all_json()
    context = {
        'models': result,
        'timestamp': str(ct),
        'url': flask.request.path,
    }
    return flask.jsonify(**context)

@app.route('/api/v1/categories/all/', methods=['GET'])
def get_categories():
    ct = datetime.datetime.now()
    result = fetch_categories_json()
    context = {
        'categories': result,
        'timestamp': str(ct),
        'url': flask.request.path,
    }
    return flask.jsonify(**context)

@app.route('/api/v1/quotes/random/', methods=['GET'])
def get_quotes():
    context = fetch_quote_s3()
    return flask.jsonify(**context)

@app.route('/api/v1/changelog/', methods=['GET'])
def get_changelog():
    ct = datetime.datetime.now()
    changelog = fetch_changelog()
    context = {
        'changelog': changelog,
        'timestamp': str(ct),
        'url': flask.request.path,
    }
    return flask.jsonify(**context)

@app.route('/api/v1/downloads/<itemcode>', methods=['GET'])
def serve_download(itemcode):
    ct = datetime.datetime.now()
    presigned_url = fetch_presigned_url(itemcode)
    # file = fetch_download(itemcode)
    print(str.format("Fetched presigned url: {0}",presigned_url))
    # try download
    context = {
        'presigned_url': presigned_url,
        'timestamp': str(ct),
    }
    return flask.jsonify(**context)
