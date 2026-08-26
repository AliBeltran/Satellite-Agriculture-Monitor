"use strict";

/*
============================================================
 SATELLITE AGRICULTURE MONITOR
 Designed by Ali Beltran

 Frontend Application
 -----------------------------------------------------------
 • Interactive mission landing screen
 • Mouse / trackpad parallax
 • Live telemetry
 • Mission transition
 • Leaflet map
 • GeoJSON upload
 • Drag & drop
 • Field boundary visualization
 • Acreage calculation
 • Perimeter calculation
 • Field coordinates
 • Map layers
 • Field scan animation
============================================================
*/


/* ==========================================================
   APPLICATION STATE
========================================================== */

const app = {

    map: null,

    fieldLayer: null,

    fieldData: null,

    fieldName: null,

    fieldAreaAcres: null,

    fieldPerimeterMiles: null,

    fieldCenter: null,

    fieldLoaded: false,

    satelliteLayer: null,

    ndviLayer: null,

    vegetationLayer: null,

    waterStressLayer: null

};


/* ==========================================================
   DOM ELEMENTS
========================================================== */

const missionScreen =
    document.getElementById("missionScreen");

const missionScene =
    document.getElementById("missionScene");

const orbitSystem =
    document.getElementById("orbitSystem");

const startMission =
    document.getElementById("startMission");

const telemetryLat =
    document.getElementById("telemetryLat");

const telemetryLong =
    document.getElementById("telemetryLong");

const mainInterface =
    document.getElementById("mainInterface");

const fieldMap =
    document.getElementById("fieldMap");

const emptyState =
    document.getElementById("emptyState");

const fieldState =
    document.getElementById("fieldState");

const fieldName =
    document.getElementById("fieldName");

const fieldMeta =
    document.getElementById("fieldMeta");

const mapUpload =
    document.getElementById("mapUpload");

const geojsonInput =
    document.getElementById("geojsonInput");

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

const resetMap =
    document.getElementById("resetMap");

const appMessage =
    document.getElementById("appMessage");

const scanButton =
    document.getElementById("scanButton");


/* ==========================================================
   APPLICATION START
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);


function initializeApplication() {

    initializeMissionScreen();

    initializeUpload();

    initializeControls();

    initializeNavigation();

    initializeTimeline();

}


/* ==========================================================
   INTERACTIVE MISSION SCREEN
========================================================== */

function initializeMissionScreen() {

    if (!missionScreen) {
        return;
    }


    /*
    ----------------------------------------------------------
    Mouse / trackpad parallax
    ----------------------------------------------------------
    */

    missionScreen.addEventListener(
        "pointermove",
        handleMissionPointer
    );


    /*
    ----------------------------------------------------------
    Reset parallax when pointer leaves
    ----------------------------------------------------------
    */

    missionScreen.addEventListener(
        "pointerleave",
        resetMissionParallax
    );


    /*
    ----------------------------------------------------------
    Start mission button
    ----------------------------------------------------------
    */

    if (startMission) {

        startMission.addEventListener(
            "click",
            launchMission
        );

    }

}


/* ==========================================================
   MISSION POINTER
========================================================== */

function handleMissionPointer(event) {

    const x =
        (event.clientX / window.innerWidth) - 0.5;

    const y =
        (event.clientY / window.innerHeight) - 0.5;


    /*
    ----------------------------------------------------------
    Move entire scene slightly
    ----------------------------------------------------------
    */

    if (missionScene) {

        missionScene.style.transform =
            `translate(
                ${x * -10}px,
                ${y * -7}px
            )`;

    }


    /*
    ----------------------------------------------------------
    Rotate orbital system
    ----------------------------------------------------------
    */

    if (orbitSystem) {

        orbitSystem.style.transform =
            `
            translate(-50%, -50%)
            rotateX(${65 + y * -9}deg)
            rotateZ(${-20 + x * 10}deg)
            `;

    }


    /*
    ----------------------------------------------------------
    Telemetry reacts to cursor
    ----------------------------------------------------------
    */

    if (telemetryLat) {

        const latitude =
            39.8283 + (y * 12);

        telemetryLat.textContent =
            `${latitude.toFixed(4)}°`;

    }


    if (telemetryLong) {

        const longitude =
            -98.5795 + (x * 24);

        telemetryLong.textContent =
            `${longitude.toFixed(4)}°`;

    }

}


