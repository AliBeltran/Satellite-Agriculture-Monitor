/* ============================================================
   SATELLITE AGRICULTURE MONITOR
   Functional Geospatial Application
   ============================================================ */


/* ============================================================
   APPLICATION STATE
   ============================================================ */

const appState = {

    map: null,

    satelliteLayer: null,

    streetLayer: null,

    fieldLayer: null,

    selectedField: null,

    uploadedGeoJSON: null,

    fieldAreaAcres: null,

    scanRunning: false,

    activeLayer: "satellite",

    observationIndex: 4

};


/* ============================================================
   SAMPLE FIELD DATA
   ============================================================ */

const sampleFields = {

    "North Pivot": {
        health: 87,
        ndvi: 0.72,
        uniformity: 92,
        stress: "LOW"
    },

    "South Pasture": {
        health: 64,
        ndvi: 0.51,
        uniformity: 74,
        stress: "MODERATE"
    },

    "West Hay Field": {
        health: 91,
        ndvi: 0.81,
        uniformity: 95,
        stress: "LOW"
    }

};


/* ============================================================
   DOM REFERENCES
   ============================================================ */

const introScreen =
    document.getElementById("introScreen");

const mainInterface =
    document.getElementById("mainInterface");

const loadingBar =
    document.getElementById("loadingBar");

const loadingText =
    document.getElementById("loadingText");

const fieldSelect =
    document.getElementById("fieldSelect");

const fieldName =
    document.getElementById("fieldName");

const fieldMeta =
    document.getElementById("fieldMeta");

const healthValue =
    document.getElementById("healthValue");

const ndviValue =
    document.getElementById("ndviValue");

const uniformityValue =
    document.getElementById("uniformityValue");

const stressValue =
    document.getElementById("stressValue");

const geojsonInput =
    document.getElementById("geojsonInput");

const mapUpload =
    document.getElementById("mapUpload");

const scanButton =
    document.getElementById("scanButton");

const timelineSlider =
    document.getElementById("timelineSlider");

const timelineDate =
    document.getElementById("timelineDate");


/* ============================================================
   INTRO ANIMATION
   ============================================================ */

function startIntro() {

    let progress = 0;

    const messages = [

        "ESTABLISHING GEOSPATIAL LINK",

        "CONNECTING TO IMAGERY SERVICE",

        "LOADING FIELD ENGINE",

        "INITIALIZING ANALYSIS SYSTEM",

        "SYSTEM READY"

    ];

    const timer =
        setInterval(() => {

            progress +=
                Math.random() * 12 + 8;

            if (progress >= 100) {

                progress = 100;

                clearInterval(timer);

                loadingText.textContent =
                    "SYSTEM READY";

                setTimeout(() => {

                    introScreen.classList.add(
                        "hidden"
                    );

                    mainInterface.classList.add(
                        "visible"
                    );

                    setTimeout(() => {

                        if (appState.map) {

                            appState.map.invalidateSize();

                        }

                    }, 500);

                }, 700);

            }

            loadingBar.style.width =
                `${progress}%`;

            const index =
                Math.min(
                    Math.floor(progress / 20),
                    messages.length - 1
                );

            loadingText.textContent =
                messages[index];

        }, 300);

}


/* ============================================================
   INITIALIZE MAP
   ============================================================ */

function initializeMap() {

    if (typeof L === "undefined") {

        console.error(
            "Leaflet is not loaded."
        );

        return;

    }


    appState.map =
        L.map(
            "fieldMap",
            {

                zoomControl: true,

                attributionControl: true

            }
        ).setView(
            [41.1402, -104.8202],
            11
        );


    /* --------------------------------------------------------
       SATELLITE IMAGERY
       -------------------------------------------------------- */

    appState.satelliteLayer =
        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {

                maxZoom: 19,

                attribution:
                    "Imagery © Esri"

            }
        );


    /* --------------------------------------------------------
       STREET / REFERENCE MAP
       -------------------------------------------------------- */

    appState.streetLayer =
        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {

                maxZoom: 19,

                attribution:
                    "© OpenStreetMap contributors"

            }
        );


    /* Start with satellite */

    appState.satelliteLayer.addTo(
        appState.map
    );


    /* --------------------------------------------------------
       MAP CLICK
       -------------------------------------------------------- */

    appState.map.on(
        "click",
        function(event) {

            console.log(
                "Map coordinate:",
                event.latlng.lat,
                event.latlng.lng
            );

        }
    );

}


