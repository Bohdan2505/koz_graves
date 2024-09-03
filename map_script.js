let northEast = L.latLng(51, 40),
    southWest = L.latLng(46, 22);
let bounds = L.latLngBounds(northEast, southWest);


let map = L.map('map', { center: bounds.getCenter(), rotate: true,  rotateControl: {        closeOnZeroBearing: false,    }, touchRotate: false,    bearing: 4,renderer: L.canvas(), zoom: 19, minZoom: 19, maxZoom: 22, zoomControl: false, preferCanvas: true,  scrollWheelZoom: true });
map.attributionControl.addAttribution('<a href="https://kozelshchynska-gromada.gov.ua/">&copy; Козельщинська ТГ</a> | <a href="https://openstreetmap.org.ua" target="_blank" > &copy; OpenStreetMap Ukraine</a>');


var white_background = L.tileLayer('').addTo(map)




let info = L.control({ position: 'bottomleft' });
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this._div.innerHTML = `<h2 style="text-align:center; margin:5px">
Умовні позначення</h2>
<h3>
<i style="background:green"></i> Вільні місця<br>
<i style="background:yellow"></i> Заброньовано<br>
<i style="background:red"></i> Поховано невідомий (відсутні відомості про померлого)<br>
<i style="background:black"></i> Існуюче поховання<br>
</h3>  `
    return this._div;
};

map.createPane('grave_layer');
map.getPane('grave_layer').style.zIndex = 601;

map.createPane('labels');
map.getPane('labels').style.zIndex = 199


map.createPane('labels_xyz');
map.getPane('labels_xyz').style.zIndex = 603



// map.getPane('tilePane').style.zIndex = 602


var graves_num =  L.tileLayer('xyz_tiles/{z}/{x}/{y}.png', {minNativeZoom:20, maxNativeZoom:22, maxZoom:22,  minZoom: 21, id: "graves_num", layername: 'Номери місць поховань'}).addTo(map)


info.addTo(map);
L.control.zoom({
//     position: 'topleft'
}).addTo(map);

map.addControl(new L.Control.Fullscreen({ position: 'topleft' }));



function highlightFeature(e) {
    let layer = e.target;

    layer.setStyle({
        weight: e.target.options.weight,
        color: '#03f8fc',
        fillColor: '#03f8fc',
        dashArray: '',
        fillOpacity: 0.7
    });
    
    //layer.bringToFront();
}
function resetHighlightLayer(e) {

    e.target.setStyle(e.target.options.style(e.target.feature, e.target));
    
    // 
}


function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function blinking_grave(layer, duration) {
    const interval = 1000
    const iterations = duration / interval;

    let count = 0;

    layer.setStyle({
        weight: layer.options.weight,
        color: '#03f8fc',
        fillColor: '#03f8fc',
        dashArray: '',
        fillOpacity: 0.7
    });

    const blinkInterval = setInterval(() => {
        
        setTimeout(() => {grave_layer.resetStyle(layer)}, 500);
        layer.setStyle({
            weight: layer.options.weight,
            color: '#03f8fc',
            fillColor: '#03f8fc',
            dashArray: '',
            fillOpacity: 0.7
        });
        count++;

        // Зупинка миготіння після завершення циклу
        if (count >= iterations) {
            clearInterval(blinkInterval);
        }
        }, interval);
    
    grave_layer.resetStyle(layer)


}


function onEachFeatureRowPointLabel(feature, layer) {
    let props = feature.properties

    layer.bindTooltip(`<h2>${props['row']}</h2>`, {permanent: true, className: "hromada-label", direction: 'center', offset: [0, 0], opacity:1 })

}
function onEachFeatureSectionPointLabel(feature, layer) {
    let props = feature.properties

    layer.bindTooltip(`<h1>Сектор № ${props['section']}</h1>`, {permanent: true, className: "hromada-label", direction: 'center', offset: [0, 0], opacity:1 })

}




