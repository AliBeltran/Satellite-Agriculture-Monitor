/* ============================================================
   SATELLITE AGRICULTURE MONITOR
   Interactive Application
   ============================================================ */


/* ============================================================
   FIELD DATA
   ============================================================ */

const fields = {

    "North Pivot": {

        location:
            "LARAMIE COUNTY · WYOMING",

        acres:
            127.4,

        health:
            87,

        ndvi:
            0.72,

        uniformity:
            92,

        stress:
            "LOW"

    },

    "South Pasture": {

        location:
            "LARAMIE COUNTY · WYOMING",

        acres:
            83.1,

        health:
            64,

        ndvi:
            0.51,

        uniformity:
            74,

        stress:
            "MODERATE"

    },

    "West Hay Field": {

        location:
            "LARAMIE COUNTY · WYOMING",

        acres:
            241.8,

        health:
            91,

        ndvi:
            0.81,

        uniformity:
            95,

        stress:
            "LOW"

    }

};


/* ============================================================
   DOM ELEMENTS
   ============================================================ */

const introScreen =
    document.getElementById(
        "introScreen"
    );


const mainInterface =
    document.getElementById(
        "mainInterface"
    );


const loadingBar =
    document.getElementById(
        "loadingBar"
    );


const loadingText =
    document.getElementById(
        "loadingText"
    );


const fieldSelect =
    document.getElementById(
        "fieldSelect"
    );


const fieldName =
    document.getElementById(
        "fieldName"
    );


const fieldMeta =
    document.getElementById(
        "fieldMeta"
    );


const healthValue =
    document.getElementById(
        "healthValue"
    );


const ndviValue =
    document.getElementById(
        "ndviValue"
    );


const uniformityValue =
    document.getElementById(
        "uniformityValue"
    );


const stressValue =
    document.getElementById(
        "stressValue"
    );


/* ============================================================
   INTRO SEQUENCE
   ============================================================ */

const loadingMessages = [

    "ESTABLISHING GEOSPATIAL LINK",

    "CONNECTING TO SATELLITE NETWORK",

    "LOADING FIELD DATABASE",

    "INITIALIZING REMOTE SENSING ENGINE",

    "SYSTEM READY"

];


let loadingProgress = 0;

let loadingStep = 0;


const loadingInterval =
    setInterval(
        () => {

            loadingProgress +=
                Math.random() * 10 + 5;


            if (
                loadingProgress >= 100
            ) {

                loadingProgress =
                    100;

                clearInterval(
                    loadingInterval
                );

                loadingText.textContent =
                    "SYSTEM READY";


                setTimeout(
                    launchInterface,
                    700
                );

            }


            loadingBar.style.width =
                `${loadingProgress}%`;


            const messageIndex =
                Math.min(
                    Math.floor(
                        loadingProgress /
                        20
                    ),
                    loadingMessages.length - 1
                );


            if (
                messageIndex !==
                loadingStep
            ) {

                loadingStep =
                    messageIndex;

                loadingText.textContent =
                    loadingMessages[
                        messageIndex
                    ];

            }

        },

        280
    );


/* ============================================================
   LAUNCH INTERFACE
   ============================================================ */

function launchInterface() {

    introScreen.classList.add(
        "hidden"
    );


    mainInterface.classList.add(
        "visible"
    );

}


/* ============================================================
   FIELD UPDATE
   ============================================================ */

function updateField(
    selectedField
) {

    const field =
        fields[selectedField];


    if (!field) {
        return;
    }


    fieldName.textContent =
        selectedField.toUpperCase();


    fieldMeta.textContent =
        `${field.location} · ${field.acres} ACRES`;


    animateNumber(
        healthValue,
        field.health
    );


    animateNumber(
        ndviValue,
        field.ndvi,
        2
    );


    animateNumber(
        uniformityValue,
        field.uniformity,
        0,
        "%"
    );


    stressValue.textContent =
        field.stress;


    updateMapForField(
        selectedField
    );

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

    const duration =
        700;

    const start =
        performance.now();


    function animate(
        currentTime
    ) {

        const progress =
            Math.min(
                (currentTime - start) /
                duration,
                1
            );


        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        const value =
            target * eased;


        element.textContent =
            value.toFixed(
                decimals
            ) + suffix;


        if (
            progress < 1
        ) {

            requestAnimationFrame(
                animate
            );

        }

    }


    requestAnimationFrame(
        animate
    );

}


/* ============================================================
   FIELD SELECTOR
   ============================================================ */

fieldSelect.addEventListener(
    "change",
    () => {

        updateField(
            fieldSelect.value
        );

    }
);


/* ============================================================
   LEAFLET MAP
   ============================================================ */

let map = null;

let fieldLayer = null;