/* ==========================================================
   RESET MISSION PARALLAX
========================================================== */

function resetMissionParallax() {

    if (missionScene) {

        missionScene.style.transform =
            "";

    }


    if (orbitSystem) {

        orbitSystem.style.transform =
            "";

    }


    if (telemetryLat) {

        telemetryLat.textContent =
            "39.8283°";

    }


    if (telemetryLong) {

        telemetryLong.textContent =
            "-98.5795°";

    }

}


/* ==========================================================
   START MISSION
========================================================== */

function launchMission() {

    if (!missionScreen) {
        return;
    }


    if (startMission) {

        startMission.disabled =
            true;


        const buttonText =
            startMission.querySelector(
                ".button-text"
            );


        if (buttonText) {

            buttonText.textContent =
                "INITIALIZING";

        }

    }


    /*
    ----------------------------------------------------------
    Mission launch effect
    ----------------------------------------------------------
    */

    missionScreen.classList.add(
        "launching"
    );


    /*
    ----------------------------------------------------------
    Start map during transition
    ----------------------------------------------------------
    */

    setTimeout(
        () => {

            initializeMap();

            if (mainInterface) {

                mainInterface.classList.add(
                    "interface-ready"
                );

            }

        },
        450
    );


    /*
    ----------------------------------------------------------
    Remove mission screen
    ----------------------------------------------------------
    */

    setTimeout(
        () => {

            missionScreen.style.display =
                "none";

        },
        1200
    );

}


/* ==========================================================
   MAP INITIALIZATION
========================================================== */

function initializeMap() {

    /*
    Prevent duplicate map initialization
    */

    if (app.map) {

        setTimeout(
            () => {

                app.map.invalidateSize();

            },
            100
        );

        return;

    }


    if (!window.L) {

        showMessage(
            "Mapping engine could not load."
        );

        return;

    }


    if (!fieldMap) {

        return;

    }


    /*
    ----------------------------------------------------------
    Create map
    ----------------------------------------------------------
    */

    app.map =
        L.map(
            fieldMap,
            {

                zoomControl: false,

                attributionControl: true,

                minZoom: 2,

                maxZoom: 20,

                worldCopyJump: true

            }
        );


    /*
    ----------------------------------------------------------
    Initial world view
    ----------------------------------------------------------
    */

    app.map.setView(
        [39.8283, -98.5795],
        4
    );


    /*
    ----------------------------------------------------------
    Satellite-style imagery layer
    ----------------------------------------------------------

    This uses Esri World Imagery as the visual basemap.
    It is not yet agricultural satellite analysis.
    ----------------------------------------------------------
    */

    app.satelliteLayer =
        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/" +
            "World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {

                maxZoom: 19,

                attribution:
                    "Tiles &copy; Esri"

            }
        );


    app.satelliteLayer.addTo(
        app.map
    );


    /*
    ----------------------------------------------------------
    Add zoom controls
    ----------------------------------------------------------
    */

    L.control.zoom({

        position: "bottomright"

    }).addTo(
        app.map
    );


    /*
    ----------------------------------------------------------
    Force Leaflet to calculate dimensions
    ----------------------------------------------------------
    */

    setTimeout(
        () => {

            app.map.invalidateSize();

        },
        200
    );

}


/* ==========================================================
   GEOJSON UPLOAD
========================================================== */

