
from re import M
import flask
import datetime
from rogerlib import app
import random
import secrets
from rogerlib.views.util import fetch_one_from_json, fetch_all_json, fetch_categories, fetch_categories_json, fetch_presigned_url, fetch_quote_s3, fetch_markdown_s3, fetch_deets

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

    model = fetch_one_from_json(itemcode.lower())

    context = {
        'timestamp': str(ct),
        'preview': model['preview'],
        'imagepath': model['imagepath'],
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
    context = {}
    models = []
    libraryinfo = "### Welcome to Roger Motorsports Library!&nbsp;  &nbsp;  \n#### Roger Motorsport Library (RML) is a repository of polygon-optimized 3D assets that are ready-for-use in game engines such as Unreal and Unity.&nbsp;  \n#### If you can use these models in the pursuit of a larger endeavor, such as environment design or as physics objects, please feel at liberty to use them royalty-free.&nbsp;  \n#### I'll be doing the same, and documenting the process in my weblog.&nbsp;"
    librarycontact = "### Questions?&nbsp;  &nbsp;  \n#### For questions, please find me at andy@rogerlibrary.com  \n#### You may also find my personal website below."
    for model in result:
        model_dict = {
            'preview': model['preview'],
            'imagepath': model['imagepath'],
            'itemcode': model['itemcode'],
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
        }
        models.append(model_dict)
    
    context = {
        'models': models,
        'timestamp': str(ct),
        'info': libraryinfo,
        'cntct': librarycontact,
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
