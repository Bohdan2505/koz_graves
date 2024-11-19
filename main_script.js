let rotate_angle = 5.1


// ####https://stackoverflow.com/questions/31297721/how-to-get-a-layer-from-a-feature-in-openlayers-3####
ol.Feature.prototype.getLayer = function(map) {
    var this_ = this, layer_, layersToLookFor = [];
    /**
     * Populates array layersToLookFor with only
     * layers that have features
     */
    var check = function(layer){
        var source = layer.getSource();
        if(source instanceof ol.source.Vector){
            var features = source.getFeatures();
            if(features.length > 0){
                layersToLookFor.push({
                    layer: layer,
                    features: features
                });
            }
        }
    };
    //loop through map layers
    map.getLayers().forEach(function(layer){
        if (layer instanceof ol.layer.Group) {
            layer.getLayers().forEach(check);
        } else {
            check(layer);
        }
    });
    layersToLookFor.forEach(function(obj){
        var found = obj.features.some(function(feature){
            return this_ === feature;
        });
        if(found){
            //this is the layer we want
            layer_ = obj.layer;
        }
    });
    return layer_;
};

class MapLegendControl extends ol.control.Control {
    /**
     * @param {Object} [opt_options] Control options.
     */
    constructor(opt_options) {
        const options = opt_options || {};

        const element = document.createElement('div');
        element.className = 'map-legend ol-unselectable ol-control';
        element.innerHTML = `<h2 style="text-align:center; margin:5px; font-size: 20px">
        Умовні позначення</h2>
        <h3 style="margin:5px; font-size: 16px">
        <i style="background:green"></i> Вільні місця<br>
        <i style="background:yellow"></i> Заброньовано<br>
        <i style="background:red"></i> Відсутні відомості про померлого<br>
        <i style="background:black"></i> Існуюче поховання<br>
        </h3>  `;

        super({
            element: element,
            target: options.target,
        });

    }

}

class InfoPanelControl extends ol.control.Control {
    /**
     * @param {Object} [opt_options] Control options.
     */
    constructor(opt_options) {
        const options = opt_options || {};

        // const element = document.createElement('div');
        // element.className = 'right_bottom ol-unselectable ol-control';
        const button = document.createElement('button')
        button.id = 'side_panel_open_button'
        button.className ='button_slider ol-control'
        button.onclick = openNav //openNav
        button.innerHTML = '<h3 style="text-align:center">ПАНЕЛЬ ПОШУКУ</h3>'

        super({
            element: button,
            target: options.target,
        });

    }

}



function create_choices_from_source(source) {
    let graves_choices = []
    for (x in source.getFeatures()) {
    let data_row = {}
    let props = source.getFeatures()[x].getProperties()
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





function searchFeatureByAttribute(attribute, value, source) {
    const features = source.getFeatures(); // Отримуємо всі об'єкти
    for (let feature of features) {
        if (feature.get(attribute) === value) { // Перевіряємо значення атрибуту
            
            return feature; // Повертаємо знайдений об'єкт
        }
    }
    alert("Feature not found");
    return null;
}
    
let full_name_search = new Choices('#full_name_search_input', { allowSearch: true, position: 'bottom', noChoicesText: 'Значення для вибору відсутні' })


function search_grave() {
    let search_value = full_name_search.getValue(true)
    const feature = searchFeatureByAttribute('id', search_value, gravesLayer.getSource())
    const geometry = feature.getGeometry();
    const extent = geometry.getExtent();
    
    // Центруємо карту на об'єкті
    map.getView().fit(extent, { duration: 500, maxZoom: 22 });
    setTimeout(function() { click_on_map( map.getPixelFromCoordinate(ol.extent.getCenter(extent)))}, 600)

}

function openNav() {
    let info_panel_div = document.getElementById("info_panel_div");

    info_panel_div.style.width = "35%";
    full_name_search.clearChoices()
    full_name_search.setChoices(create_choices_from_source(gravesLayer.getSource()))
    return null
    
}

function closeNav() {

    let info_panel_div = document.getElementById("info_panel_div");
    info_panel_div.style.width = "0";
    let main_html_tag = document.querySelector("main");
    button = document.createElement('button')
    button.setAttribute('id', 'side_panel_open_button')
    button.setAttribute('class', 'info legend')
    button.onclick = openNav
    button.innerHTML = '<h3 style="text-align:center">ПАНЕЛЬ ПОШУКУ</h3>'


    return null
    
}






const labelStyle_graves = new ol.style.Style({
    text: new ol.style.Text({
        font: 'bold 17px "Arial Unicode MS"',
        overflow: true,
        fill: new ol.style.Fill({
            color: '#000',
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3,
        }),
    }),
});

const labelStyle_section = new ol.style.Style({
    text: new ol.style.Text({
        font: 'bold 26px "Arial Unicode MS"',
        overflow: true,
        fill: new ol.style.Fill({
            color: '#000',
        }),
        // stroke: new ol.style.Stroke({
        //     color: '#fff',
        //     width: 3,
        // }),
    }),
});

const labelStyle_row = new ol.style.Style({
    text: new ol.style.Text({
        font: 'bold 20px "Arial Unicode MS"',
        overflow: true,
        fill: new ol.style.Fill({
            color: '#000',
        }),
        // stroke: new ol.style.Stroke({
        //     color: '#fff',
        //     width: 3,
        // }),
    }),
});

const geometryStyle_graves = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.6)',
    }),
    stroke: new ol.style.Stroke({
        color: '#000',
        width: 1,
    }),
});

