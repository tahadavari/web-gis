    map = new OpenLayers.Map("map", {projection: new OpenLayers.Projection("EPSG:900913"),controls:[new OpenLayers.Control.Navigation()]} )
    osmLayer = new OpenLayers.Layer.OSM("OSM")
    road = new OpenLayers.Layer.Bing({
        key: "ApTJzdkyN1DdFKkRAE6QIDtzihNaf6IWJsT-nQ_2eMoO4PN__0Tzhl2-WgJtXFSp",
        type: "Road",
        metadataParams: { mapVersion: "v1" }
    });
    aerial = new OpenLayers.Layer.Bing({
        key: "ApTJzdkyN1DdFKkRAE6QIDtzihNaf6IWJsT-nQ_2eMoO4PN__0Tzhl2-WgJtXFSp",
        type: "Aerial"
    });
    hybrid = new OpenLayers.Layer.Bing({
        key: "ApTJzdkyN1DdFKkRAE6QIDtzihNaf6IWJsT-nQ_2eMoO4PN__0Tzhl2-WgJtXFSp",
        type: "AerialWithLabels",
        name: "Bing Aerial With Labels"
    });

    map.addLayers([osmLayer, road, aerial, hybrid]);

    $.ajax({
        type: "GET",
        dataType: "json",
        url: "/getwms",
        success: function(data){
            for(var i=0;i<data.length; i++) {
                rawIndexWMSLayers = []; //for using in whole of the app
                wms = new OpenLayers.Layer.WMS(data[i].fields.layer_alias,
                    data[i].fields.server_address,
                    {LAYERS:  data[i].fields.workspace+":"+ data[i].fields.layer_name, transparent: true},
                    {isBaseLayer: false});
                rawIndexWMSLayers.push([data[i].fields.workspace + ":" + data[i].fields.layer_name,data[i].fields.layer_alias])
                map.addLayer(wms)
            }

	    }
    });

    map.setCenter([0,0],1)
    controls = [
            new OpenLayers.Control.OverviewMap({ maximized: true }),
            new OpenLayers.Control.MousePosition({  prefix: "سیستم تصویر = EPSG:900913   " ,  element: document.getElementById("mousePosition")
}),
            new OpenLayers.Control.LayerSwitcher({div: document.getElementById('layers')})
    ]
    map.addControls(controls)




//popup for logut
$("#logoutBtn").click(function () {
   $("#logoutDiv").dialog({
      modal: true,
      buttons: {
        بله: function() {
            window.location.href = "/logout/";
        }
      }
    });
})




//login poupup
$("#loginBtn").click(function () {
    $("#loginDiv").dialog({
      modal: true,
      buttons: {
        ورود: function() {
          $("#loginForm").submit();
        },
          "ثبت نام": function() {
                window.location.href = "/signup/";
        }
      }
    });
})


identification = "off"
optionAdd = 1
$("#identifyBtn").click(function () {
    if("on"==identification){
        end_identify()
    }else{

        if(optionAdd==1) {
            var select_layer = $("#layerChooseToIdentify");
            for (var i = 0; i < rawIndexWMSLayers.length; i++) {
                select_layer.append('<option value="' + rawIndexWMSLayers[i][0] + '">' + rawIndexWMSLayers[i][1] + '</option>');
            }
            optionAdd = 0
        }


        popup_identify()
    }
})


function popup_identify(){
   $("#identifyOptionPopup").dialog({
      modal: true,
      buttons: {
          شروع: function() {
              $( this ).dialog( "close" );
              start_identify()
        }
      }
   });
}

function end_identify(){
        identification = "off"
        $("#identifyBtn").css("backgroundColor", "#103c67");
        map.events.unregister('click', map,doIdentify)
        $("#measurBtn").prop("disabled", false);
        $("#drawingBtn").prop("disabled", false);


}

function start_identify(){
        identification = "on"
        $("#identifyBtn").css("backgroundColor", "red");
        map.events.register('click', map,doIdentify)
        $("#measurBtn").prop("disabled", true);
        $("#drawingBtn").prop("disabled", true);


}



function doIdentify(e) {
    var layerSelectedToIdentify= $("#layerChooseToIdentify option:selected").val()
    $.ajax({
            url: '/identify/',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({
                "layer":layerSelectedToIdentify.split(":")[1],
                "workspace":layerSelectedToIdentify.split(":")[0],
                "width":map.getSize().w,
                "height":map.getSize().h,
                "x":e.xy.x,
                "y":e.xy.y,
                "bbox":Object.values(map.getExtent().transform(map.projection, new OpenLayers.Projection("EPSG:4326"))).join()
                }),
            dataType: 'text',
            success: function(result) {
                $("#popup-identify").html(result)
                $("#popup-identify").dialog({
                  modal: true
                  });
            }
        });
}