function onEachFeatureGrave(feature, layer) {
    let props = feature.properties
    
  
    layer.bindTooltip(`<h3 style="text-align:center; margin: 5px">
        
        <b>${props['full_name']}</b></h3> <hr>
        <h4>
        Місце:<b>${props['column']}</b> <br>
        Ряд:<b>${props['row']}</b> <br>
        Сектор:<b>${props['section']}</b> <br>
        </h4>`, {sticky:true} )
    
    let first_info_row_html = ``
    if (props['full_name'] == 'заброньовано' || props['full_name'] == 'вільне' || props['full_name'] == 'поховано невідомий') {
        first_info_row_html = `Статус: <b>${props['full_name']}</b> <hr>`
    }
    else {
        first_info_row_html = `
        П.І.Б.: <b>${props['full_name']}</b> <br>
        Дата народження:  <b>${props['birth_date']}</b><br>
        Дата смерті:  <b>${props['death_date']}</b><br>
        <hr>
        `
    }
    
    
   layer.bindPopup(`<p style="text-align:justify; margin: 5px">
    ${first_info_row_html}
    Місце:<b>${props['column']}</b> <br>
    Ряд:<b>${props['row']}</b> <br>
    Сектор:<b>${props['section']}</b> <br>
    </p>`)


    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlightLayer,
        click: function(e) {e.target.closeTooltip()}
    });

  

}
function get_grave_color(feature) {
    let props = feature.properties
    if (props['full_name'] == 'заброньовано')
        {
           return 'yellow'
        }
    else if  (props['full_name'] == 'вільне') {

        return 'green'
    }

    else if  (props['full_name'] == 'поховано невідомий') {

        return 'red'
    }

    else {

        return 'black'
    }

}

function style_grave(feature) {
    return {
        color: get_grave_color(feature),
        fillColor: get_grave_color(feature),
        weight: 1,
        fillOpacity: 0.4,
    };
}

function get_row_color(feature) {
    let props = feature.properties
    if (parseInt(props['row']) % 2 == 1)
        {
           return 'gray'
        }
    else if  (parseInt(props['row']) % 2 == 0) {

        return '#bababa'
    }

    else {

        return 'black'
    }

}

function style_row_polygon(feature) {

    return {
        color: get_row_color(feature),
        fillColor: get_row_color(feature),
        weight: 1,
        fillOpacity: 0.4,
    };
}

let section_polygon_layer = new L.geoJson(section_polygon, { renderer: L.canvas(),
    id: "section_polygon_layer", layername: 'Сектори', style: {color: 'black', fillColor: '#f4f7f7', weight: 3}
}).addTo(map)


let row_polygon_layer = new L.geoJson(rows_polygon_data, { renderer: L.canvas(),
    id: "row_polygon_layer", layername: 'Ряди', style: style_row_polygon
}).addTo(map)


let row_label_point_layer = new L.geoJson(row_label_point_data, { renderer: L.canvas(),
    id: "row_label_point_layer", layername: 'Підписи рядів', pointToLayer: function(feature,latlng){
        return L.marker(latlng,{icon: L.divIcon({className: ''})});
      }, onEachFeature: onEachFeatureRowPointLabel
}).addTo(map)

let section_label_points_layer = new L.geoJson(section_label_points, { renderer: L.canvas(),
    id: "section_label_points_layer", layername: 'Підписи секторів', pointToLayer: function(feature,latlng){
        return L.marker(latlng,{icon: L.divIcon({className: ''})});
      }, onEachFeature: onEachFeatureSectionPointLabel
}).addTo(map)


let grave_layer = new L.geoJson(graves_data, { renderer: L.canvas(),
    id: "grave_layer", layername: 'Місця поховань', style: style_grave, onEachFeature: onEachFeatureGrave
}).addTo(map)




function merge_table_and_geom(table_data, geojson) {

    let table_json_with_id = {}

    for (y in table_data) {
        table_json_with_id[table_data[y]['id']] = table_data[y]
    }

    for (x in geojson.features) {
        geojson.features[x].properties['birth_date'] = table_json_with_id[geojson.features[x].properties['id']]['birth_date']
        geojson.features[x].properties['full_name'] = table_json_with_id[geojson.features[x].properties['id']]['full_name']
        geojson.features[x].properties['death_date'] = table_json_with_id[geojson.features[x].properties['id']]['death_date']
    }

    return geojson
}




async function addGeoJson() {
    const response = await fetch('https://opensheet.elk.sh/1WMkVOB_9rycOitAEa3t3QNw3lXyafatHalUCu9vTd-A/1')
    .then(response => response.json())
    .catch(error => console.error('Помилка завантаження:', error));

    let merged_graves_data = merge_table_and_geom(response, graves_data)

    full_name_search.setChoices(create_choices_from_gejson(merged_graves_data))
    
    grave_layer.clearLayers()
    grave_layer.addData(merged_graves_data)
    grave_layer.resetStyle()

    

}

addGeoJson();








map.fitBounds(grave_layer.getBounds())
map.setZoom(19)

grave_layer.bringToFront()