const geometryStyle_section = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.6)',
    }),
    stroke: new ol.style.Stroke({
        color: '#000',
        width: 3,
    }),
});

const geometryStyle_rows = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.6)',
    }),
    stroke: new ol.style.Stroke({
        color: '#000',
        width: 2,
    }),
});

const style = [geometryStyle_graves, labelStyle_graves];


const selectStyle = new ol.style.Style({

    fill: new ol.style.Fill({
        color: 'red' // Червоний і синій кольори чергуються
    }),
    stroke: new ol.style.Stroke({
        color: '#000',
        width: 1
    })

})



let selected = null;


function merge_table_and_geom(table_data, geojson) {

    let table_json_with_id = {}
    // console.log(table_data)
    // console.log(geojson)

    for (y in table_data) {
        // console.log(y)
        table_json_with_id[table_data[y]['id']] = table_data[y]
    }

    for (x in geojson.features) {
        geojson.features[x].properties['birth_date'] = table_json_with_id[geojson.features[x].properties['id']]['birth_date']
        geojson.features[x].properties['full_name'] = table_json_with_id[geojson.features[x].properties['id']]['full_name']
        geojson.features[x].properties['death_date'] = table_json_with_id[geojson.features[x].properties['id']]['death_date']
    }

    return geojson
}


function sync_data() {

    let response_from_google_table = {};

    let response_geojson = {};

function fetchDataSequentially(url1, url2) {
const xhr1 = new XMLHttpRequest();
xhr1.open("GET", url1, true);
xhr1.onreadystatechange = function () {
    if (xhr1.readyState === 4 && xhr1.status === 200) {
        // Зберігаємо результат першого запиту
        response_from_google_table = JSON.parse(xhr1.responseText);

        // Після завершення першого запиту виконуємо другий запит
        const xhr2 = new XMLHttpRequest();
        xhr2.open("GET", url2, true);
        xhr2.onreadystatechange = function () {
            if (xhr2.readyState === 4 && xhr2.status === 200) {
                // Зберігаємо результат другого запиту
                response_geojson = JSON.parse(xhr2.responseText);

                // Об'єднані дані готові для використання

                const result_geojson = merge_table_and_geom(response_from_google_table, response_geojson);

                const features = gravesSource.getFormat().readFeatures(result_geojson, {featureProjection: 'EPSG:3857'});

            gravesSource.clear()
            gravesSource.addFeatures(features);
        
            }
        };
        xhr2.send();
    }
};
xhr1.send();

}

// Викликаємо функцію з URL-ами для послідовного отримання даних
fetchDataSequentially("https://opensheet.elk.sh/1WMkVOB_9rycOitAEa3t3QNw3lXyafatHalUCu9vTd-A/1", "https://bohdan2505.github.io/koz_graves/graves.geojson");

}