function initializeUpload() {

    if (!geojsonInput) {

        return;

    }


    /*
    ----------------------------------------------------------
    Standard file selection
    ----------------------------------------------------------
    */

    geojsonInput.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


            readGeoJSONFile(file);

        }
    );


    /*
    ----------------------------------------------------------
    Drag over
    ----------------------------------------------------------
    */

    if (mapUpload) {

        mapUpload.addEventListener(
            "dragover",
            event => {

                event.preventDefault();

                mapUpload.classList.add(
                    "drag-active"
                );

            }
        );


        /*
        ------------------------------------------------------
        Drag leave
        ------------------------------------------------------
        */

        mapUpload.addEventListener(
            "dragleave",
            () => {

                mapUpload.classList.remove(
                    "drag-active"
                );

            }
        );


        /*
        ------------------------------------------------------
        Drop
        ------------------------------------------------------
        */

        mapUpload.addEventListener(
            "drop",
            event => {

                event.preventDefault();

                mapUpload.classList.remove(
                    "drag-active"
                );


                const file =
                    event.dataTransfer.files[0];


                if (!file) {

                    return;

                }


                readGeoJSONFile(file);

            }
        );

    }

}


/* ==========================================================
   READ GEOJSON FILE
========================================================== */

function readGeoJSONFile(file) {

    const filename =
        file.name.toLowerCase();


    /*
    ----------------------------------------------------------
    Check file type
    ----------------------------------------------------------
    */

    if (
        !filename.endsWith(".geojson") &&
        !filename.endsWith(".json")
    ) {

        showMessage(
            "Please upload a GeoJSON file."
        );

        return;

    }


    showMessage(
        "Reading field boundary..."
    );


    const reader =
        new FileReader();


    reader.onload =
        event => {

            try {

                const geojson =
                    JSON.parse(
                        event.target.result
                    );


                validateGeoJSON(
                    geojson
                );


                loadField(
                    geojson,
                    file.name
                );

            }

            catch (error) {

                console.error(
                    "GeoJSON error:",
                    error
                );


                showMessage(
                    "Invalid GeoJSON file."
                );

            }

        };


    reader.onerror =
        () => {

            showMessage(
                "Unable to read the selected file."
            );

        };


    reader.readAsText(file);

}


/* ==========================================================
   VALIDATE GEOJSON
========================================================== */

function validateGeoJSON(
    geojson
) {

    if (
        !geojson ||
        typeof geojson !== "object"
    ) {

        throw new Error(
            "GeoJSON is not an object."
        );

    }


    const supportedTypes = [

        "Feature",

        "FeatureCollection",

        "Polygon",

        "MultiPolygon"

    ];


    if (
        !supportedTypes.includes(
            geojson.type
        )
    ) {

        throw new Error(
            "Unsupported GeoJSON type."
        );

    }


    /*
    ----------------------------------------------------------
    Feature validation
    ----------------------------------------------------------
    */

    if (
        geojson.type === "Feature"
    ) {

        if (!geojson.geometry) {

            throw new Error(
                "Feature has no geometry."
            );

        }

    }


    /*
    ----------------------------------------------------------
    FeatureCollection validation
    ----------------------------------------------------------
    */

    if (
        geojson.type ===
        "FeatureCollection"
    ) {

        if (
            !Array.isArray(
                geojson.features
            ) ||
            geojson.features.length === 0
        ) {

            throw new Error(
                "FeatureCollection contains no features."
            );

        }

    }

}


/* ==========================================================
   LOAD FIELD
========================================================== */

