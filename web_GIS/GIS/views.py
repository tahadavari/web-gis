import json
# import os
# import shutil
# import uuid
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import logout, authenticate, login
from django.contrib.auth.models import User
from django.core import serializers
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
# from django.contrib.gis.geos import GEOSGeometry
# from osgeo import ogr, osr

from GIS.models import Layer, Drawing
import requests


def landing(request):
    return render(request, 'index.html')


def login_user(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            return HttpResponse('Home')
        else:
            return render(request, 'authentication/login.html')
    elif request.method == 'POST':
        user_info = request.POST
        user = authenticate(request, username=user_info['username'], password=user_info['password'])
        if user:
            login(request, user)
            return HttpResponse("login done")
        else:
            return render(request, 'authentication/login.html')


def register_user(request):
    if request.method == 'POST':
        user_info = request.POST
        User.objects.create_user(username=user_info['phone'], email=user_info['email'],
                                 password=user_info['password'], first_name=user_info['first_name'],
                                 last_name=user_info['last_name'])
        return render(request, 'authentication/login.html')
    elif request.method == 'GET':
        if request.user.is_authenticated:
            return HttpResponse('Home')
        else:
            return render(request, 'authentication/register.html')


def logout_user(request):
    logout(request)
    return render(request, 'authentication/login.html')


@csrf_exempt
def getwms(request):
    if request.user.is_authenticated:
        user_layers = Layer.objects.filter(user_owner=request.user)
        response = serializers.serialize('json', user_layers)
    else:
        response = ''
    return HttpResponse(response)


@csrf_exempt
def identify(request):
    if request.user.is_authenticated:
        data = json.load(request)
        SERVER = "http://127.0.0.1:8080/geoserver"
        SERVICE = "wms"
        VERSION = "1.1.1"
        REQUEST = "GetFeatureInfo"
        FORMAT = "image/png"
        TRANSPARENT = "true"
        workspace = data['workspace']
        layer_name = data['layer']
        QUERY_LAYERS = LAYERS = workspace + ":" + layer_name
        INFO_FORMAT = "text/html"
        FEATURE_COUNT = "10"
        X = str(data['x'])
        Y = str(data['y'])
        SRS = 'EPSG:4326'
        WIDTH = str(data['width'])
        HEIGHT = str(data['height'])
        BBOX = data['bbox'][0:-1]

        url_request = SERVER + "/" + workspace + "/" + SERVICE + "?" + "SERVICE=" + SERVICE + "&VERSION=" + VERSION + \
                      "&REQUEST=" + REQUEST + "&FORMAT=" + FORMAT + "&TRANSPARENT=" + TRANSPARENT + "&QUERY_LAYERS=" + \
                      QUERY_LAYERS + "&LAYERS=" + LAYERS + "&INFO_FORMAT=" + INFO_FORMAT + "&FEATURE_COUNT=" + \
                      FEATURE_COUNT + "&X=" + X + "&Y=" + Y + "&SRS=" + SRS + "&WIDTH=" + WIDTH + "&HEIGHT=" + HEIGHT + \
                      "&BBOX=" + BBOX

        resJSON = requests.get(url_request)

        return HttpResponse(resJSON, content_type="text/html")
    else:
        return HttpResponse("Access Denied. Error403", content_type="text/html")


@csrf_exempt
def search(request):
    if request.user.is_authenticated:
        data = json.load(request)

        SERVER = "http://127.0.0.1:8080/geoserver"
        SERVICE = "wfs"
        VERSION = "2.0.0"
        REQUEST = "getfeature"
        OUTPUTFORMAT = 'application/json'
        query = data['q']
        layer = data['layer']
        workspace = data['workspace']
        typeName = workspace + ":" + layer
        CQL_FILTER = "NAME='" + query + "'"

        url_request = SERVER + "/" + SERVICE + "?" + "SERVICE=" + SERVICE + "&VERSION=" + VERSION + \
                      "&REQUEST=" + REQUEST + "&OUTPUTFORMAT=" + OUTPUTFORMAT + "&typeName=" + typeName + \
                      "&CQL_FILTER=" + CQL_FILTER

        UserOwnersOfLayer = Layer.objects.filter(layer_name=layer).values_list("user_owner", flat=True)
        if request.user.id in UserOwnersOfLayer:
            resJSON = requests.get(url_request)
        else:
            resJSON = "Access Denied. Error403!"

        return HttpResponse(resJSON, content_type='text/html')
    else:
        return HttpResponse("Access Denied. Error403", content_type='text/html')


def getDrawings(request):
    if request.user.is_authenticated:
        drawingobjs = Drawing.objects.filter(userOwner=request.user)

        drawingobjsJSON = serializers.serialize('geojson', drawingobjs)
        return HttpResponse(drawingobjsJSON, content_type='text/html')
    else:
        return HttpResponse("Access Denied. Error403", content_type='text/html')
#
#
# def syncToDatabase(request):
#     if request.user.is_authenticated:
#         data = json.load(request)
#         user = User.objects.get(id=request.user.id)
#         Drawing.objects.filter(userOwner=user).delete()
#
#         pointWKT = data['pointWKT']
#         if len(pointWKT) > 0:
#             for p in pointWKT:
#                 geom = GEOSGeometry(p, srid=4326)
#                 geomobj = Drawing(geom=geom)
#                 geomobj.save()
#                 geomobj.userOwner.add(user)
#
#         lineWKT = data['lineWKT']
#         if len(lineWKT) > 0:
#             for p in lineWKT:
#                 geom = GEOSGeometry(p, srid=4326)
#                 geomobj = Drawing(geom=geom)
#                 geomobj.save()
#                 geomobj.userOwner.add(user)
#
#         polygoneWKT = data['polygoneWKT']
#         if len(polygoneWKT) > 0:
#             for p in polygoneWKT:
#                 geom = GEOSGeometry(p, srid=4326)
#                 geomobj = Drawing(geom=geom)
#                 geomobj.save()
#                 geomobj.userOwner.add(user)
#
#         return HttpResponse("200OK", content_type='text/html')
#     else:
#         return HttpResponse("Access Denied. Eror403", content_type='text/html')
#
#
# def exportSHP(request):
#     if request.user.is_authenticated:
#         user = User.objects.get(id=request.user.id)
#         drawingForUser = Drawing.objects.filter(userOwner=user)
#
#         directory_for_files = str(uuid.uuid4())
#         os.mkdir(directory_for_files)
#
#         # create shapefiles from geo
#         driverName = "ESRI Shapefile".encode('utf-8')
#         driver = ogr.GetDriverByName(driverName)
#         data_source1 = driver.CreateDataSource(directory_for_files + "/point.shp".encode('utf-8'))
#         data_source2 = driver.CreateDataSource(directory_for_files + "/linestring.shp".encode('utf-8'))
#         data_source3 = driver.CreateDataSource(directory_for_files + "/polygon.shp".encode('utf-8'))
#
#         srs = osr.SpatialReference()
#         srs.ImportFromEPSG(4326)
#
#         layer1 = data_source1.CreateLayer("volcanoes".encode('utf-8'), srs, ogr.wkbPoint)
#         layer2 = data_source2.CreateLayer("volcanoes".encode('utf-8'), srs, ogr.wkbLineString)
#         layer3 = data_source3.CreateLayer("volcanoes".encode('utf-8'), srs, ogr.wkbPolygon)
#
#         geoms = drawingForUser.values_list("geom", flat=True)
#         for geom in geoms:
#             feature = ogr.Feature(layer1.GetLayerDefn())
#
#             if geom.geom_type == "Point":
#                 point = ogr.CreateGeometryFromWkt(geom.wkt)
#                 feature.SetGeometry(point)
#                 layer1.CreateFeature(feature)
#             elif geom.geom_type == "LineString":
#                 linestring = ogr.CreateGeometryFromWkt(geom.wkt)
#                 feature.SetGeometry(linestring)
#                 layer2.CreateFeature(feature)
#             else:
#                 polygon = ogr.CreateGeometryFromWkt(geom.wkt)
#                 feature.SetGeometry(polygon)
#                 layer3.CreateFeature(feature)
#         data_source1 = data_source2 = feature = point = polygon = linestring = data_source3 = layer1 = layer2 = layer3 = None
#
#         # create zip from directory with same name
#         shutil.make_archive(directory_for_files, "zip", directory_for_files)
#
#         # remove directory
#         shutil.rmtree(directory_for_files)
#
#         # save zip to memory, then remove
#         zip_data = open(directory_for_files + '.zip', 'rb').read()
#         os.remove(directory_for_files + '.zip')
#
#         response = HttpResponse(zip_data, content_type='application/x-zip-compressed')
#         response['Content-Disposition'] = 'attachment; filename=%s' % 'testapi.zip'
#         return response
#
#     else:
#         return HttpResponse("Access Denied. Eror403", content_type='text/html')