// Шар з підписами секцій 
const section_label_Layer = new ol.layer.VectorImage({
    source: new ol.source.Vector({
        url: 'https://bohdan2505.github.io/koz_graves/section_label.geojson',
         // url: 'your-data.geojson', // URL до файлу GeoJSON
        format: new ol.format.GeoJSON(),
        
    }),
    title: 'Підписи секторів',
    style: function (feature) {
        labelStyle_section.getText().setText('Сектор № ' + feature.get('section'))
        labelStyle_section.getText().setRotation(-rotate_angle * (Math.PI / 180))
        return labelStyle_section
    }
})

// Шар з підписами рядів 
const row_label_Layer = new ol.layer.VectorImage({
    source: new ol.source.Vector({
        url: 'https://bohdan2505.github.io/koz_graves/row_label.geojson',
         // url: 'your-data.geojson', // URL до файлу GeoJSON
        format: new ol.format.GeoJSON(),
        
    }),
    title: 'Підписи рядів',
    style: function (feature) {
        labelStyle_row.getText().setText(feature.get('row'))
        labelStyle_row.getText().setRotation(-rotate_angle * (Math.PI / 180))
        return labelStyle_row
    }
})



// Шар з секціями
const sectionLayer = new ol.layer.VectorImage({
    source: new ol.source.Vector({
        url: 'https://bohdan2505.github.io/koz_graves/section.geojson',
         // url: 'your-data.geojson', // URL до файлу GeoJSON
        format: new ol.format.GeoJSON(),
        
    }),
    title: 'Сектори',
    style: geometryStyle_section
})

// Шар з рядами
const rowsLayer = new ol.layer.VectorImage({
    source: new ol.source.Vector({
        url: 'https://bohdan2505.github.io/koz_graves/rows.geojson',
         // url: 'your-data.geojson', // URL до файлу GeoJSON
        format: new ol.format.GeoJSON(),
        
    }),
    title: 'Ряди',
    style: function (feature, resolution) {
        if (parseInt(feature.get('row') ) % 2 == 1) {  
            geometryStyle_rows.getFill().setColor('rgba(175, 174, 174, 0.1)') //'gray')
        }
        else if  (parseInt(feature.get('row') ) % 2 == 0) {
            geometryStyle_rows.getFill().setColor('rgba(41, 35, 35, 0.2)') //'#bababa')
        }
        else {
            geometryStyle_rows.getFill().setColor('black')
        }

        return geometryStyle_rows
    }
})

// Джерело даних для шару з місцями поховань
const gravesSource = new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    //https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html
    loader:     sync_data()
    
})
 // Шар з місцями поховань
const gravesLayer = new ol.layer.VectorImage({
    source: gravesSource,
    title: 'Місця поховань',
    style: function (feature, resolution) {
        var zoom = map.getView().getZoomForResolution(resolution);
        let color = '#fff'

        if (feature.get('full_name') == 'заброньовано')
        {
            color = 'rgba(233, 238, 24, 0.57)'//'yellow'
        }
        else if  (feature.get('full_name') == 'вільне') {
            color = 'rgba(13, 228, 40, 0.57)' //'green'
        }
        else if  (feature.get('full_name') == 'поховано невідомий') {
            color = 'rgba(240, 22, 22, 0.57)' //'red'
        }
        else {
            color = 'rgba(15, 11, 11, 0.57)' //'black'
        }

    geometryStyle_graves.getFill().setColor(color);
    
        if (zoom >= 20) {
            const label = feature.get('column').split(' ').join('\n');
            labelStyle_graves.getText().setText(label);
            labelStyle_graves.getText().setRotation(-rotate_angle * (Math.PI / 180))
        
        }
        else {
            labelStyle_graves.getText().setText('');

        }
        return style;
    
},
// declutter: true,
});
// let controls = ol.control.defaults.defaults({rotate: false}); 
// let interactions = ol.interaction.defaults.defaults({altShiftDragRotate:false, pinchRotate:false});

/**
 * Elements that make up the popup.
 */
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

/**
 * Create an overlay to anchor the popup to the map.
 */