function loadField(
    geojson,
    filename
) {

    if (!app.map) {

        initializeMap();

    }


    if (!app.map) {

        showMessage(
            "Map is still loading."
        );

        return;

    }


    /*
    ----------------------------------------------------------
    Remove previous field
    ----------------------------------------------------------
    */

    if (app.fieldLayer) {

        app.map.removeLayer(
            app.fieldLayer
        );

        app.fieldLayer =
            null;

    }


    try {

        /*
        ------------------------------------------------------
        Create GeoJSON layer
        ------------------------------------------------------
        */

        app.fieldLayer =
            L.geoJSON(
                geojson,
                {

                    style: {

                        color:
                            "#d9ffb7",

                        weight:
                            3,

                        opacity:
                            1,

                        fillColor:
                            "#86c66b",

                        fillOpacity:
                            0.22

                    },

                    onEachFeature:
                        (feature, layer) => {

                            /*
                            ----------------------------------
                            Optional field popup
                            ----------------------------------
                            */

                            layer.bindTooltip(
                                "FIELD BOUNDARY",
                                {

                                    sticky: true,

                                    direction:
                                        "top"

                                }
                            );

                        }

                }
            );


        /*
        ------------------------------------------------------
        Add field
        ------------------------------------------------------
        */

        app.fieldLayer.addTo(
            app.map
        );


        /*
        ------------------------------------------------------
        Calculate bounds
        ------------------------------------------------------
        */

        const bounds =
            app.fieldLayer.getBounds();


        if (
            !bounds ||
            !bounds.isValid()
        ) {

            throw new Error(
                "Field has invalid bounds."
            );

        }


        /*
        ------------------------------------------------------
        Zoom to field
        ------------------------------------------------------
        */

        app.map.fitBounds(
            bounds,
            {

                padding:
                    [100, 100],

                maxZoom:
                    17

            }
        );


        /*
        ------------------------------------------------------
        Save state
        ------------------------------------------------------
        */

        app.fieldData =
            geojson;


        app.fieldName =
            cleanFilename(
                filename
            );


        app.fieldCenter =
            bounds.getCenter();


        app.fieldAreaAcres =
            calculateGeoJSONArea(
                geojson
            );


        app.fieldPerimeterMiles =
            calculateGeoJSONPerimeter(
                geojson
            );


        app.fieldLoaded =
            true;


        /*
        ------------------------------------------------------
        Update UI
        ------------------------------------------------------
        */

        showFieldInterface();


        /*
        ------------------------------------------------------
        Animate field
        ------------------------------------------------------
        */

        animateFieldBoundary();


        showMessage(
            "Field boundary loaded successfully."
        );

    }

    catch (error) {

        console.error(
            "Field loading error:",
            error
        );


        showMessage(
            "Unable to display field boundary."
        );

    }

}


/* ==========================================================
   CLEAN FIELD NAME
========================================================== */

