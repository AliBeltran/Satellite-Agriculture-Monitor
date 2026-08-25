/* ============================================================
   SATELLITE AGRICULTURE MONITOR
   Interactive Geospatial Application
   Designed by Ali Beltran
   ============================================================ */


/* ============================================================
   APPLICATION STATE
   ============================================================ */

const appState = {

    map: null,

    satelliteLayer: null,

    streetLayer: null,

    fieldLayer: null,

    uploadedGeoJSON: null,

    fieldAreaAcres: null,

    selectedFieldName: null,

    activeLayer: "satellite",

    observationIndex: 4,

    scanRunning: false

};


/* ============================================================
   DOM ELEMENTS
   ============================================================ */

const introScreen =
    document.getElementById("introScreen");

const mainInterface =
    document.getElementById("mainInterface");

const loadingBar =
    document.getElementById("loadingBar");

const loadingText =
    document.getElementById("loadingText");

const emptyState =
    document.getElementById("emptyState");

const fieldState =
    document.getElementById("fieldState");

const fieldName =
    document.getElementById("fieldName");

const fieldMeta =
    document.getElementById("fieldMeta");

const analysisPanel =
    document.getElementById("analysisPanel");

const layerPanel =
    document.getElementById("layerPanel");

const timeline =
    document.getElementById("timeline");

const mapLegend =
    document.getElementById("mapLegend");

const mapControls =
    document.getElementById("mapControls");

const mapUpload =
    document.getElementById("mapUpload");

const geojsonInput =
    document.getElementById("geojsonInput");

const healthValue =
    document.getElementById("healthValue");

const ndviValue =
    document.getElementById("ndviValue");

const uniformityValue =
    document.getElementById("uniformityValue");

const stressValue =
    document.getElementById("stressValue");

const scanButton =
    document.getElementById("scanButton");

const timelineSlider =
    document.getElementById("timelineSlider");

const timelineDate =
    document.getElementById("timelineDate");

const appMessage =
    document.getElementById("appMessage");

const resetMapButton =
    document.getElementById("resetMap");


/* ============================================================
   INITIALIZATION
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);


function initializeApplication() {

    initializeMap();

    initializeNavigation();

    initializeUpload();

    initializeLayers();

    initializeTimeline();

    initializeScanButton();

    initializeResetButton();

    startIntro();

}


/* ============================================================
   INTRO SCREEN
   ============================================================ */

function startIntro() {

    let progress = 0;

    const messages = [

        "ESTABLISHING GEOSPATIAL LINK",

        "CONNECTING TO IMAGERY SERVICE",

        "LOADING FIELD ENGINE",

        "INITIALIZING REMOTE SENSING SYSTEM",

        "SYSTEM READY"

    ];


    const timer =
        setInterval(
            function() {

                progress +=
                    Math.random() * 10 + 7;


                if (progress >= 100) {

                    progress = 100;

                    clearInterval(timer);

                }


                if (loadingBar) {

                    loadingBar.style.width =
                        `${progress}%`;

                }


                const messageIndex =
                    Math.min(
                        Math.floor(
                            progress / 20
                        ),
                        messages.length - 1
                    );


                if (loadingText) {

                    loadingText.textContent =
                        messages[messageIndex];

                }


                if (progress >= 100) {

                    setTimeout(
                        launchApplication,
                        700
                    );

                }

            },
            300
        );

}


/* ============================================================
   LAUNCH MAIN INTERFACE
   ============================================================ */

function launchApplication() {

    if (introScreen) {

        introScreen.classList.add(
            "hidden"
        );

    }


    if (mainInterface) {

        mainInterface.classList.add(
            "visible"
        );

    }


    setTimeout(
        function() {

            if (appState.map) {

                appState.map.invalidateSize();

            }

        },
        600
    );

}


/* ============================================================
   MAP INITIALIZATION
   ============================================================ */