function initializeMap() {

    if (
        typeof L ===
        "undefined"
    ) {

        console.error(
            "Leaflet did not load."
        );

        return;

    }


    map =
        L.map(
            "fieldMap",
            {
                zoomControl:
                    true
            }
        ).setView(
            [
                41.1402,
                -104.8202
            ],
            11
        );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {

            maxZoom:
                19,

            attribution:
                "&copy; OpenStreetMap contributors"

        }
    ).addTo(
        map
    );

}


/* ============================================================
   GEOJSON
   ============================================================ */

function loadGeoJSON(
    geojson
) {

    if (!map) {
        return;
    }


    if (fieldLayer) {

        map.removeLayer(
            fieldLayer
        );

    }


    fieldLayer =
        L.geoJSON(
            geojson,
            {

                style: {

                    color:
                        "#b7d7a9",

                    weight:
                        2,

                    opacity:
                        1,

                    fillColor:
                        "#8dbb83",

                    fillOpacity:
                        0.22

                },


                onEachFeature:
                    (
                        feature,
                        layer
                    ) => {

                        layer.bindPopup(
                            `
                            <strong>
                                FIELD BOUNDARY
                            </strong>
                            `
                        );

                    }

            }
        ).addTo(
            map
        );


    const bounds =
        fieldLayer.getBounds();


    if (
        bounds.isValid()
    ) {

        map.fitBounds(
            bounds,
            {
                padding:
                    [100, 100]
            }
        );

    }


    const upload =
        document.getElementById(
            "mapUpload"
        );


    upload.classList.add(
        "hidden"
    );


    runFieldScan();

}


/* ============================================================
   FILE INPUT
   ============================================================ */

const geojsonInput =
    document.getElementById(
        "geojsonInput"
    );


geojsonInput.addEventListener(
    "change",
    event => {

        const file =
            event.target.files[0];


        if (!file) {
            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            event => {

                try {

                    const geojson =
                        JSON.parse(
                            event.target.result
                        );


                    loadGeoJSON(
                        geojson
                    );

                }

                catch {

                    alert(
                        "Invalid GeoJSON file."
                    );

                }

            };


        reader.readAsText(
            file
        );

    }
);


/* ============================================================
   DRAG AND DROP
   ============================================================ */

const mapUpload =
    document.getElementById(
        "mapUpload"
    );


mapUpload.addEventListener(
    "dragover",
    event => {

        event.preventDefault();

        mapUpload.classList.add(
            "dragging"
        );

    }
);


mapUpload.addEventListener(
    "dragleave",
    () => {

        mapUpload.classList.remove(
            "dragging"
        );

    }
);


mapUpload.addEventListener(
    "drop",
    event => {

        event.preventDefault();

        mapUpload.classList.remove(
            "dragging"
        );


        const file =
            event.dataTransfer.files[0];


        if (!file) {
            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            event => {

                try {

                    loadGeoJSON(
                        JSON.parse(
                            event.target.result
                        )
                    );

                }

                catch {

                    alert(
                        "Invalid GeoJSON file."
                    );

                }

            };


        reader.readAsText(
            file
        );

    }
);


/* ============================================================
   FIELD SCAN
   ============================================================ */

const scanButton =
    document.getElementById(
        "scanButton"
    );


scanButton.addEventListener(
    "click",
    runFieldScan
);


function runFieldScan() {

    if (!fieldLayer) {

        alert(
            "Load a field boundary first."
        );

        return;

    }


    scanButton.textContent =
        "SCANNING FIELD...";


    const mapElement =
        document.getElementById(
            "fieldMap"
        );


    mapElement.classList.add(
        "scanning"
    );


    setTimeout(
        () => {

            mapElement.classList.remove(
                "scanning"
            );


            scanButton.textContent =
                "SCAN COMPLETE";

        },

        1800
    );


    setTimeout(
        () => {

            scanButton.textContent =
                "RUN FIELD SCAN";

        },

        3500
    );

}


/* ============================================================
   MAP LAYERS
   ============================================================ */

const layerButtons =
    document.querySelectorAll(
        ".layer-button"
    );


layerButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                layerButtons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                const layer =
                    button.dataset.layer;


                console.log(
                    `Selected layer: ${layer}`
                );

            }
        );

    }
);


/* ============================================================
   TIMELINE
   ============================================================ */

const timelineSlider =
    document.getElementById(
        "timelineSlider"
    );


const timelineDate =
    document.getElementById(
        "timelineDate"
    );


const dates = [

    "APR 18 2026",

    "MAY 16 2026",

    "JUN 20 2026",

    "JUL 18 2026",

    "AUG 25 2026"

];


timelineSlider.addEventListener(
    "input",
    () => {

        const index =
            Number(
                timelineSlider.value
            );


        timelineDate.textContent =
            dates[index];

    }
);


/* ============================================================
   FIELD MAP UPDATE
   ============================================================ */

function updateMapForField(
    selectedField
) {

    console.log(
        `Loading imagery for ${selectedField}`
    );

}


/* ============================================================
   START APPLICATION
   ============================================================ */

initializeMap();

updateField(
    fieldSelect.value
);
