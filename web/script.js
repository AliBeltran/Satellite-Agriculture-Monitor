/* ==========================================================
   SATELLITE AGRICULTURE MONITOR
   Designed by Ali Beltran
   ========================================================== */

"use strict";


/* ==========================================================
   APPLICATION STATE
   ========================================================== */

const AppState = {

    map: null,

    fieldLayer: null,

    fieldData: null,

    fieldLoaded: false,

    scanRunning: false,

    baseLayer: null,

    satelliteLayer: null

};


/* ==========================================================
   DOM
   ========================================================== */

const elements = {

    introScreen: document.getElementById("introScreen"),

    loadingBar: document.getElementById("loadingBar"),

    loadingText: document.getElementById("loadingText"),

    mainInterface: document.getElementById("mainInterface"),

    emptyState: document.getElementById("emptyState"),

    fieldState: document.getElementById("fieldState"),

    fieldName: document.getElementById("fieldName"),

    fieldMeta: document.getElementById("fieldMeta"),

    mapUpload: document.getElementById("mapUpload"),

    geojsonInput: document.getElementById("geojsonInput"),

    analysisPanel: document.getElementById("analysisPanel"),

    layerPanel: document.getElementById("layerPanel"),

    timeline: document.getElementById("timeline"),

    mapLegend: document.getElementById("mapLegend"),

    mapControls: document.getElementById("mapControls"),

    resetMap: document.getElementById("resetMap"),

    scanButton: document.getElementById("scanButton"),

    appMessage: document.getElementById("appMessage"),

    healthValue: document.getElementById("healthValue"),

    ndviValue: document.getElementById("ndviValue"),

    uniformityValue: document.getElementById("uniformityValue"),

    stressValue: document.getElementById("stressValue"),

    timelineSlider: document.getElementById("timelineSlider"),

    timelineDate: document.getElementById("timelineDate")

};


/* ==========================================================
   INITIALIZATION
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeIntro();

    initializeUpload();

    initializeNavigation();

    initializeMapControls();

    initializeTimeline();

});


/* ==========================================================
   INTRO ANIMATION
   ========================================================== */

function initializeIntro() {

    let progress = 0;

    const messages = [

        "ESTABLISHING GEOSPATIAL LINK",

        "LOADING EARTH OBSERVATION SYSTEM",

        "INITIALIZING FIELD ENGINE",

        "READY"

    ];

    const interval = setInterval(() => {

        progress += 4;

        if (elements.loadingBar) {

            elements.loadingBar.style.width =
                `${Math.min(progress, 100)}%`;

        }

        if (elements.loadingText) {

            const index = Math.min(
                Math.floor(progress / 30),
                messages.length - 1
            );

            elements.loadingText.textContent =
                messages[index];

        }

        if (progress >= 100) {

            clearInterval(interval);

            setTimeout(() => {

                if (elements.introScreen) {

                    elements.introScreen.classList.add("intro-complete");

                }

                if (elements.mainInterface) {

                    elements.mainInterface.classList.add("interface-ready");

                }

                initializeMap();

            }, 500);

        }

    }, 45);

}


/* ==========================================================
   MAP
   ========================================================== */

function initializeMap() {

    if (!window.L) {

        showMessage("Mapping engine unavailable.");

        return;

    }

    const mapElement =
        document.getElementById("fieldMap");

    if (!mapElement) {

        return;

    }


    AppState.map = L.map(mapElement, {

        zoomControl: false,

        attributionControl: true,

        minZoom: 3,

        maxZoom: 20,

        worldCopyJump: true

    }).setView([39.8283, -98.5795], 4);


    AppState.baseLayer = L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            maxZoom: 19,

            attribution:
                '&copy; OpenStreetMap contributors'

        }

    );


    AppState.baseLayer.addTo(AppState.map);


    L.control.zoom({

        position: "bottomright"

    }).addTo(AppState.map);


    addMapAtmosphere();

}


/* ==========================================================
   MAP ATMOSPHERE
   ========================================================== */

function addMapAtmosphere() {

    const mapElement =
        document.getElementById("fieldMap");

    if (!mapElement) return;


    const atmosphere =
        document.createElement("div");

    atmosphere.className =
        "map-particle-field";


    for (let i = 0; i < 28; i++) {

        const particle =
            document.createElement("span");

        particle.className =
            "map-particle";

        particle.style.left =
            `${Math.random() * 100}%`;

        particle.style.top =
            `${Math.random() * 100}%`;

        particle.style.animationDelay =
            `${Math.random() * 8}s`;

        particle.style.animationDuration =
            `${7 + Math.random() * 8}s`;

        atmosphere.appendChild(particle);

    }


    mapElement.parentElement.appendChild(atmosphere);

}


/* ==========================================================
   GEOJSON UPLOAD
   ========================================================== */