/* ============================================================
   GEOJSON FILE READER
   ============================================================ */

function readGeoJSONFile(file) {

    if (!file) {
        return;
    }


    const fileName =
        file.name.toLowerCase();


    if (
        !fileName.endsWith(".geojson") &&
        !fileName.endsWith(".json")
    ) {

        showMessage(
            "Please select a GeoJSON file."
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function(event) {

            try {

                const geojson =
                    JSON.parse(
                        event.target.result
                    );


                processGeoJSON(
                    geojson,
                    file.name
                );

            }

            catch(error) {

                console.error(error);

                showMessage(
                    "The selected file is not valid GeoJSON."
                );

            }

        };


    reader.onerror =
        function() {

            showMessage(
                "The file could not be read."
            );

        };


    reader.readAsText(file);

}


/* ============================================================
   PROCESS GEOJSON
   ============================================================ */

function processGeoJSON(
    geojson,
    fileName = "Uploaded Field"
) {

    if (!geojson) {
        return;
    }


    if (
        geojson.type !== "FeatureCollection" &&
        geojson.type !== "Feature"
    ) {

        showMessage(
            "This file does not contain a supported GeoJSON feature."
        );

        return;

    }


    appState.uploadedGeoJSON =
        geojson;


    /* Remove previous field */

    if (appState.fieldLayer) {

        appState.map.removeLayer(
            appState.fieldLayer
        );

    }


    /* --------------------------------------------------------
       CREATE FIELD LAYER
       -------------------------------------------------------- */

    appState.fieldLayer =
        L.geoJSON(
            geojson,
            {

                style: {

                    color:
                        "#c2e3b5",

                    weight:
                        3,

                    opacity:
                        1,

                    fillColor:
                        "#8fbf83",

                    fillOpacity:
                        0.18

                },


                onEachFeature:
                    function(feature, layer) {

                        layer.on(
                            "click",
                            function(event) {

                                L.DomEvent.stopPropagation(
                                    event
                                );


                                selectUploadedField(
                                    feature,
                                    layer
                                );

                            }
                        );


                        layer.on(
                            "mouseover",
                            function() {

                                layer.setStyle({

                                    weight: 4,

                                    color:
                                        "#e4f5dc",

                                    fillOpacity:
                                        0.30

                                });

                            }
                        );


                        layer.on(
                            "mouseout",
                            function() {

                                appState.fieldLayer.resetStyle(
                                    layer
                                );

                            }
                        );

                    }

            }
        );


    appState.fieldLayer.addTo(
        appState.map
    );


    /* --------------------------------------------------------
       FIT MAP TO FIELD
       -------------------------------------------------------- */

    const bounds =
        appState.fieldLayer.getBounds();


    if (bounds.isValid()) {

        appState.map.fitBounds(
            bounds,
            {

                padding:
                    [100, 100],

                maxZoom:
                    17

            }
        );

    }


    /* --------------------------------------------------------
       CALCULATE AREA
       -------------------------------------------------------- */

    const areaAcres =
        calculateGeoJSONArea(
            geojson
        );


    appState.fieldAreaAcres =
        areaAcres;


    /* --------------------------------------------------------
       FIELD NAME
       -------------------------------------------------------- */

    let detectedName =
        fileName
            .replace(
                /\.geojson$|\.json$/i,
                ""
            );


    if (
        geojson.features &&
        geojson.features[0] &&
        geojson.features[0].properties
    ) {

        const properties =
            geojson.features[0].properties;


        detectedName =
            properties.name ||
            properties.Name ||
            properties.field ||
            properties.Field ||
            detectedName;

    }


    fieldName.textContent =
        detectedName.toUpperCase();


    fieldMeta.textContent =
        `${areaAcres.toFixed(2)} ACRES · UPLOADED FIELD`;


    /* Hide upload window */

    mapUpload.classList.add(
        "hidden"
    );


    /* Run initial scan */

    runFieldScan(
        false
    );

}


/* ============================================================
   SELECT UPLOADED FIELD
   ============================================================ */

function selectUploadedField(
    feature,
    layer
) {

    const properties =
        feature.properties || {};


    const name =
        properties.name ||
        properties.Name ||
        "SELECTED FIELD";


    fieldName.textContent =
        name.toUpperCase();


    if (appState.fieldAreaAcres) {

        fieldMeta.textContent =
            `${appState.fieldAreaAcres.toFixed(2)} ACRES · SELECTED FIELD`;

    }


    if (
        appState.fieldLayer
    ) {

        appState.fieldLayer.eachLayer(
            function(item) {

                appState.fieldLayer.resetStyle(
                    item
                );

            }
        );

    }


    layer.setStyle({

        weight: 5,

        color:
            "#e5f7dc",

        fillColor:
            "#8fbf83",

        fillOpacity:
            0.30

    });


    layer.openPopup();

}


/* ============================================================
   GEOJSON AREA CALCULATION
   ============================================================ */

/*
    Calculates approximate polygon area using a
    spherical Earth approximation.

    Result:
        acres
*/

function calculateGeoJSONArea(
    geojson
) {

    let totalArea =
        0;


    const features =
        geojson.type === "FeatureCollection"
            ? geojson.features
            : [geojson];


    features.forEach(
        feature => {

            if (
                !feature.geometry
            ) {
                return;
            }


            if (
                feature.geometry.type ===
                "Polygon"
            ) {

                totalArea +=
                    polygonArea(
                        feature.geometry.coordinates
                    );

            }


            if (
                feature.geometry.type ===
                "MultiPolygon"
            ) {

                feature.geometry.coordinates.forEach(
                    polygon => {

                        totalArea +=
                            polygonArea(
                                polygon
                            );

                    }
                );

            }

        }
    );


    /* Square meters → acres */

    return totalArea *
        0.000247105;


}


/* ============================================================
   POLYGON AREA
   ============================================================ */

function polygonArea(
    coordinates
) {

    if (
        !coordinates ||
        !coordinates.length
    ) {

        return 0;

    }


    let area =
        0;


    /* Outer ring */

    const outer =
        coordinates[0];


    for (
        let i = 0;
        i < outer.length;
        i++
    ) {

        const j =
            (i + 1) %
            outer.length;


        const lon1 =
            outer[i][0] *
            Math.PI / 180;


        const lat1 =
            outer[i][1] *
            Math.PI / 180;


        const lon2 =
            outer[j][0] *
            Math.PI / 180;


        const lat2 =
            outer[j][1] *
            Math.PI / 180;


        area +=
            (lon2 - lon1) *
            (
                2 +
                Math.sin(lat1) +
                Math.sin(lat2)
            );

    }


    area =
        Math.abs(area) *
        6378137 *
        6378137 /
        2;


    /* Holes */

    if (
        coordinates.length > 1
    ) {

        for (
            let h = 1;
            h < coordinates.length;
            h++
        ) {

            area -=
                polygonArea([
                    coordinates[h]
                ]);

        }

    }


    return Math.max(
        0,
        area
    );

}


/* ============================================================
   FIELD SCAN
   ============================================================ */

function runFieldScan(
    showAnimation = true
) {

    if (
        appState.scanRunning
    ) {

        return;

    }


    if (
        !appState.fieldLayer
    ) {

        showMessage(
            "Load a field boundary before running a scan."
        );

        return;

    }


    appState.scanRunning =
        true;


    if (showAnimation) {

        scanButton.textContent =
            "SCANNING FIELD...";

        scanButton.disabled =
            true;

    }


    /* Animate boundary */

    animateFieldBoundary();


    setTimeout(
        function() {

            const metrics =
                generateFieldMetrics();


            updateMetrics(
                metrics
            );


            if (showAnimation) {

                scanButton.textContent =
                    "SCAN COMPLETE";

            }

        },
        showAnimation ? 1500 : 0
    );


    setTimeout(
        function() {

            if (showAnimation) {

                scanButton.textContent =
                    "RUN FIELD SCAN";

                scanButton.disabled =
                    false;

            }


            appState.scanRunning =
                false;

        },
        showAnimation ? 3000 : 100
    );

}


/* ============================================================
   FIELD BOUNDARY ANIMATION
   ============================================================ */

function animateFieldBoundary() {

    if (
        !appState.fieldLayer
    ) {

        return;

    }


    let step =
        0;


    const interval =
        setInterval(
            function() {

                step++;


                const opacity =
                    step % 2 === 0
                        ? 0.15
                        : 0.40;


                appState.fieldLayer.setStyle({

                    color:
                        "#c2e3b5",

                    weight:
                        step % 2 === 0
                            ? 3
                            : 5,

                    fillOpacity:
                        opacity

                });


                if (
                    step >= 8
                ) {

                    clearInterval(
                        interval
                    );


                    appState.fieldLayer.setStyle({

                        color:
                            "#c2e3b5",

                        weight:
                            3,

                        fillOpacity:
                            0.20

                    });

                }

            },
            140
        );

}


/* ============================================================
   FIELD METRICS
   ============================================================ */

function generateFieldMetrics() {

    /*
        These are demonstration metrics derived from the
        uploaded field and current observation state.

        They are NOT satellite-derived NDVI.

        Real NDVI will be added once we connect a
        multispectral imagery source.
    */


    const seed =
        getFieldSeed();


    const seasonal =
        [
            0.91,
            0.96,
            1.02,
            1.05,
            1.08
        ][
            appState.observationIndex
        ];


    const ndvi =
        Math.min(
            0.92,
            Math.max(
                0.20,
                0.62 +
                seed * 0.14 *
                seasonal
            )
        );


    const health =
        Math.round(
            ndvi * 100
        );


    const uniformity =
        Math.round(
            78 +
            seed * 15
        );


    let stress =
        "LOW";


    if (
        health < 60
    ) {

        stress =
            "HIGH";

    }

    else if (
        health < 75
    ) {

        stress =
            "MODERATE";

    }


    return {

        health,

        ndvi,

        uniformity,

        stress

    };

}


/* ============================================================
   DETERMINISTIC FIELD SEED
   ============================================================ */

function getFieldSeed() {

    const text =
        fieldName.textContent;


    let hash =
        0;


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        hash =
            (
                hash * 31 +
                text.charCodeAt(i)
            ) % 1000;

    }


    return hash / 1000;

}


/* ============================================================
   UPDATE METRICS
   ============================================================ */

function updateMetrics(
    metrics
) {

    animateNumber(
        healthValue,
        metrics.health,
        0
    );


    animateNumber(
        ndviValue,
        metrics.ndvi,
        2
    );


    animateNumber(
        uniformityValue,
        metrics.uniformity,
        0,
        "%"
    );


    stressValue.textContent =
        metrics.stress;

}


/* ============================================================
   NUMBER ANIMATION
   ============================================================ */

function animateNumber(
    element,
    target,
    decimals = 0,
    suffix = ""
) {

    const startValue =
        parseFloat(
            element.textContent
        ) || 0;


    const duration =
        700;


    const startTime =
        performance.now();


    function frame(
        time
    ) {

        const progress =
            Math.min(
                1,
                (
                    time -
                    startTime
                ) / duration
            );


        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        const value =
            startValue +
            (
                target -
                startValue
            ) *
            eased;


        element.textContent =
            value.toFixed(
                decimals
            ) +
            suffix;


        if (
            progress < 1
        ) {

            requestAnimationFrame(
                frame
            );

        }

    }


    requestAnimationFrame(
        frame
    );

}


/* ============================================================
   SATELLITE / STREET LAYER SWITCHING
   ============================================================ */

function setMapLayer(
    layerName
) {

    if (
        !appState.map
    ) {

        return;

    }


    if (
        appState.satelliteLayer
    ) {

        appState.map.removeLayer(
            appState.satelliteLayer
        );

    }


    if (
        appState.streetLayer
    ) {

        appState.map.removeLayer(
            appState.streetLayer
        );

    }


    if (
        layerName ===
        "satellite"
    ) {

        appState.satelliteLayer.addTo(
            appState.map
        );

    }

    else {

        appState.streetLayer.addTo(
            appState.map
        );

    }


    appState.activeLayer =
        layerName;

}


/* ============================================================
   LAYER BUTTONS
   ============================================================ */

const layerButtons =
    document.querySelectorAll(
        ".layer-button"
    );


layerButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function() {

                layerButtons.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                const requestedLayer =
                    button.dataset.layer;


                /*
                    Satellite is currently a true
                    imagery layer.

                    NDVI / vegetation / water are
                    interface placeholders until
                    multispectral imagery is connected.
                */

                if (
                    requestedLayer ===
                    "satellite"
                ) {

                    setMapLayer(
                        "satellite"
                    );

                }

                else {

                    setMapLayer(
                        "street"
                    );


                    showMessage(
                        `${requestedLayer.toUpperCase()} analysis layer will be connected to multispectral imagery in the next phase.`
                    );

                }

            }
        );

    }
);


