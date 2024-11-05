let rotate_angle = 5.1

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
color: '#eeeeee',
}),
stroke: new ol.style.Stroke({
color: 'rgba(255, 255, 255, 0.7)',
width: 2,
}),
});


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
    style: function (feature) {
        labelStyle_section.getText().setText('Сектор № ' + feature.get('section'))
        labelStyle_section.getText().setRotation(-rotate_angle * (Math.PI / 180))
        return labelStyle_section
    }
})

// Шар з підписами секцій 
const row_label_Layer = new ol.layer.VectorImage({
    source: new ol.source.Vector({
        url: 'https://bohdan2505.github.io/koz_graves/row_label.geojson',
         // url: 'your-data.geojson', // URL до файлу GeoJSON
        format: new ol.format.GeoJSON(),
        
    }),
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
    style: geometryStyle_section
})

// Шар з рядами
const rowsLayer = new ol.layer.VectorImage({
    source: new ol.source.Vector({
        url: 'https://bohdan2505.github.io/koz_graves/rows.geojson',
         // url: 'your-data.geojson', // URL до файлу GeoJSON
        format: new ol.format.GeoJSON(),
        
    }),
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
    
        if (zoom >= 20.5) {
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
 // Створюємо карту
const map = new ol.Map({
    interactions: ol.interaction.defaults.defaults({altShiftDragRotate:false, pinchRotate:false}),
    controls: ol.control.defaults.defaults({rotate: false}).extend([new MapLegendControl]),//layerSwitcher, FullScreen, new RotateNorthControl]),
    target: 'map',
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

// map.on('pointermove', function (e) {
// if (selected !== null) {
// selected.setStyle(undefined);
// selected = null;
// }

// map.forEachFeatureAtPixel(e.pixel, function (f) {
// selected = f;
// selectStyle.getFill().setColor(f.get('COLOR') || '#eeeeee');
// f.setStyle(selectStyle);
// return true;
// });

// });