function initializeUpload() {

    if (!elements.geojsonInput) return;


    elements.geojsonInput.addEventListener(
        "change",
        handleGeoJSONUpload
    );


    const uploadArea =
        elements.mapUpload;


    if (!uploadArea) return;


    uploadArea.addEventListener(
        "dragover",
        event => {

            event.preventDefault();

            uploadArea.classList.add("drag-active");

        }
    );


    uploadArea.addEventListener(
        "dragleave",
        () => {

            uploadArea.classList.remove("drag-active");

        }
    );


    uploadArea.addEventListener(
        "drop",
        event => {

            event.preventDefault();

            uploadArea.classList.remove("drag-active");

            const files =
                event.dataTransfer.files;

            if (!files.length) return;

            processGeoJSONFile(files[0]);

        }
    );

}


/* ==========================================================
   FILE HANDLER
   ========================================================== */

function handleGeoJSONUpload(event) {

    const file =
        event.target.files[0];

    if (!file) return;

    processGeoJSONFile(file);

}


/* ==========================================================
   GEOJSON PROCESSOR
   ========================================================== */

function processGeoJSONFile(file) {

    const validTypes = [

        "application/geo+json",

        "application/json",

        ""

    ];


    const isGeoJSON =
        file.name.toLowerCase().endsWith(".geojson") ||
        file.name.toLowerCase().endsWith(".json");


    if (!isGeoJSON && !validTypes.includes(file.type)) {

        showMessage(
            "Please upload a GeoJSON or JSON field boundary."
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload = event => {

        try {

            const geojson =
                JSON.parse(event.target.result);

            loadField(geojson, file.name);

        }

        catch (error) {

            console.error(error);

            showMessage(
                "The selected file could not be read as valid GeoJSON."
            );

        }

    };


    reader.onerror = () => {

        showMessage(
            "Unable to read the selected file."
        );

    };


    reader.readAsText(file);

}


/* ==========================================================
   LOAD FIELD
   ========================================================== */

function loadField(geojson, filename) {

    if (!AppState.map) {

        showMessage(
            "Map engine is still initializing."
        );

        return;

    }


    if (AppState.fieldLayer) {

        AppState.map.removeLayer(
            AppState.fieldLayer
        );

    }


    try {

        AppState.fieldLayer =
            L.geoJSON(

                geojson,

                {

                    style: {

                        color: "#b8e986",

                        weight: 3,

                        opacity: 1,

                        fillColor: "#8fcf72",

                        fillOpacity: 0.18,

                        className:
                            "field-boundary-glow"

                    }

                }

            ).addTo(AppState.map);


        const bounds =
            AppState.fieldLayer.getBounds();


        if (bounds.isValid()) {

            AppState.map.fitBounds(

                bounds,

                {

                    padding: [120, 120],

                    maxZoom: 16

                }

            );

        }


        AppState.fieldData =
            geojson;

        AppState.fieldLoaded =
            true;


        const fieldName =
            cleanFieldName(filename);


        activateFieldInterface(
            fieldName,
            bounds
        );


        createFieldPulse();


        showMessage(
            "Field boundary loaded successfully."
        );


    }

    catch (error) {

        console.error(error);

        showMessage(
            "Unable to display this field boundary."
        );

    }

}


/* ==========================================================
   FIELD NAME
   ========================================================== */

function cleanFieldName(filename) {

    return filename
        .replace(/\.(geojson|json)$/i, "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );

}


/* ==========================================================
   ACTIVATE FIELD INTERFACE
   ========================================================== */

function activateFieldInterface(
    fieldName,
    bounds
) {

    if (elements.emptyState) {

        elements.emptyState.classList.add(
            "hidden"
        );

    }


    if (elements.fieldState) {

        elements.fieldState.classList.remove(
            "hidden"
        );

    }


    if (elements.fieldName) {

        elements.fieldName.textContent =
            fieldName;

    }


    if (elements.fieldMeta) {

        elements.fieldMeta.textContent =
            "FIELD BOUNDARY LOADED · READY FOR ANALYSIS";

    }


    const panels = [

        elements.analysisPanel,

        elements.layerPanel,

        elements.timeline,

        elements.mapLegend,

        elements.mapControls

    ];


    panels.forEach(panel => {

        if (panel) {

            panel.classList.remove(
                "hidden"
            );

            panel.classList.add(
                "panel-enter"
            );

        }

    });


    setTimeout(() => {

        panels.forEach(panel => {

            if (panel) {

                panel.classList.remove(
                    "panel-enter"
                );

            }

        });

    }, 900);


    updateFieldMetrics(false);

}


/* ==========================================================
   FIELD PULSE
   ========================================================== */

function createFieldPulse() {

    if (!AppState.fieldLayer) return;


    AppState.fieldLayer.eachLayer(
        layer => {

            const element =
                layer.getElement &&
                layer.getElement();


            if (element) {

                element.classList.add(
                    "field-boundary-animated"
                );

            }

        }
    );

}


/* ==========================================================
   ANALYSIS
   ========================================================== */

function updateFieldMetrics(scanned) {

    if (!elements.healthValue) return;


    if (!scanned) {

        elements.healthValue.textContent =
            "READY";

        elements.ndviValue.textContent =
            "—";

        elements.uniformityValue.textContent =
            "—";

        elements.stressValue.textContent =
            "READY";

        return;

    }


    elements.healthValue.textContent =
        "87";


    elements.ndviValue.textContent =
        "0.72";


    elements.uniformityValue.textContent =
        "92%";


    elements.stressValue.textContent =
        "LOW";

}


/* ==========================================================
   SCAN BUTTON
   ========================================================== */

function initializeMapControls() {

    if (elements.scanButton) {

        elements.scanButton.addEventListener(
            "click",
            runFieldScan
        );

    }


    if (elements.resetMap) {

        elements.resetMap.addEventListener(
            "click",
            resetMap
        );

    }


    document
        .querySelectorAll(".layer-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".layer-button"
                        )
                        .forEach(item =>
                            item.classList.remove(
                                "active"
                            )
                        );


                    button.classList.add(
                        "active"
                    );


                    switchLayer(
                        button.dataset.layer
                    );

                }
            );

        });

}


