const labelStyle = new ol.style.Style({
text: new ol.style.Text({
font: 'bold 11px "Open Sans", "Arial Unicode MS", "sans-serif"',
overflow: true,
fill: new ol.style.Fill({
color: 'white',
}),
stroke: new ol.style.Stroke({
color: '#000',
width: 3,
}),
}),
});

const countryStyle = new ol.style.Style({
fill: new ol.style.Fill({
color: 'rgba(255, 255, 255, 0.6)',
}),
stroke: new ol.style.Stroke({
color: '#000',
width: 1,
}),
});
const style = [countryStyle, labelStyle];


const selectStyle = new ol.style.Style({
fill: new ol.style.Fill({
color: '#eeeeee',
}),
stroke: new ol.style.Stroke({
color: 'rgba(255, 255, 255, 0.7)',
width: 2,
}),
});


let selected = null;

 // Створюємо векторний шар з GeoJSON
 const vectorLayer = new ol.layer.VectorImage({
     source: new ol.source.Vector({
     features: new ol.format.GeoJSON().readFeatures(graves_data, {
// dataProjection: 'EPSG:7828',
featureProjection: 'EPSG:3857'
}),
         // url: 'your-data.geojson', // URL до файлу GeoJSON
         format: new ol.format.GeoJSON()
     }),
     
       style: function (feature) {
const label = feature.get('column').split(' ').join('\n');

labelStyle.getText().setText(label);
labelStyle.getText().setRotation(5 * (Math.PI / 180))
const color = feature.get('COLOR') || '#eeeeee';
countryStyle.getFill().setColor(color);
return style;
},
declutter: true,
 });

 // Створюємо карту
 const map = new ol.Map({
     target: 'map',
     layers: [
         new ol.layer.Tile({
             source: new ol.source.OSM() // Базова карта
         }),
         vectorLayer // Векторний шар
     ],
     view: new ol.View({
         center: ol.proj.transform([33.847, 49.202], 'EPSG:4326', 'EPSG:3857'), // Центруємо карту на певних координатах
         zoom: 19 // Початковий масштаб
     })
 });
 
 map.getView().setRotation(5 * (Math.PI / 180))
 
 map.on('pointermove', function (e) {
if (selected !== null) {
selected.setStyle(undefined);
selected = null;
}

map.forEachFeatureAtPixel(e.pixel, function (f) {
selected = f;
selectStyle.getFill().setColor(f.get('COLOR') || '#eeeeee');
f.setStyle(selectStyle);
return true;
});

});