function cleanFilename(
    filename
) {

    return filename

        .replace(
            /\.(geojson|json)$/i,
            ""
        )

        .replace(
            /[-_]+/g,
            " "
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim()

        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}


/* ==========================================================
   SHOW FIELD INTERFACE
========================================================== */

function showFieldInterface() {

    /*
    ----------------------------------------------------------
    Hide empty state
    ----------------------------------------------------------
    */

    if (emptyState) {

        emptyState.classList.add(
            "hidden"
        );

    }


    /*
    ----------------------------------------------------------
    Hide upload panel
    ----------------------------------------------------------
    */

    if (mapUpload) {

        mapUpload.classList.add(
            "field-loaded"
        );


        setTimeout(
            () => {

                mapUpload.classList.add(
                    "hidden"
                );

            },
            450
        );

    }


    /*
    ----------------------------------------------------------
    Show field information
    ----------------------------------------------------------
    */

    if (fieldState) {

        fieldState.classList.remove(
            "hidden"
        );

    }


    /*
    ----------------------------------------------------------
    Field name
    ----------------------------------------------------------
    */

    if (fieldName) {

        fieldName.textContent =
            app.fieldName;

    }


    /*
    ----------------------------------------------------------
    Field metadata
    ----------------------------------------------------------
    */

    if (fieldMeta) {

        const acres =
            app.fieldAreaAcres || 0;


        const perimeter =
            app.fieldPerimeterMiles || 0;


        const latitude =
            app.fieldCenter.lat;


        const longitude =
            app.fieldCenter.lng;


        const latDirection =
            latitude >= 0
                ? "N"
                : "S";


        const longDirection =
            longitude >= 0
                ? "E"
                : "W";


        fieldMeta.textContent =

            `${acres.toLocaleString(
                undefined,
                {
                    maximumFractionDigits: 2
                }
            )} ACRES · ` +

            `${perimeter.toFixed(
                2
            )} MI PERIMETER · ` +

            `${Math.abs(latitude).toFixed(
                5
            )}° ${latDirection} / ` +

            `${Math.abs(longitude).toFixed(
                5
            )}° ${longDirection}`;

    }


    /*
    ----------------------------------------------------------
    Show analysis controls
    ----------------------------------------------------------
    */

    const panels = [

        analysisPanel,

        layerPanel,

        timeline,

        mapLegend,

        mapControls

    ];


    panels.forEach(
        panel => {

            if (!panel) {
                return;
            }


            panel.classList.remove(
                "hidden"
            );


            panel.classList.add(
                "panel-enter"
            );


            setTimeout(
                () => {

                    panel.classList.remove(
                        "panel-enter"
                    );

                },
                700
            );

        }
    );

}


/* ==========================================================
   CALCULATE GEOJSON AREA
========================================================== */

/*
Returns acres.

Uses a spherical-earth approximation.
*/

function calculateGeoJSONArea(
    geojson
) {

    let totalArea =
        0;


    function polygonArea(
        coordinates
    ) {

        if (
            !Array.isArray(
                coordinates
            )
        ) {

            return 0;

        }


        let area =
            0;


        const earthRadius =
            6378137;


        for (
            const ring
            of coordinates
        ) {

            if (
                !Array.isArray(
                    ring
                ) ||
                ring.length < 3
            ) {

                continue;

            }


            let ringArea =
                0;


            for (
                let i = 0;
                i < ring.length - 1;
                i++
            ) {

                const point1 =
                    ring[i];

                const point2 =
                    ring[i + 1];


                const lon1 =
                    point1[0] *
                    Math.PI / 180;


                const lat1 =
                    point1[1] *
                    Math.PI / 180;


                const lon2 =
                    point2[0] *
                    Math.PI / 180;


                const lat2 =
                    point2[1] *
                    Math.PI / 180;


                ringArea +=

                    (lon2 - lon1) *

                    (
                        2 +
                        Math.sin(lat1) +
                        Math.sin(lat2)
                    );

            }


            ringArea =

                Math.abs(
                    ringArea *
                    earthRadius *
                    earthRadius /
                    2
                );


            area +=
                ringArea;

        }


        return area;

    }


    function processGeometry(
        geometry
    ) {

        if (!geometry) {
            return;
        }


        if (
            geometry.type ===
            "Polygon"
        ) {

            totalArea +=
                polygonArea(
                    geometry.coordinates
                );

        }


        if (
            geometry.type ===
            "MultiPolygon"
        ) {

            geometry.coordinates.forEach(
                polygon => {

                    totalArea +=
                        polygonArea(
                            polygon
                        );

                }
            );

        }

    }


    if (
        geojson.type ===
        "Feature"
    ) {

        processGeometry(
            geojson.geometry
        );

    }


    else if (
        geojson.type ===
        "FeatureCollection"
    ) {

        geojson.features.forEach(
            feature => {

                processGeometry(
                    feature.geometry
                );

            }
        );

    }


    else {

        processGeometry(
            geojson
        );

    }


    /*
    ----------------------------------------------------------
    Convert square meters to acres
    ----------------------------------------------------------
    */

    return totalArea /
        4046.8564224;

}


/* ==========================================================
   CALCULATE GEOJSON PERIMETER
========================================================== */

function calculateGeoJSONPerimeter(
    geojson
) {

    let totalMeters =
        0;


    /*
    ----------------------------------------------------------
    Haversine distance
    ----------------------------------------------------------
    */

    function distance(
        lat1,
        lon1,
        lat2,
        lon2
    ) {

        const earthRadius =
            6371000;


        const dLat =
            (lat2 - lat1) *
            Math.PI / 180;


        const dLon =
            (lon2 - lon1) *
            Math.PI / 180;


        const a =

            Math.sin(
                dLat / 2
            ) ** 2 +

            Math.cos(
                lat1 *
                Math.PI / 180
            ) *

            Math.cos(
                lat2 *
                Math.PI / 180
            ) *

            Math.sin(
                dLon / 2
            ) ** 2;


        return (

            2 *
            earthRadius *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            )

        );

    }


    function ringLength(
        ring
    ) {

        if (
            !Array.isArray(
                ring
            ) ||
            ring.length < 2
        ) {

            return 0;

        }


        let length =
            0;


        for (
            let i = 0;
            i < ring.length - 1;
            i++
        ) {

            const pointA =
                ring[i];

            const pointB =
                ring[i + 1];


            length +=
                distance(
                    pointA[1],
                    pointA[0],
                    pointB[1],
                    pointB[0]
                );

        }


        return length;

    }


    function processGeometry(
        geometry
    ) {

        if (!geometry) {
            return;
        }


        if (
            geometry.type ===
            "Polygon"
        ) {

            geometry.coordinates.forEach(
                ring => {

                    totalMeters +=
                        ringLength(
                            ring
                        );

                }
            );

        }


        if (
            geometry.type ===
            "MultiPolygon"
        ) {

            geometry.coordinates.forEach(
                polygon => {

                    polygon.forEach(
                        ring => {

                            totalMeters +=
                                ringLength(
                                    ring
                                );

                        }
                    );

                }
            );

        }

    }


    if (
        geojson.type ===
        "Feature"
    ) {

        processGeometry(
            geojson.geometry
        );

    }


    else if (
        geojson.type ===
        "FeatureCollection"
    ) {

        geojson.features.forEach(
            feature => {

                processGeometry(
                    feature.geometry
                );

            }
        );

    }


    else {

        processGeometry(
            geojson
        );

    }


    /*
    ----------------------------------------------------------
    Convert meters to miles
    ----------------------------------------------------------
    */

    return totalMeters /
        1609.344;

}