/* ==========================================================
   FIELD SCAN
   ========================================================== */

function runFieldScan() {

    if (!AppState.fieldLoaded) {

        showMessage(
            "Upload a field boundary first."
        );

        return;

    }


    if (AppState.scanRunning) return;


    AppState.scanRunning =
        true;


    if (elements.scanButton) {

        elements.scanButton.disabled =
            true;

        elements.scanButton.innerHTML =
            "<span>◈</span> SCANNING FIELD...";

    }


    document.body.classList.add(
        "global-scan"
    );


    let progress = 0;


    const interval =
        setInterval(() => {

            progress += 5;


            if (progress >= 100) {

                clearInterval(interval);


                AppState.scanRunning =
                    false;


                document.body.classList.remove(
                    "global-scan"
                );


                updateFieldMetrics(true);


                if (elements.scanButton) {

                    elements.scanButton.disabled =
                        false;

                    elements.scanButton.innerHTML =
                        "<span>◈</span> RUN FIELD SCAN";

                }


                showMessage(
                    "Field scan complete."
                );

            }

        }, 70);

}


/* ==========================================================
   LAYER SWITCHING
   ========================================================== */

function switchLayer(layer) {

    if (!AppState.map) return;


    if (layer === "satellite") {

        if (AppState.satelliteLayer) {

            AppState.map.removeLayer(
                AppState.satelliteLayer
            );

        }


        showMessage(
            "Satellite basemap selected."
        );

        return;

    }


    if (layer === "ndvi") {

        showMessage(
            "NDVI visualization selected."
        );

        return;

    }


    if (layer === "vegetation") {

        showMessage(
            "Vegetation layer selected."
        );

        return;

    }


    if (layer === "water") {

        showMessage(
            "Water stress layer selected."
        );

    }

}


/* ==========================================================
   RESET
   ========================================================== */

function resetMap() {

    if (!AppState.map) return;


    if (AppState.fieldLayer) {

        const bounds =
            AppState.fieldLayer.getBounds();


        if (bounds.isValid()) {

            AppState.map.fitBounds(
                bounds,
                {
                    padding: [120, 120]
                }
            );

        }

    }

}


/* ==========================================================
   TIMELINE
   ========================================================== */

function initializeTimeline() {

    if (!elements.timelineSlider) return;


    const dates = [

        "APR 18 2026",

        "MAY 09 2026",

        "JUN 02 2026",

        "JUL 11 2026",

        "AUG 25 2026"

    ];


    updateTimeline(
        dates,
        elements.timelineSlider.value
    );


    elements.timelineSlider.addEventListener(
        "input",
        event => {

            updateTimeline(
                dates,
                event.target.value
            );

        }
    );

}


function updateTimeline(
    dates,
    index
) {

    if (!elements.timelineDate) return;


    elements.timelineDate.textContent =
        dates[index] || "—";

}


/* ==========================================================
   NAVIGATION
   ========================================================== */

function initializeNavigation() {

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    document
                        .querySelectorAll(
                            ".nav-item"
                        )
                        .forEach(nav =>
                            nav.classList.remove(
                                "active"
                            )
                        );


                    item.classList.add(
                        "active"
                    );


                    showMessage(
                        `${item.textContent.trim()} view selected.`
                    );

                }
            );

        });

}


/* ==========================================================
   MESSAGE
   ========================================================== */

function showMessage(message) {

    if (!elements.appMessage) return;


    elements.appMessage.textContent =
        message;


    elements.appMessage.classList.add(
        "visible"
    );


    clearTimeout(
        showMessage.timeout
    );


    showMessage.timeout =
        setTimeout(() => {

            elements.appMessage.classList.remove(
                "visible"
            );

        }, 3000);

}