function initializeMap() {

    if (
        typeof L === "undefined"
    ) {

        console.error(
            "Leaflet could not be loaded."
        );

        showMessage(
            "The mapping engine could not be loaded."
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
            [
                39.8283,
                -98.5795
            ],
            4
        );


    /* ========================================================
       SATELLITE IMAGERY
       ======================================================== */

    appState.satelliteLayer =
        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {

                maxZoom: 19,

                attribution:
                    "Imagery © Esri"

            }
        );


    /* ========================================================
       STREET MAP
       ======================================================== */

    appState.streetLayer =
        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {

                maxZoom: 19,

                attribution:
                    "© OpenStreetMap contributors"

            }
        );


    /* Start with satellite imagery */

    appState.satelliteLayer.addTo(
        appState.map
    );


    /* ========================================================
       MAP CLICK
       ======================================================== */

    appState.map.on(
        "click",
        function(event) {

            const latitude =
                event.latlng.lat.toFixed(5);

            const longitude =
                event.latlng.lng.toFixed(5);


            console.log(
                `Map coordinate: ${latitude}, ${longitude}`
            );

        }
    );

}


/* ============================================================
   NAVIGATION
   ============================================================ */

function initializeNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        function(item) {

            item.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();


                    navItems.forEach(
                        function(nav) {

                            nav.classList.remove(
                                "active"
                            );

                        }
                    );


                    item.classList.add(
                        "active"
                    );


                    const view =
                        item.dataset.view;


                    handleNavigation(
                        view
                    );

                }
            );

        }
    );

}


function handleNavigation(
    view
) {

    if (
        view === "overview"
    ) {

        showMessage(
            "Overview mode active."
        );

        return;

    }


    if (
        view === "fields"
    ) {

        if (
            !appState.uploadedGeoJSON
        ) {

            showMessage(
                "Upload a field boundary to begin."
            );

            return;

        }


        focusField();

        return;

    }


    if (
        view === "satellite"
    ) {

        setMapLayer(
            "satellite"
        );

        activateLayerButton(
            "satellite"
        );

        return;

    }


    if (
        view === "analysis"
    ) {

        if (
            !appState.uploadedGeoJSON
        ) {

            showMessage(
                "Upload a field boundary before opening analysis."
            );

            return;

        }


        if (analysisPanel) {

            analysisPanel.classList.remove(
                "hidden"
            );

        }

    }

}


/* ============================================================
   FILE UPLOAD
   ============================================================ */

function initializeUpload() {

    if (!geojsonInput) {
        return;
    }


    geojsonInput.addEventListener(
        "change",
        function() {

            const file =
                this.files[0];


            if (!file) {
                return;
            }


            readGeoJSONFile(
                file
            );

        }
    );


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


                const files =
                    event.dataTransfer.files;


                if (
                    files &&
                    files.length > 0
                ) {

                    readGeoJSONFile(
                        files[0]
                    );

                }

            }
        );

    }

}


/* ============================================================
   READ GEOJSON
   ============================================================ */