//add search btn evt handler
$("#searchBtn").click(function() {

	$.ajax({
            url: '/search/',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({
                "q" : $("#searchBox").val(),
                "layer":"iran_location",
                "workspace":"python"
                }),
            dataType: 'text',
            success: function(result) {
		        addMarker(result)
            }
        });

});



function addMarker(data){
    var layer = map.getLayersByName("نتایج جستجو")
    if(layer.length>0){
        map.removeLayer(layer[0])
    }

    var markers = new OpenLayers.Layer.Markers("نتایج جستجو" );
    map.addLayer(markers);

    var size = new OpenLayers.Size(31,35);
    var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
    var icon = new OpenLayers.Icon("static/marker.svg", size, offset);

    var geojsonFormat = new OpenLayers.Format.GeoJSON()
    var features =  geojsonFormat.read(data)

    for(var i=0; i<features.length; i++) {
        feature = features[i]
	    var coors = new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y)
				  .transform(new OpenLayers.Projection("EPSG:4326"), map.projection)
        var markeri = new OpenLayers.Marker(coors , icon.clone())
        markers.addMarker(markeri);
        markeri.events.register("click", map, function (e) {
            showPopupMarker(feature.attributes,coors)
        })
    }

    if(features.length>0){
        map.setOptions({zoom:6})
    }else{
        alert("پیدا نشد")
    }
}

function showPopupMarker(attributes,coors){
   var stringToPrintOnPopup = attributes.NAME+"<br>"+attributes.PLACE+"<br>"
   var popup = new OpenLayers.Popup.FramedCloud("Popup", coors, null, stringToPrintOnPopup, null, true);
   map.addPopup(popup)
}



//popup for input measurment
$("#measurBtn").click(function () {
     $("#measurDiv").dialog({
      modal: true,
      buttons: {
        شروع: function() {
            startMeasurment(this)
        }
      }
    });
})




function startMeasurment(a){
    $("#measurRes").fadeIn()
    $("#measurBtn").prop("disabled", true);
    $("#measurBtn").css("backgroundColor", "red");

    $("#identifyBtn").prop("disabled",true);


    if (!$("input[id='distanceCheckBox']").is(':checked')) {
        console.log("اندازه گیری طول شروع شد")
        DistControl.activate()
    }
    else {
        console.log("اندازه گیری مساحت شروع شد")
        AreaControl.activate()
    }
    $( a ).dialog( "close" );
    $("#drawingBtn").prop("disabled", true);
}


$("#DrawEndBtn").click(function () {
    $("#measurRes").fadeOut()
    $("#measurBtn").prop("disabled", false);
    $("#identifyBtn").prop("disabled",false);

    $("#measurBtn").css("backgroundColor", "#103c67");
    AreaControl.deactivate()
    DistControl.deactivate()

    $("#drawingBtn").prop("disabled", false);

})






//Measurment controls
DistControl = new OpenLayers.Control.Measure(OpenLayers.Handler.Path, {persist: true})
AreaControl = new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon, {persist: true})
DistControl.events.on({
        "measure": handleMeasurements,
        "measurepartial": handleMeasurements
    });
AreaControl.events.on({
        "measure": handleMeasurements,
        "measurepartial": handleMeasurements
    });

map.addControls([DistControl,AreaControl]);

function handleMeasurements(event) {
    var order = event.order;
    var measure = event.measure;
    var element = document.getElementById('measurResInner');
    var out = "";
    if (order == 1) {
        out +=  measure.toFixed(3) + "متر";
    } else {
        out += measure.toFixed(3)+ "متر مربع";
    }
    element.innerHTML = out;
}


//popup for drawingicons
$("#drawingBtn").click(function () {
    $("#PointDrawingBtn").fadeIn()
    $("#LineDrawingBtn").fadeIn()
    $("#PolygonDrawingBtn").fadeIn()
    $("#AcceptDrawingBtn").fadeIn()
    $("#CancelDrawingBtn").fadeIn()


    $("#drawingBtn").css("backgroundColor", "red");
    $("#measurBtn").prop("disabled", true);
    $("#identifyBtn").prop("disabled",true);


})






$("#AcceptDrawingBtn").click(function () {
    $("#PointDrawingBtn").fadeOut()
    $("#LineDrawingBtn").fadeOut()
    $("#PolygonDrawingBtn").fadeOut()
    $("#AcceptDrawingBtn").fadeOut()
    $("#CancelDrawingBtn").fadeOut()


    $("#PointDrawingBtn").css("backgroundColor", "#103c67");
    $("#LineDrawingBtn").css("backgroundColor", "#103c67");
    $("#PolygonDrawingBtn").css("backgroundColor", "#103c67");

    $("#drawingBtn").css("backgroundColor", "#103c67");
    $("#measurBtn").prop("disabled", false);
    $("#identifyBtn").prop("disabled",false);


    drawControlPoint.deactivate()
    drawControlLine.deactivate()
    drawControlPolygon.deactivate()

})







