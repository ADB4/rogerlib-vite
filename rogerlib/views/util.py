import bisect
import boto3
import hashlib
import json
import logging
import random
import rogerlib
import re
import os
import string
import secrets
import shutil

from botocore.exceptions import ClientError
from botocore.config import Config
from flask import Flask, Response

exclude = ['.DS_Store']

def fetch_download(itemcode):
    s3_client = boto3.client('s3')
    bucket = rogerlib.app.config["AWS_S3_DOWNLOAD_BUCKET"]
    hashInput_identifier = str.format("assets_{0}",itemcode)
    hash_identifier = hashlib.sha3_256(hashInput_identifier.encode())
    identifier_digest = hash_identifier.hexdigest()
    identifier = identifier_digest[:16]
    key = str.format("assets/rogerlib_{0}.zip",identifier_digest[:16])
    print(str.format("Downloading from S3: {0} == {1}",itemcode,identifier_digest[:16]))

    file = s3_client.get_object(Bucket=bucket, Key=key)
    generated_filename = str.format("rogerlibrary_{0}.zip", identifier)
    
    return Response(
            file['Body'].read(),
            mimetype="application/zip",
            headers={"Content-Disposition": str.format("attachment;filename={0}", generated_filename)}
    )

def fetch_presigned_url(itemcode):
    """
    Generate a presigned Amazon S3 URL that can be used to perform an action.

    :param s3_client: A Boto3 Amazon S3 client.
    :param client_method: The name of the client method that the URL performs.
    :param method_parameters: The parameters of the specified client method.
    :param expires_in: The number of seconds the presigned URL is valid for.
    :return: The presigned URL.
    """
    try:
        # print(str.format("Downloading file from S3: {0}", itemcode))
        s3_config = Config(region_name='us-east-2')
        s3_client = boto3.client('s3',
                                aws_access_key_id=rogerlib.app.config['AWS_ACCESS_KEY'],
                                aws_secret_access_key=rogerlib.app.config['AWS_SECRET_KEY'],
                                config=s3_config)
        bucket = rogerlib.app.config["AWS_S3_DOWNLOAD_BUCKET"]

        hashInput_identifier = str.format("assets_{0}",itemcode)
        hash_identifier = hashlib.sha3_256(hashInput_identifier.encode())
        identifier_digest = hash_identifier.hexdigest()
        filename = str.format("rogerlib_{0}.zip",identifier_digest[:16])
        key = str.format("assets/rogerlib_{0}.zip",identifier_digest[:16])
        print(str.format("Downloading from S3: {0} == {1}",itemcode,identifier_digest[:16]))
        methodParams = {
            'Bucket': bucket,
            'Key': key,
            'ResponseContentDisposition': str.format("attachment; filename={0}",filename),
            'ResponseContentType': "application/zip"
        }
        url = s3_client.generate_presigned_url(
            ClientMethod='get_object', 
            Params=methodParams, 
            ExpiresIn=600
        )
    except ClientError:
        raise
    return url

def fetch_deets():
    # very straightforward for now
    deets = {
        'bluesky': 'https://bsky.app/profile/andybui.bsky.social',
        'linkedin': 'TODO',
        'github': 'https://github.com/ADB4'
    }
    return deets

def fetch_resume():
    try:
        s3_config = Config(region_name='us-east-2')
        s3_client = boto3.client('s3',
                                aws_access_key_id=rogerlib.app.config['AWS_ACCESS_KEY'],
                                aws_secret_access_key=rogerlib.app.config['AWS_SECRET_KEY'],
                                config=s3_config)
        bucket = rogerlib.app.config["AWS_S3_DOWNLOAD_BUCKET"]
        methodParams = {
            'Bucket': bucket,
            'Key': "assets/andybuiresumex.pdf"
        }
        url = s3_client.generate_presigned_url(
            ClientMethod='get_object', 
            Params=methodParams, 
            ExpiresIn=600
        )
    except ClientError:
        raise
    return url

def fetch_obfuscated_path(model):
    category = model['category']
    subcategory = model['subcategory'].replace("_","")
    itemcode = model['itemcode']
        # construct obfuscated paths from sha3_256
    # /static/assets/category/subcategory/itemcode translates to ->
    # /<hash("static")>/<hash("assets")>/<hash(<category>)>/<hash(<category><subcategory>)>/<hash(<category><subcateogry><itemcode>)
    hashInput_static = "static"
    hashInput_assets = "assets"
    hashInput_subcategory = subcategory
    hashInput_itemcode = category+subcategory+itemcode
    hash_static = hashlib.sha3_256(hashInput_static.encode())
    hash_assets = hashlib.sha3_256(hashInput_assets.encode())
    hash_category = hashlib.sha3_256(category.encode())
    hash_subcategory = hashlib.sha3_256(hashInput_subcategory.encode())
    hash_itemcode = hashlib.sha3_256(hashInput_itemcode.encode())

    static_digest = hash_static.hexdigest()
    assets_digest = hash_assets.hexdigest()
    category_digest = hash_category.hexdigest()
    subcategory_digest = hash_subcategory.hexdigest()
    itemcode_digest = hash_itemcode.hexdigest()
    
    hashedObjectPath = str.format("static/{1}/{2}/{3}/{4}",
                                    static_digest[:8],
                                    assets_digest[:8],
                                    category_digest[:16],
                                    subcategory_digest[:16],
                                    itemcode_digest[:16])
    return hashedObjectPath