map.on('zoomend', function () {
    
    if (map.getZoom() < 8 ) {
        //map.removeLayer(disctricts_label_layer);
        //map.removeLayer(hromada_label_layer);
    }

    if (map.getZoom() < 10 && map.hasLayer(grave_layer) && map.getZoom() >= 8) 
    {
        //map.addLayer(disctricts_label_layer);
    }
   // if (map.getZoom() < 10 && map.hasLayer(hromady_layer)) 
   //     {
          //  map.removeLayer(hromada_label_layer);
   //     }
    
   // if (map.getZoom() >= 10  && map.hasLayer(hromady_layer))
   // {
      //  map.removeLayer(disctricts_label_layer);
       // map.addLayer(hromada_label_layer);
   // }   
});



function create_choices_from_gejson(graves_data) {
let graves_choices = []
for (x in graves_data.features) {
let data_row = {}
let props = graves_data.features[x]['properties']
if (props['full_name'] == 'заброньовано' || props['full_name'] == 'вільне' || props['full_name'] == 'поховано невідомий')
{
   //    
}

else {
    data_row = {label:props['full_name'], value: props['id']}
    
}
graves_choices.push(data_row)
}
return graves_choices
}

let full_name_search = new Choices('#full_name_search_input', { allowSearch: true, position: 'bottom', noChoicesText: 'Значення для вибору відсутні' })


grave_layer.fireEvent('click', {latlng: { 'lat': 49.201542978235395, 'lng': 33.84766156710435 }})



function search_grave() {

    let full_name_search_value = full_name_search.getValue(true)
 

    for (x in grave_layer._layers) {
        var props = grave_layer._layers[x].feature['properties'];

         if (props['id'] == full_name_search_value) {
            console.log(grave_layer._layers[x])
            
            // console.log(streets_layer._layers[x]._latlngs[0][1])
            map.fitBounds(grave_layer._layers[x].getBounds()) // access the zoom
            console.log({latlng: grave_layer._layers[x].getBounds().getCenter()})
            latlng = grave_layer._layers[x].getBounds().getCenter()
            lat = latlng['lat']
            lng = latlng['lng']

            console.log(L.latLng([lat, lng]))
            //map.fireEvent('click', {latlng: [lat, lng]})
            grave_layer._layers[x].fireEvent('click', {latlng: L.latLng([lat, lng])})
            grave_layer._layers[x].closeTooltip()
            blinking_grave(grave_layer._layers[x], 10000)
            
            
         }

    }
}


function openNav() {
    let mySidepanel = document.getElementById("mySidepanel");

    mySidepanel.style.width = "35%";

    L.DomEvent.disableClickPropagation(mySidepanel);
    L.DomEvent.disableScrollPropagation(mySidepanel);


    return null
    
}

// full_name_search.setChoices(create_choices_from_gejson(graves_data))




function closeNav() {

    let mySidepanel = document.getElementById("mySidepanel");
    mySidepanel.style.width = "0";
    let main_html_tag = document.querySelector("main");
    button = document.createElement('button')
    button.setAttribute('id', 'side_panel_open_button')
    button.setAttribute('class', 'info legend')
    button.onclick = openNav
    button.innerHTML = '<h3 style="text-align:center">ПАНЕЛЬ ПОШУКУ</h3>'


    return null
    
}
function show_popup_table () {
    var popup_window = document.getElementById('popup_window')

    popup_window.innerHTML = `
    <div class="popup">
        <form action="javascript:get_upload_values()">
        <h2>Перелік земельних ділянок</h2>
        <a class="close" href="#" onclick='close_popup_window()'>&times;</a>
            <div class="content">
            <div id="popup_table"></div>
            

            </div>
        </form>
    </div>`

    popup_window.style.visibility = 'visible';
    popup_window.style.opacity = 1

}

let legend = L.control({ position: 'bottomright' });
legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', '');
    div.innerHTML = ''

    button = document.createElement('button')
    button.setAttribute('id', 'side_panel_open_button')
    button.setAttribute('class', 'info legend')
    button.onclick = openNav //openNav
    button.innerHTML = '<h3 style="text-align:center">ПАНЕЛЬ ПОШУКУ</h3>'
    div.appendChild(button)

    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);
    return div;
};


legend.addTo(map);
let baseTree = {
};
let overlaysTree = {
    label: 'Інформаційні шари',
    selectAllCheckbox: true,
    children: [
        { label: grave_layer.options.layername, layer: grave_layer } 
    ]
}




let layer_tree = L.control.layers.tree(baseTree, overlaysTree, {
    closedSymbol: '&#8862; &#x1f5c0;',
    openedSymbol: '&#8863; &#x1f5c1;',
})