function readGeoJSONFile(
    file
) {

    if (!file) {
        return;
    }


    const fileName =
        file.name.toLowerCase();


    if (
        !fileName.endsWith(
            ".geojson"
        ) &&
        !fileName.endsWith(
            ".json"
        )
    ) {

        showMessage(
            "Please upload a .geojson or .json field boundary."
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

                console.error(
                    error
                );

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


    reader.readAsText(
        file
    );

}


/* ============================================================
   PROCESS GEOJSON
   ============================================================ */

function processGeoJSON(
    geojson,
    fileName
) {

    if (!geojson) {

        showMessage(
            "No geographic data was found."
        );

        return;

    }


    if (
        geojson.type !==
            "FeatureCollection" &&
        geojson.type !==
            "Feature"
    ) {

        showMessage(
            "The file must contain a GeoJSON Feature or FeatureCollection."
        );

        return;

    }


    appState.uploadedGeoJSON =
        geojson;


    /* ========================================================
       REMOVE PREVIOUS FIELD
       ======================================================== */

    if (
        appState.fieldLayer
    ) {

        appState.map.removeLayer(
            appState.fieldLayer
        );

        appState.fieldLayer =
            null;

    }


    /* ========================================================
       CREATE GEOJSON LAYER
       ======================================================== */

    appState.fieldLayer =
        L.geoJSON(
            geojson,
            {

                style:
                    getFieldStyle(),


                onEachFeature:
                    function(
                        feature,
                        layer
                    ) {

                        setupFieldInteraction(
                            feature,
                            layer
                        );

                    }

            }
        );


    appState.fieldLayer.addTo(
        appState.map
    );


    /* ========================================================
       CALCULATE FIELD AREA
       ======================================================== */

    const acres =
        calculateGeoJSONArea(
            geojson
        );


    appState.fieldAreaAcres =
        acres;


    /* ========================================================
       DETERMINE FIELD NAME
       ======================================================== */

    const detectedName =
        detectFieldName(
            geojson,
            fileName
        );


    appState.selectedFieldName =
        detectedName;


    /* ========================================================
       UPDATE INTERFACE
       ======================================================== */

    updateFieldDisplay(
        detectedName,
        acres
    );


    activateFieldInterface();


    /* ========================================================
       ZOOM TO FIELD
       ======================================================== */

    const bounds =
        appState.fieldLayer.getBounds();


    if (
        bounds.isValid()
    ) {

        appState.map.fitBounds(
            bounds,
            {

                padding:
                    [120, 120],

                maxZoom:
                    17,

                animate:
                    true,

                duration:
                    1.4

            }
        );

    }


    /* ========================================================
       HIDE UPLOAD PANEL
       ======================================================== */

    if (mapUpload) {

        mapUpload.classList.add(
            "hidden"
        );

    }


    /* ========================================================
       INITIAL FIELD SCAN
       ======================================================== */

    runFieldScan(
        false
    );


    showMessage(
        `Field loaded successfully — ${acres.toFixed(2)} acres.`
    );

}


/* ============================================================
   FIELD NAME DETECTION
   ============================================================ */

function detectFieldName(
    geojson,
    fileName
) {

    let name =
        fileName
            .replace(
                /\.geojson$/i,
                ""
            )
            .replace(
                /\.json$/i,
                ""
            );


    const features =
        geojson.type ===
            "FeatureCollection"
            ? geojson.features
            : [geojson];


    if (
        features.length > 0 &&
        features[0].properties
    ) {

        const properties =
            features[0].properties;


        const possibleNames = [

            properties.name,

            properties.Name,

            properties.NAME,

            properties.field,

            properties.Field,

            properties.FIELD,

            properties.field_name,

            properties.FieldName,

            properties.Farm,

            properties.farm

        ];


        for (
            const possibleName
            of possibleNames
        ) {

            if (
                possibleName !==
                    undefined &&
                possibleName !==
                    null &&
                String(
                    possibleName
                ).trim() !== ""
            ) {

                name =
                    String(
                        possibleName
                    );

                break;

            }

        }

    }


    return name;

}


/* ============================================================
   FIELD DISPLAY
   ============================================================ */

function updateFieldDisplay(
    name,
    acres
) {

    if (fieldName) {

        fieldName.textContent =
            name.toUpperCase();

    }


    if (fieldMeta) {

        fieldMeta.textContent =
            `${acres.toFixed(2)} ACRES · FIELD BOUNDARY LOADED`;

    }

}


/* ============================================================
   ACTIVATE FIELD INTERFACE
   ============================================================ */

function activateFieldInterface() {

    if (emptyState) {

        emptyState.classList.add(
            "hidden"
        );

    }


    if (fieldState) {

        fieldState.classList.remove(
            "hidden"
        );

    }


    if (analysisPanel) {

        analysisPanel.classList.remove(
            "hidden"
        );

    }


    if (layerPanel) {

        layerPanel.classList.remove(
            "hidden"
        );

    }


    if (timeline) {

        timeline.classList.remove(
            "hidden"
        );

    }


    if (mapLegend) {

        mapLegend.classList.remove(
            "hidden"
        );

    }


    if (mapControls) {

        mapControls.classList.remove(
            "hidden"
        );

    }

}


/* ============================================================
   FIELD INTERACTION
   ============================================================ */

function setupFieldInteraction(
    feature,
    layer
) {

    layer.on(
        "mouseover",
        function() {

            layer.setStyle({

                weight:
                    4,

                color:
                    "#e4f5dc",

                fillColor:
                    "#8fbf83",

                fillOpacity:
                    0.32

            });

        }
    );


    layer.on(
        "mouseout",
        function() {

            if (
                appState.fieldLayer
            ) {

                appState.fieldLayer.resetStyle(
                    layer
                );

            }

        }
    );


    layer.on(
        "click",
        function(event) {

            L.DomEvent.stopPropagation(
                event
            );


            selectFieldFeature(
                feature,
                layer
            );

        }
    );

}


/* ============================================================
   SELECT FIELD FEATURE
   ============================================================ */

function selectFieldFeature(
    feature,
    layer
) {

    const properties =
        feature.properties || {};


    const name =
        properties.name ||
        properties.Name ||
        appState.selectedFieldName ||
        "SELECTED FIELD";


    appState.selectedFieldName =
        name;


    fieldName.textContent =
        name.toUpperCase();


    if (
        appState.fieldAreaAcres
    ) {

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

        weight:
            5,

        color:
            "#e5f7dc",

        fillColor:
            "#8fbf83",

        fillOpacity:
            0.30

    });


    layer.bindPopup(
        createFieldPopup(
            properties
        )
    );


    layer.openPopup();

}


/* ============================================================
   FIELD POPUP
   ============================================================ */

function createFieldPopup(
    properties
) {

    const entries =
        Object.entries(
            properties || {}
        );


    if (
        entries.length === 0
    ) {

        return `
            <div class="field-popup-title">
                FIELD BOUNDARY
            </div>

            <div class="field-popup-data">
                No additional attributes found.
            </div>
        `;

    }


    const rows =
        entries
            .slice(0, 8)
            .map(
                function([
                    key,
                    value
                ]) {

                    return `
                        <div>
                            <strong>
                                ${escapeHTML(key)}
                            </strong>
                            :
                            ${escapeHTML(value)}
                        </div>
                    `;

                }
            )
            .join("");


    return `
        <div class="field-popup-title">
            FIELD INFORMATION
        </div>

        <div class="field-popup-data">
            ${rows}
        </div>
    `;

}


/* ============================================================
   ESCAPE HTML
   ============================================================ */

function escapeHTML(
    value
) {

    return String(
        value
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ============================================================
   FIELD STYLE
   ============================================================ */

function getFieldStyle() {

    return {

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

    };

}


/* ============================================================
   AREA CALCULATION
   ============================================================ */

function calculateGeoJSONArea(
    geojson
) {

    let totalArea =
        0;


    const features =
        geojson.type ===
            "FeatureCollection"
            ? geojson.features
            : [geojson];


    features.forEach(
        function(feature) {

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
                    function(polygon) {

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

    return (
        totalArea *
        0.000247105
    );

}


/* ============================================================
   POLYGON AREA
   ============================================================ */

function polygonArea(
    coordinates
) {

    if (
        !coordinates ||
        coordinates.length === 0
    ) {

        return 0;

    }


    const outerRing =
        coordinates[0];


    let area =
        0;


    for (
        let i = 0;
        i < outerRing.length;
        i++
    ) {

        const j =
            (
                i + 1
            ) %
            outerRing.length;


        const lon1 =
            outerRing[i][0] *
            Math.PI /
            180;


        const lat1 =
            outerRing[i][1] *
            Math.PI /
            180;


        const lon2 =
            outerRing[j][0] *
            Math.PI /
            180;


        const lat2 =
            outerRing[j][1] *
            Math.PI /
            180;


        area +=
            (
                lon2 -
                lon1
            ) *
            (
                2 +
                Math.sin(lat1) +
                Math.sin(lat2)
            );

    }


    area =
        Math.abs(
            area
        ) *
        6378137 *
        6378137 /
        2;


    /* Account for holes */

    if (
        coordinates.length > 1
    ) {

        for (
            let i = 1;
            i < coordinates.length;
            i++
        ) {

            area -=
                polygonArea([
                    coordinates[i]
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

function initializeScanButton() {

    if (!scanButton) {
        return;
    }


    scanButton.addEventListener(
        "click",
        function() {

            runFieldScan(
                true
            );

        }
    );

}


function runFieldScan(
    animated = true
) {

    if (
        !appState.fieldLayer
    ) {

        showMessage(
            "Upload a field boundary before scanning."
        );

        return;

    }


    if (
        appState.scanRunning
    ) {

        return;

    }


    appState.scanRunning =
        true;


    if (scanButton) {

        scanButton.disabled =
            true;

        if (animated) {

            scanButton.textContent =
                "SCANNING FIELD...";

        }

    }


    animateFieldBoundary();


    const delay =
        animated
            ? 1500
            : 100;


    setTimeout(
        function() {

            const metrics =
                calculateDemonstrationMetrics();


            updateMetrics(
                metrics
            );


            if (
                scanButton &&
                animated
            ) {

                scanButton.textContent =
                    "SCAN COMPLETE";

            }

        },
        delay
    );


    setTimeout(
        function() {

            appState.scanRunning =
                false;


            if (scanButton) {

                scanButton.disabled =
                    false;

                scanButton.textContent =
                    "RUN FIELD SCAN";

            }

        },
        animated
            ? 3000
            : 200
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


    let pulse =
        0;


    const interval =
        setInterval(
            function() {

                pulse++;


                const even =
                    pulse % 2 === 0;


                appState.fieldLayer.setStyle({

                    color:
                        even
                            ? "#c2e3b5"
                            : "#ffffff",

                    weight:
                        even
                            ? 3
                            : 5,

                    fillOpacity:
                        even
                            ? 0.18
                            : 0.32

                });


                if (
                    pulse >= 8
                ) {

                    clearInterval(
                        interval
                    );


                    appState.fieldLayer.setStyle(
                        getFieldStyle()
                    );

                }

            },
            130
        );

}


/* ============================================================
   DEMONSTRATION METRICS
   ============================================================ */

/*
    IMPORTANT:

    These values are NOT actual satellite-derived
    NDVI or crop-health measurements.

    They are temporary interface values used until
    a multispectral satellite data source is connected.

    This keeps the interface functional without
    falsely claiming that the application has already
    performed real remote sensing analysis.
*/

function calculateDemonstrationMetrics() {

    const seed =
        createFieldSeed();


    const seasonalFactors = [

        0.86,

        0.94,

        1.00,

        1.05,

        1.08

    ];


    const seasonal =
        seasonalFactors[
            appState.observationIndex
        ];


    const ndvi =
        Math.min(
            0.90,

            Math.max(
                0.20,

                (
                    0.52 +
                    seed * 0.18
                ) *
                seasonal
            )
        );


    const health =
        Math.round(
            ndvi * 100
        );


    const uniformity =
        Math.round(
            72 +
            seed * 23
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
   FIELD SEED
   ============================================================ */

function createFieldSeed() {

    const text =
        appState.selectedFieldName ||
        "FIELD";


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

    if (healthValue) {

        animateNumber(
            healthValue,
            metrics.health,
            0
        );

    }


    if (ndviValue) {

        animateNumber(
            ndviValue,
            metrics.ndvi,
            2
        );

    }


    if (uniformityValue) {

        animateNumber(
            uniformityValue,
            metrics.uniformity,
            0,
            "%"
        );

    }


    if (stressValue) {

        stressValue.textContent =
            metrics.stress;

    }

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

    if (!element) {
        return;
    }


    const current =
        parseFloat(
            element.textContent
        );


    const startValue =
        Number.isFinite(
            current
        )
            ? current
            : 0;


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
                ) /
                duration
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
   MAP LAYER SYSTEM
   ============================================================ */

function initializeLayers() {

    const buttons =
        document.querySelectorAll(
            ".layer-button"
        );


    buttons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    const layerName =
                        button.dataset.layer;


                    activateLayerButton(
                        layerName
                    );


                    handleLayerSelection(
                        layerName
                    );

                }
            );

        }
    );

}


/* ============================================================
   ACTIVATE LAYER BUTTON
   ============================================================ */

function activateLayerButton(
    layerName
) {

    const buttons =
        document.querySelectorAll(
            ".layer-button"
        );


    buttons.forEach(
        function(button) {

            button.classList.toggle(
                "active",
                button.dataset.layer ===
                    layerName
            );

        }
    );

}


/* ============================================================
   HANDLE LAYER SELECTION
   ============================================================ */

function handleLayerSelection(
    layerName
) {

    if (
        layerName ===
        "satellite"
    ) {

        setMapLayer(
            "satellite"
        );

        return;

    }


    /*
        These analysis layers will eventually
        use real multispectral satellite data.
    */

    if (
        !appState.uploadedGeoJSON
    ) {

        showMessage(
            "Upload a field before activating analysis layers."
        );

        return;

    }


    if (
        layerName ===
        "ndvi"
    ) {

        showMessage(
            "NDVI layer is ready for multispectral imagery integration."
        );

        return;

    }


    if (
        layerName ===
        "vegetation"
    ) {

        showMessage(
            "Vegetation layer is ready for remote-sensing integration."
        );

        return;

    }


    if (
        layerName ===
        "water"
    ) {

        showMessage(
            "Water-stress layer is ready for remote-sensing integration."
        );

    }

}


/* ============================================================
   SET MAP BASE LAYER
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
   TIMELINE
   ============================================================ */

function initializeTimeline() {

    if (!timelineSlider) {
        return;
    }


    const dates = [

        "APR 18 2026",

        "MAY 16 2026",

        "JUN 20 2026",

        "JUL 18 2026",

        "AUG 25 2026"

    ];


    timelineSlider.addEventListener(
        "input",
        function() {

            appState.observationIndex =
                Number(
                    timelineSlider.value
                );


            if (timelineDate) {

                timelineDate.textContent =
                    dates[
                        appState.observationIndex
                    ];

            }


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
   RESET MAP
   ============================================================ */

function initializeResetButton() {

    if (!resetMapButton) {
        return;
    }


    resetMapButton.addEventListener(
        "click",
        resetApplication
    );

}


function resetApplication() {

    /* Remove field */

    if (
        appState.fieldLayer
    ) {

        appState.map.removeLayer(
            appState.fieldLayer
        );

    }


    /* Reset state */

    appState.fieldLayer =
        null;

    appState.uploadedGeoJSON =
        null;

    appState.fieldAreaAcres =
        null;

    appState.selectedFieldName =
        null;

    appState.observationIndex =
        4;


    /* Reset interface */

    if (emptyState) {

        emptyState.classList.remove(
            "hidden"
        );

    }


    if (fieldState) {

        fieldState.classList.add(
            "hidden"
        );

    }


    if (analysisPanel) {

        analysisPanel.classList.add(
            "hidden"
        );

    }


    if (layerPanel) {

        layerPanel.classList.add(
            "hidden"
        );

    }


    if (timeline) {

        timeline.classList.add(
            "hidden"
        );

    }


    if (mapLegend) {

        mapLegend.classList.add(
            "hidden"
        );

    }


    if (mapControls) {

        mapControls.classList.add(
            "hidden"
        );

    }


    if (mapUpload) {

        mapUpload.classList.remove(
            "hidden"
        );

    }


    /* Reset metrics */

    if (healthValue) {

        healthValue.textContent =
            "—";

    }


    if (ndviValue) {

        ndviValue.textContent =
            "—";

    }


    if (uniformityValue) {

        uniformityValue.textContent =
            "—";

    }


    if (stressValue) {

        stressValue.textContent =
            "—";

    }


    if (timelineDate) {

        timelineDate.textContent =
            "—";

    }


    if (timelineSlider) {

        timelineSlider.value =
            "4";

    }


    /* Reset map */

    if (
        appState.map
    ) {

        appState.map.setView(
            [
                39.8283,
                -98.5795
            ],
            4,
            {
                animate:
                    true
            }
        );

    }


    activateLayerButton(
        "satellite"
    );


    setMapLayer(
        "satellite"
    );


    if (geojsonInput) {

        geojsonInput.value =
            "";

    }


    showMessage(
        "Field cleared. Ready for a new analysis."
    );

}


/* ============================================================
   FOCUS FIELD
   ============================================================ */

function focusField() {

    if (
        !appState.fieldLayer
    ) {

        showMessage(
            "No field is currently loaded."
        );

        return;

    }


    const bounds =
        appState.fieldLayer.getBounds();


    if (
        bounds.isValid()
    ) {

        appState.map.fitBounds(
            bounds,
            {

                padding:
                    [120, 120],

                maxZoom:
                    17,

                animate:
                    true,

                duration:
                    1.2

            }
        );

    }

}


/* ============================================================
   APPLICATION MESSAGE
   ============================================================ */

function showMessage(
    message
) {

    if (!appMessage) {

        console.log(
            message
        );

        return;

    }


    appMessage.textContent =
        message;


    appMessage.classList.add(
        "visible"
    );


    clearTimeout(
        appMessage.messageTimer
    );


    appMessage.messageTimer =
        setTimeout(
            function() {

                appMessage.classList.remove(
                    "visible"
                );

            },
            3500
        );

}


/* ============================================================
   END APPLICATION
   ============================================================ */