def parse_db(models):
    result = []
    for model in models:
        result.append(parse_item(model))
    return result

"""Returns item in organized format"""
def parse_item(model):
    itemcode = model["itemcode"]
    lodcount_raw = model["lodcount"]
    lodcounts = lodcount_raw.split(",")
    lodMap = {}
    lodArr = []
    triCountMap = {}
    i = 0
    for lod in lodcounts:
        lodKey = 'lod'+str(i)
        lodValue = 'LOD'+str(i)
        triCountMap[lodKey] = lod
        lodArr.append(lodKey)
        lodMap[lodKey] = lodValue
        i = i+1

    model['lods'] = lodArr
    model['lodmap'] = lodMap
    model['polycount'] = triCountMap
    # parse colors into dictionary for key=colorCode value=colorName
    colors_raw = model['colors']
    colorslist_raw = str(model['colors']).split(",")

    colorCodes = []
    colorsDict = {}

    for s in colorslist_raw:
        colorName = s.split("(")[0]
        colorCode = re.search(r'\(([^)]+)', s).group(1)
        colorsDict[colorCode] = colorName
        colorCodes.append(colorCode)

    model['colorcodes'] = colorCodes
    model['colormap'] = colorsDict

    category = model["category"]

     # construct obfuscated paths from sha3_256
    # /static/assets/category/subcategory/itemcode translates to ->
    # /<hash("static")>/<hash("assets")>/<hash(<category>)>/<hash(<category><subcategory>)>/<hash(<category><subcateogry><itemcode>)
    hashedObjectPath = fetch_obfuscated_path(model)

    # if dev environment, use local path instead of s3
    if os.environ['FLASK_ENV'] == "development":
        # for testing s3 on dev:
        objectPath = str.format("https://d2fhlomc9go8mv.cloudfront.net/{0}",hashedObjectPath)
    else:
        objectPath = str.format("https://d2fhlomc9go8mv.cloudfront.net/{0}",hashedObjectPath)

    previewPath = str.format("{0}/img/512p/{1}_{2}_preview.png",objectPath,category,itemcode.lower())
    imagePath = str.format("{0}/img/1024p/",objectPath)

   
    model['preview'] = previewPath
    model['imagepath'] = imagePath

    return model

# fetch paths for all images associated with an item
def fetch_item_images(resolution, itemcode):
    # connect to db
    cur = rogerlib.model.get_db()
    cur.execute(
        "SELECT itemcode, itemname, category, subcategory, material, colors, lodcount, description, creatornote, shader, version "
        "FROM models "
        "WHERE itemcode = %s",[itemcode.lower()]
    )
    model = cur.fetchone()

    item = parse_item(model)
    hashedObjectPath = fetch_obfuscated_path(model)
    objectPath = str.format("https://s3.us-east-2.amazonaws.com/static.rogerlib.com/{0}",hashedObjectPath)
    imagePath = str.format("{0}/img/{1}/",objectPath, resolution)
    category = item['category']
    modelLODs = item['lods']
    modelColors = item['colorcodes']
    modelShaders = ['flat', 'shaded']
    modelMats = ['solid','albedo']

    # construct every possible image string,
    imgList = []
    for lod in modelLODs:
        baseString = str.format("{0}_{1}_{2}_", category, itemcode, lod)
        for shader in modelShaders:
            shaderString = baseString + str.format("{0}_",shader)
            for mat in modelMats:
                matString = shaderString + str.format("{0}",mat)
                if mat == 'albedo':
                    for color in modelColors:
                        imgstring_nowf = matString + str.format("_{0}.jpg",color)
                        imgstring_wf = matString + str.format("_{0}_wf.jpg",color)
                        imgList.append(imgstring_nowf)  
                        imgList.append(imgstring_wf)
                else:
                    imgstring_nowf = matString + ".jpg"
                    imgstring_wf = matString + "_wf.jpg"
                    imgList.append(imgstring_nowf)  
                    imgList.append(imgstring_wf)
    
    result = {
        'imagepath': imagePath,
        'images': imgList
    }
    return result


# Fetch single item from db and return
def fetch_one(itemcode):
    # connect to db
    cur = rogerlib.model.get_db()
    cur.execute(
        "SELECT itemcode, itemname, category, subcategory, material, colors, lodcount, description, creatornote, shader, version "
        "FROM models "
        "WHERE itemcode = %s",[itemcode.lower()]
    )

    model = cur.fetchone()
    # parse lodcount field
    # input in the form of "["
    return parse_item(model)