/* ==========================================================
   FIELD BOUNDARY ANIMATION
========================================================== */

function animateFieldBoundary() {

    if (!app.fieldLayer) {
        return;
    }


    /*
    Leaflet SVG paths
    */

    app.fieldLayer.eachLayer(
        layer => {

            const element =
                layer.getElement?.();


            if (element) {

                element.classList.add(
                    "field-boundary-animated"
                );

            }

        }
    );

}


/* ==========================================================
   MAP LAYER CONTROLS
========================================================== */

function initializeControls() {

    /*
    ----------------------------------------------------------
    Reset map
    ----------------------------------------------------------
    */

    if (resetMap) {

        resetMap.addEventListener(
            "click",
            () => {

                if (
                    app.map &&
                    app.fieldLayer
                ) {

                    app.map.fitBounds(
                        app.fieldLayer.getBounds(),
                        {

                            padding:
                                [100, 100],

                            maxZoom:
                                17

                        }
                    );

                }

            }
        );

    }


    /*
    ----------------------------------------------------------
    Layer buttons
    ----------------------------------------------------------
    */

    document
        .querySelectorAll(
            ".layer-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        activateLayer(
                            button.dataset.layer
                        );


                        document
                            .querySelectorAll(
                                ".layer-button"
                            )
                            .forEach(
                                item => {

                                    item.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        button.classList.add(
                            "active"
                        );

                    }
                );

            }
        );


    /*
    ----------------------------------------------------------
    Field scan
    ----------------------------------------------------------
    */

    if (scanButton) {

        scanButton.addEventListener(
            "click",
            runFieldScan
        );

    }

}