const overlay = new ol.Overlay({
    element: container,
    autoPan: {
      animation: {
        duration: 250,
      },
    },
  });

 // Створюємо карту
const map = new ol.Map({
    interactions: ol.interaction.defaults.defaults({altShiftDragRotate:false, pinchRotate:false}),
    controls: ol.control.defaults.defaults({rotate: false}).extend([new MapLegendControl, new InfoPanelControl]),//layerSwitcher, FullScreen, new RotateNorthControl]),
    target: 'map',
    overlays: [overlay],
    layers: [
        // new ol.layer.Tile({
        //      source: new ol.source.OSM() // Базова карта
        // }),
        sectionLayer,
        rowsLayer,
        gravesLayer,
        section_label_Layer,
        row_label_Layer
    ],
    view: new ol.View({
         center: ol.proj.transform([33.8476, 49.2018], 'EPSG:4326', 'EPSG:3857'), // Центруємо карту на певних координатах
         zoom: 19 // Початковий масштаб
    })
});

map.getView().setRotation(rotate_angle * (Math.PI / 180))

const info = document.getElementById('info');

let currentFeature;

const displayGraveInfo = function (coordinate, feature, layer_title) {
    console.log(coordinate, feature, layer_title)
    if (feature) {
    
    const props = feature.getProperties();
    if (feature !== currentFeature) {
        // info.style.visibility = 'visible';
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
        if (layer_title == 'Місця поховань') {
        content.innerHTML = `<p style="text-align:justify; margin: 5px">
            ${first_info_row_html}
            Місце:<b>${props['column']}</b> <br>
            Ряд:<b>${props['row']}</b> <br>
            Сектор:<b>${props['section']}</b> <br>
            </p>`
        overlay.setPosition(coordinate);
        }
    }
    
    }
}


// tooltip
const displayFeatureInfo = function (pixel, target) {
    let layer_title = undefined
    const feature = target.closest('.ol-control')
        ? undefined
        : map.forEachFeatureAtPixel(pixel, function (feature, layer) {
            layer_title = layer.get('title');
            return feature;
    });
    if (feature) {
        info.style.left = pixel[0] + 'px';
        info.style.top = pixel[1] + 'px';
        const props = feature.getProperties();
        if (feature !== currentFeature) {
            info.style.visibility = 'visible';
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
            if (layer_title == 'Місця поховань') {
            info.innerHTML = `<p style="text-align:justify; margin: 5px">
                ${first_info_row_html}
                Місце:<b>${props['column']}</b> <br>
                Ряд:<b>${props['row']}</b> <br>
                Сектор:<b>${props['section']}</b> <br>
                </p>`
            }
    }
    } else {
        info.style.visibility = 'hidden';
    }
    currentFeature = feature;
};





/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function () {
    if (selected !== null) {
        selected.setStyle(undefined);
        selected = null;
        }
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

// map.on('pointermove', function (evt) {
//     if (evt.dragging) {
//         info.style.visibility = 'hidden';
//         info.innerHTML = ``
//         currentFeature = undefined;
//         return;
//     }
//     const pixel = map.getEventPixel(evt.originalEvent);
//     displayFeatureInfo(pixel, evt.originalEvent.target);
// });


// map.getTargetElement().addEventListener('pointerleave', function () {
//     currentFeature = undefined;
//     info.style.visibility = 'hidden';
//     info.innerHTML = ``;
// });

function click_on_map(pixel) {
if (selected !== null) {
    selected.setStyle(undefined);
    selected = null;
    }

    all_features_list = map.getFeaturesAtPixel(pixel)
    
    if (all_features_list) {
        console.log(all_features_list)
        for (index in all_features_list) {
            feature = all_features_list[index]
            let layer_title = feature.getLayer(map).get('title')
            console.log(layer_title)
            if (layer_title == 'Місця поховань') {
                displayGraveInfo(map.getCoordinateFromPixel(pixel), feature, layer_title)
                selected = feature;
                selectStyle.getFill().setColor( 'blue');
                selected.setStyle(selectStyle);
            }
            else {//pass}
        }
        }
    }
}

map.on('click', function (e) {
    click_on_map(e.pixel)
});