def fetch_one_from_json(itemcode):
    with open("rogerlib/static/models/models.json","r") as f:
        data = json.load(f)

    result = data['models']
    for model in result:
        if model['itemcode'] == itemcode:
            return parse_item(model)
    
# Fetch all items from db, return a list
def fetch_all():
    cur = rogerlib.model.get_db()
    cur.execute(
        "SELECT itemcode, itemname, category, subcategory, material, colors, lodcount, description, creatornote, shader, version "
        "FROM models "
    )
    result = cur.fetchall()
    models = []
    models_json = {
        "models": []
    }
    for model in result:
        models.append(parse_item(model))
    
    return models

# Fetch all items from json
def fetch_all_json():
    data = fetch_json_s3("models/models.json")
    result = data['models']
    models = []
    for model in result:
        models.append(parse_item(model))
    
    return models

def fetch_categories_json():
    data = fetch_json_s3("models/models.json")
    models = data['models']
    categoryMap = {}
    subcategories_list = []
    categories_list = []
    for model in models:
        cat = model['category']
        subcat = model['subcategory']
        if cat.upper() not in categories_list:
            bisect.insort(categories_list, cat.upper())
            categoryMap[cat] = []
        if subcat.upper() not in subcategories_list:
            bisect.insort(subcategories_list, subcat.upper())
            categoryMap[cat].append(subcat)
    return categoryMap

# given a list of models, get all categories
def fetch_categories():
    # connect to db
    cur = rogerlib.model.get_db()
    cur.execute(
        "SELECT itemcode, itemname, category, subcategory, material, colors, lodcount, description, creatornote, shader, version "
        "FROM models "  
    )
    data = cur.fetchall()

    categories_list = []
    subcategories_list = []
    categoryMap = {}
    for model in data:
        cat = model["category"]
        subcat = model["subcategory"]
        if cat.upper() not in categories_list:
            bisect.insort(categories_list, cat.upper())
            categoryMap[cat] = []
        if subcat.upper() not in subcategories_list:
            bisect.insort(subcategories_list, subcat.upper())
            categoryMap[cat].append(subcat)
    return categoryMap

def fetch_object_s3(filename):
    try:
        s3_config = Config(region_name='us-east-2')
        s3_client = boto3.client('s3',
                                aws_access_key_id=rogerlib.app.config['AWS_ACCESS_KEY'],
                                aws_secret_access_key=rogerlib.app.config['AWS_SECRET_KEY'],
                                config=s3_config)
        bucket = rogerlib.app.config["FLASKS3_BUCKET_NAME"]
        key = str.format("static/{0}",filename)

        object = s3_client.get_object(Bucket=bucket, Key=key)
    except ClientError:
        raise
    return object

def fetch_markdown_s3(filename):
    try:
        object = fetch_object_s3(filename)
        result = object["Body"].read().decode("utf-8")
        title = result.splitlines()[0]
        category = result.splitlines()[1]
        classname = result.splitlines()[2]
        body = result.splitlines(keepends=True)[3:]
        content = "".join(body)

        data = {
            'title': title,
            'category': category,
            'classname': classname,
            'content': content,
        }
    except ClientError:
        raise
    return data

def fetch_json_s3(filename):
    try:
        object = fetch_object_s3(filename)
        content = object["Body"].read().decode("utf-8")
        result = json.loads(content)
        
    except ClientError:
        raise
    return result

def fetch_json_local(filename):
    with open("rogerlib/static/") as f:
        data = json.load(f)

def fetch_markdown_local(filename):
    with open(str.format("rogerlib/static/markdown/{0}",filename)) as f:
        title = f.readline().strip()
        category = f.readline().strip()
        classname = f.readline().strip()
        content = f.read()
    data = {
        'title': title,
        'category': category,
        'classname': classname,
        'content': content,
    }
    return data

def fetch_quote_s3():
    data = fetch_json_s3("quotes/rogerlib/quotes.json")
    quotes = data['quotes']
    random_int = secrets.randbelow(32)
    random.seed(random_int)

    # generate random order
    order = list(range(len(quotes) - 1))
    random.shuffle(order)
    context = {
        'order': order,
        'quotes': quotes
    }
    return context

def fetch_articles_s3():
    data = fetch_json_s3("markdown/weblog/articles.json")
    articlename = str.format("markdown/weblog/{0}", data['default'])
    defaultarticle = fetch_markdown_s3(articlename)
    content = defaultarticle['content']
    articles = data['articles']
    articlemap = {}
    for article in articles:
        filename = data['fileMap'][article]
        result = fetch_markdown_s3(str.format("markdown/weblog/{0}", filename))
        articlemap[article] = result
    result = {
        'articlemap': articlemap,
        'filemap': data['fileMap'],
        'titlemap': data['titleMap'],
        'articles': data['articles'],
        'content': content,
    }
    return result