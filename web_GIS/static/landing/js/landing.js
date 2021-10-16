map = new OpenLayers.Map("Map", {
    projection: new OpenLayers.Projection("EPSG:900913"),
    controls: [new OpenLayers.Control.Navigation()]
})
osmLayer = new OpenLayers.Layer.OSM("OSM")
road = new OpenLayers.Layer.Bing({
    key: "ApTJzdkyN1DdFKkRAE6QIDtzihNaf6IWJsT-nQ_2eMoO4PN__0Tzhl2-WgJtXFSp",
    type: "Road",
    metadataParams: {mapVersion: "v1"}
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

map.setCenter([0, 0], 1)

controls = [
    new OpenLayers.Control.OverviewMap({maximized: true}),
    new OpenLayers.Control.MousePosition({prefix: "سیستم تصویر = EPSG:900913   "}),
    new OpenLayers.Control.LayerSwitcher()
]
map.addControls(controls)