/* ============================================================
   FIELD SELECTOR
   ============================================================ */

if (fieldSelect) {

    fieldSelect.addEventListener(
        "change",
        function() {

            const selected =
                this.value;


            const field =
                sampleFields[selected];


            if (!field) {
                return;
            }


            fieldName.textContent =
                selected.toUpperCase();


            fieldMeta.textContent =
                `LARAMIE COUNTY · WYOMING · ${field.health ? "SAMPLE FIELD" : ""}`;


            updateMetrics(
                field
            );


            if (
                appState.map
            ) {

                appState.map.setView(
                    [
                        41.1402,
                        -104.8202
                    ],
                    13,
                    {
                        animate:
                            true,

                        duration:
                            1
                    }
                );

            }

        }
    );

}


/* ============================================================
   GEOJSON INPUT
   ============================================================ */

if (geojsonInput) {

    geojsonInput.addEventListener(
        "change",
        function() {

            readGeoJSONFile(
                this.files[0]
            );

        }
    );

}


/* ============================================================
   DRAG & DROP
   ============================================================ */

if (mapUpload) {

    mapUpload.addEventListener(
        "dragover",
        function(event) {

            event.preventDefault();

            mapUpload.classList.add(
                "dragging"
            );

        }
    );


    mapUpload.addEventListener(
        "dragleave",
        function() {

            mapUpload.classList.remove(
                "dragging"
            );

        }
    );


    mapUpload.addEventListener(
        "drop",
        function(event) {

            event.preventDefault();

            mapUpload.classList.remove(
                "dragging"
            );


            const file =
                event.dataTransfer.files[0];


            readGeoJSONFile(
                file
            );

        }
    );

}