/* ==========================================================
   ACTIVATE MAP LAYER
========================================================== */

function activateLayer(
    layerName
) {

    if (!app.map) {
        return;
    }


    /*
    ----------------------------------------------------------
    Keep satellite imagery active for now.
    Actual NDVI / vegetation / water-stress imagery
    will be connected to satellite data later.
    ----------------------------------------------------------
    */

    switch (layerName) {

        case "satellite":

            if (
                app.satelliteLayer &&
                !app.map.hasLayer(
                    app.satelliteLayer
                )
            ) {

                app.satelliteLayer.addTo(
                    app.map
                );

            }

            showMessage(
                "Satellite imagery layer active."
            );

            break;


        case "ndvi":

            showMessage(
                "NDVI layer ready for satellite data."
            );

            break;


        case "vegetation":

            showMessage(
                "Vegetation layer ready for satellite data."
            );

            break;


        case "water":

            showMessage(
                "Water stress layer ready for satellite data."
            );

            break;


        default:

            showMessage(
                "Unknown map layer."
            );

    }

}


/* ==========================================================
   FIELD SCAN
========================================================== */

function runFieldScan() {

    if (!app.fieldLoaded) {

        showMessage(
            "Load a field before scanning."
        );

        return;

    }


    if (!scanButton) {
        return;
    }


    scanButton.disabled =
        true;


    scanButton.innerHTML =
        `
        <span>◈</span>
        SCANNING FIELD...
        `;


    document.body.classList.add(
        "global-scan"
    );


    /*
    ----------------------------------------------------------
    Visual scan only for now.

    This will eventually be replaced by actual satellite
    analysis.
    ----------------------------------------------------------
    */

    setTimeout(
        () => {

            document.body.classList.remove(
                "global-scan"
            );


            scanButton.disabled =
                false;


            scanButton.innerHTML =
                `
                <span>◈</span>
                RUN FIELD SCAN
                `;


            showMessage(
                "Field geometry scan complete."
            );

        },
        2500
    );

}


/* ==========================================================
   NAVIGATION
========================================================== */

function initializeNavigation() {

    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            item => {

                item.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();


                        document
                            .querySelectorAll(
                                ".nav-item"
                            )
                            .forEach(
                                nav => {

                                    nav.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        item.classList.add(
                            "active"
                        );


                        showMessage(
                            `${item.textContent.trim()} selected.`
                        );

                    }
                );

            }
        );

}


/* ==========================================================
   TIMELINE
========================================================== */

function initializeTimeline() {

    const slider =
        document.getElementById(
            "timelineSlider"
        );


    const dateDisplay =
        document.getElementById(
            "timelineDate"
        );


    if (
        !slider ||
        !dateDisplay
    ) {

        return;

    }


    const dates = [

        "APR 2026",

        "MAY 2026",

        "JUN 2026",

        "JUL 2026",

        "AUG 2026"

    ];


    slider.addEventListener(
        "input",
        () => {

            const index =
                Number(
                    slider.value
                );


            dateDisplay.textContent =
                dates[index] ||
                "—";

        }
    );


    dateDisplay.textContent =
        dates[
            Number(slider.value)
        ] || "—";

}


/* ==========================================================
   MESSAGE SYSTEM
========================================================== */

function showMessage(
    message
) {

    if (!appMessage) {
        return;
    }


    appMessage.textContent =
        message;


    appMessage.classList.add(
        "visible"
    );


    clearTimeout(
        showMessage.timeout
    );


    showMessage.timeout =
        setTimeout(
            () => {

                appMessage.classList.remove(
                    "visible"
                );

            },
            3000
        );

}


/* ==========================================================
   WINDOW RESIZE
========================================================== */

window.addEventListener(
    "resize",
    () => {

        if (app.map) {

            setTimeout(
                () => {

                    app.map.invalidateSize();

                },
                100
            );

        }

    }
);