//add Drawing Layers
pointLayer = new OpenLayers.Layer.Vector("لایه ترسیمات - نقطه");
lineLayer = new OpenLayers.Layer.Vector("لایه ترسیمات - خط");
polygonLayer = new OpenLayers.Layer.Vector("لایه ترسیمات - پلیگون");

map.addLayers([pointLayer, lineLayer, polygonLayer])



//add Drawing Controls
drawControlPoint = new OpenLayers.Control.DrawFeature(pointLayer,OpenLayers.Handler.Point)
drawControlLine = new OpenLayers.Control.DrawFeature(lineLayer,OpenLayers.Handler.Path)
drawControlPolygon = new OpenLayers.Control.DrawFeature(polygonLayer, OpenLayers.Handler.Polygon)

map.addControls([drawControlPoint, drawControlLine, drawControlPolygon]);



$("#PointDrawingBtn").click(function () {
    drawControlPoint.activate()
    drawControlLine.deactivate()
    drawControlPolygon.deactivate()
})



$("#LineDrawingBtn").click(function () {
    drawControlPoint.deactivate()
    drawControlLine.activate()
    drawControlPolygon.deactivate()
})


$("#PolygonDrawingBtn").click(function () {
    drawControlPoint.deactivate()
    drawControlLine.deactivate()
    drawControlPolygon.activate()
})


//remove Drawings
$("#CancelDrawingBtn").click(function () {
    pointLayer.removeAllFeatures()
    polygonLayer.removeAllFeatures()
    lineLayer.removeAllFeatures()
});



$("#syncToDBBtn").click(function () {
    $("#syncToDBDiv").dialog({
                  modal: true,
                  buttons: {
                      همگامسازی: function() {
                          console.log("همه ی ترسیمات موجود در سه لایه گفته شده باید  با جی کوئری به سمت سرور ارسال شود ")
                          syncToDB(this)
                      },
                      "گرفتن خروجی شیپ فایل": function() {
                          console.log("گرفتن خروجی شیپ باید انجام شود")
                          export_shp("http://127.0.0.1:8000/exportshp/")

                      }
                  }
});
})



function export_shp(address) {

            var form = $('<form action="' + address + '" method="post">'  +
                '</form>');
            $('body').append(form);
            form.submit();
            $('body').remove(form);

        }

$.ajax(
{
    type: "GET",
    dataType: "json",
    url: "/getdrawings",
    success: function (data) {
        Drawing(data)
    }
})




function Drawing(data){
    var geojson_format = new OpenLayers.Format.GeoJSON({
      'internalProjection': new OpenLayers.Projection("EPSG:900913"),
      'externalProjection': new OpenLayers.Projection("EPSG:4326")
    });
    var features = data.features;
    for(var i = 0; i<=features.length-1; i++){
        var feature = features[i]
        if(feature.geometry.type=="Point"){
            pointLayer.addFeatures(geojson_format.read(feature))
        }else if(feature.geometry.type=="LineString"){
            lineLayer.addFeatures(geojson_format.read(feature))
        }else{
            polygonLayer.addFeatures(geojson_format.read(feature))
        }
    }
}




function syncToDB(popup){

    WKT = new OpenLayers.Format.WKT({
      'internalProjection': new OpenLayers.Projection("EPSG:900913"),
      'externalProjection': new OpenLayers.Projection("EPSG:4326")
    });

    pointWKT = []
    for(var i = 0; i<pointLayer.features.length; i++){
        pointWKT[i] = WKT.write(pointLayer.features[i]);
    }

    lineWKT = []
    for(var i = 0; i<lineLayer.features.length; i++){
        lineWKT[i] = WKT.write(lineLayer.features[i]);
    }

    polygoneWKT = []
    for(var i = 0; i<polygonLayer.features.length; i++){
        polygoneWKT[i] = WKT.write(polygonLayer.features[i]);
    }

    $.ajax({
        url: '/synctodb/',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({"pointWKT":pointWKT,"lineWKT":lineWKT,"polygoneWKT":polygoneWKT}),
        dataType: 'text',
        success: function(result) {
            $( popup ).dialog( "close" );
            var msg = "دیتابیس بروز شد"
            $('#successfullSyncToDB').html(msg);
            $('#successfullSyncToDB').dialog({
              modal: true
            });

        }
    });
}



$("#layer-switcher-activator").click(function () {
    $("#layer-switcher").animate({ 'width': 'show' });
    $("#layer-switcher-activator").animate({'margin-left': 250});
    $("#layer-switcher-deactivator").show()
})
$("#layer-switcher-deactivator").click(function () {
    $("#layer-switcher").animate({ 'width': 'hide' });
    $("#layer-switcher-activator").animate({'margin-left': 5});
    $("#layer-switcher-deactivator").hide()
})





