/* ============================================================
   SCAN BUTTON
   ============================================================ */

if (scanButton) {

    scanButton.addEventListener(
        "click",
        function() {

            runFieldScan(
                true
            );

        }
    );

}


/* ============================================================
   TIMELINE
   ============================================================ */

const observationDates = [

    "APR 18 2026",

    "MAY 16 2026",

    "JUN 20 2026",

    "JUL 18 2026",

    "AUG 25 2026"

];


if (timelineSlider) {

    timelineSlider.addEventListener(
        "input",
        function() {

            appState.observationIndex =
                Number(
                    this.value
                );


            timelineDate.textContent =
                observationDates[
                    appState.observationIndex
                ];


            /*
                Re-run demonstration analysis
                for the selected observation.
            */

            if (
                appState.fieldLayer
            ) {

                runFieldScan(
                    false
                );

            }

        }
    );

}


/* ============================================================
   MESSAGE SYSTEM
   ============================================================ */

function showMessage(
    message
) {

    const existing =
        document.querySelector(
            ".app-message"
        );


    if (existing) {

        existing.remove();

    }


    const element =
        document.createElement(
            "div"
        );


    element.className =
        "app-message";


    element.textContent =
        message;


    document.body.appendChild(
        element
    );


    setTimeout(
        function() {

            element.classList.add(
                "visible"
            );

        },
        20
    );


    setTimeout(
        function() {

            element.classList.remove(
                "visible"
            );


            setTimeout(
                function() {

                    element.remove();

                },
                400
            );

        },
        3500
    );

}


/* ============================================================
   START
   ============================================================ */

initializeMap();

startIntro();
