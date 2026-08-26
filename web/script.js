"use strict";

/*
===========================================================
 SATELLITE AGRICULTURE MONITOR
 Earth Observation Interface
 Designed by Ali Beltran
===========================================================
*/


/* =========================================================
   DOM ELEMENTS
========================================================= */

const missionScreen =
    document.getElementById("missionScreen");

const agricultureApp =
    document.getElementById("agricultureApp");

const satellite =
    document.getElementById("satellite");

const canvas =
    document.getElementById("spaceCanvas");

const ctx =
    canvas ? canvas.getContext("2d") : null;

const spectralBurst =
    document.getElementById("spectralBurst");

const targetCoordinates =
    document.getElementById("targetCoordinates");

const uploadBox =
    document.getElementById("uploadBox");

const uploadPanel =
    document.getElementById("uploadPanel");

const fieldWorkspace =
    document.getElementById("fieldWorkspace");

const geojsonInput =
    document.getElementById("geojsonInput");

const fieldName =
    document.getElementById("fieldName");

const fieldMeta =
    document.getElementById("fieldMeta");

const fieldMap =
    document.getElementById("fieldMap");

const areaValue =
    document.getElementById("areaValue");

const perimeterValue =
    document.getElementById("perimeterValue");

const centerValue =
    document.getElementById("centerValue");

const ndviValue =
    document.getElementById("ndviValue");

const stressValue =
    document.getElementById("stressValue");

const scanButton =
    document.getElementById("scanButton");

const infoBubble =
    document.getElementById("infoBubble");

const closeBubble =
    document.getElementById("closeBubble");

const resetMap =
    document.getElementById("resetMap");

const mapCoordinates =
    document.getElementById("mapCoordinates");


/* =========================================================
   APPLICATION STATE
========================================================= */

const state = {

    mouseX: 0.68,

    mouseY: 0.48,

    targetX: 0.68,

    targetY: 0.48,

    transitioning: false,

    map: null,

    fieldLayer: null,

    imageryLayer: null,

    referenceLayer: null,

    fieldLoaded: false,

    stars: [],

    initialMapReady: false

};


/* =========================================================
   REDUCED MOTION
========================================================= */

const reducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


/* =========================================================
   CANVAS RESIZE
========================================================= */

function resizeCanvas() {

    if (!canvas || !ctx) {
        return;
    }

    const ratio =
        window.devicePixelRatio || 1;

    canvas.width =
        window.innerWidth * ratio;

    canvas.height =
        window.innerHeight * ratio;

    canvas.style.width =
        `${window.innerWidth}px`;

    canvas.style.height =
        `${window.innerHeight}px`;

    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );

}

resizeCanvas();

window.addEventListener(
    "resize",
    resizeCanvas
);


/* =========================================================
   STAR FIELD
========================================================= */

function createStars() {

    state.stars = [];

    const amount =
        reducedMotion ? 180 : 450;

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        state.stars.push({

            x: Math.random(),

            y: Math.random(),

            size:
                Math.random() * 1.4,

            opacity:
                0.2 +
                Math.random() * 0.7,

            depth:
                Math.random()

        });

    }

}

createStars();


/* =========================================================
   SPACE BACKGROUND
========================================================= */

function drawSpace() {

    if (!canvas || !ctx) {
        return;
    }

    const width =
        window.innerWidth;

    const height =
        window.innerHeight;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /*
    Deep-space background
    */

    const background =
        ctx.createRadialGradient(
            width * 0.68,
            height * 0.48,
            0,
            width * 0.68,
            height * 0.48,
            width
        );

    background.addColorStop(
        0,
        "#1a2528"
    );

    background.addColorStop(
        0.4,
        "#0a1113"
    );

    background.addColorStop(
        1,
        "#020405"
    );


    ctx.fillStyle =
        background;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /*
    Stars
    */

    for (
        const star of state.stars
    ) {

        const parallax =
            star.depth * 25;


        const x =
            star.x * width +
            (
                state.mouseX -
                0.5
            ) * parallax;


        const y =
            star.y * height +
            (
                state.mouseY -
                0.5
            ) * parallax;


        ctx.fillStyle =
            `rgba(
                210,
                220,
                220,
                ${star.opacity}
            )`;


        ctx.fillRect(
            x,
            y,
            star.size,
            star.size
        );

    }


    /*
    Earth
    */

    const earthX =
        width * 0.73;

    const earthY =
        height * 1.12;

    const earthRadius =
        Math.min(
            width,
            height
        ) * 0.58;


    const earth =
        ctx.createRadialGradient(
            earthX -
                earthRadius * 0.2,
            earthY -
                earthRadius * 0.3,
            earthRadius * 0.1,
            earthX,
            earthY,
            earthRadius
        );


    earth.addColorStop(
        0,
        "#33484a"
    );

    earth.addColorStop(
        0.55,
        "#182628"
    );

    earth.addColorStop(
        0.9,
        "#071012"
    );

    earth.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    ctx.fillStyle =
        earth;

    ctx.beginPath();

    ctx.arc(
        earthX,
        earthY,
        earthRadius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
    Atmospheric edge
    */

    ctx.beginPath();

    ctx.arc(
        earthX,
        earthY,
        earthRadius * 0.99,
        Math.PI * 1.02,
        Math.PI * 1.95
    );

    ctx.strokeStyle =
        "rgba(160,205,210,.2)";

    ctx.lineWidth = 3;

    ctx.stroke();


    /*
    Orbital guide
    */

    ctx.beginPath();

    ctx.ellipse(
        width * 0.65,
        height * 0.48,
        width * 0.4,
        height * 0.12,
        -0.12,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        "rgba(180,195,195,.12)";

    ctx.lineWidth = 1;

    ctx.stroke();

}


/* =========================================================
   SATELLITE ANIMATION
========================================================= */

function animate() {

    if (
        !state.transitioning
    ) {

        state.mouseX +=
            (
                state.targetX -
                state.mouseX
            ) * 0.07;


        state.mouseY +=
            (
                state.targetY -
                state.mouseY
            ) * 0.07;


        if (satellite) {

            const satelliteX =
                62 +
                state.mouseX * 13;

            const satelliteY =
                30 +
                state.mouseY * 35;


            satellite.style.left =
                `${satelliteX}%`;

            satellite.style.top =
                `${satelliteY}%`;


            satellite.style.transform =
                `
                translate(-50%, -50%)
                rotate(${(
                    state.mouseX -
                    0.5
                ) * 8}deg)
                `;

        }


        /*
        Mission telemetry
        */

        if (targetCoordinates) {

            const lat =
                39.8283 +
                (
                    state.mouseY -
                    0.5
                ) * 12;


            targetCoordinates.textContent =
                `${lat.toFixed(3)}° N`;

        }


        drawSpace();

    }


    requestAnimationFrame(
        animate
    );

}

animate();


/* =========================================================
   MOUSE / POINTER CONTROL
========================================================= */

window.addEventListener(
    "pointermove",
    event => {

        state.targetX =
            event.clientX /
            window.innerWidth;

        state.targetY =
            event.clientY /
            window.innerHeight;

    }
);


/* =========================================================
   MISSION TRANSITION
========================================================= */

let scrollLocked = false;


function launchToAgriculture() {

    if (
        state.transitioning ||
        scrollLocked
    ) {

        return;
    }


    state.transitioning =
        true;

    scrollLocked =
        true;


    /*
    Cosmic burst
    */

    if (missionScreen) {

        missionScreen.classList.add(
            "bursting"
        );

    }


    /*
    Move satellite toward Earth
    */

    if (satellite) {

        satellite.style.transform =
            `
            translate(-50%, -50%)
            scale(1.8)
            rotate(18deg)
            `;

    }


    setTimeout(
        () => {

            if (missionScreen) {

                missionScreen.classList.add(
                    "departing"
                );

            }

        },
        450
    );


    /*
    Enter agriculture application
    */

    setTimeout(
        () => {

            if (missionScreen) {

                missionScreen.style.display =
                    "none";

            }


            if (agricultureApp) {

                agricultureApp.classList.add(
                    "visible"
                );

            }


            /*
            IMPORTANT:
            Initialize the map only AFTER
            the agriculture screen exists.
            */

            setTimeout(
                () => {

                    initializeMap();

                },
                100
            );


            /*
            Open information bubble
            after the user has explored
            the map for several seconds.
            */

            setTimeout(
                () => {

                    if (infoBubble) {

                        infoBubble.classList.add(
                            "visible"
                        );

                    }

                },
                4500
            );

        },
        1050
    );

}


/* =========================================================
   SCROLL TO ENTER
========================================================= */

window.addEventListener(
    "wheel",
    event => {

        if (
            state.transitioning
        ) {

            return;
        }


        if (
            Math.abs(event.deltaY) > 3
        ) {

            launchToAgriculture();

        }

    },
    {
        passive: true
    }
);


/* =========================================================
   KEYBOARD ACCESS
========================================================= */

window.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "ArrowDown" ||
            event.key === "PageDown" ||
            event.key === " "
        ) {

            if (
                !state.transitioning
            ) {

                launchToAgriculture();

            }

        }

    }
);


/* =========================================================
   INFORMATION BUBBLE
========================================================= */

if (closeBubble) {

    closeBubble.addEventListener(
        "click",
        () => {

            infoBubble.classList.remove(
                "visible"
            );

        }
    );

}


/* =========================================================
   GLOBAL WORLD MAP
========================================================= */

function initializeMap() {

    if (
        state.map
    ) {

        setTimeout(
            () => {

                state.map.invalidateSize();

                updateMapTelemetry();

            },
            150
        );

        return;
    }


    if (
        typeof L === "undefined"
    ) {

        console.error(
            "Leaflet did not load."
        );

        return;
    }


    if (
        !fieldMap
    ) {

        console.error(
            "Map container was not found."
        );

        return;
    }


    /*
    Create global map
    */

    state.map =
        L.map(
            fieldMap,
            {

                zoomControl:
                    true,

                attributionControl:
                    true,

                minZoom:
                    2,

                maxZoom:
                    19,

                worldCopyJump:
                    true,

                scrollWheelZoom:
                    true,

                dragging:
                    true,

                doubleClickZoom:
                    true,

                touchZoom:
                    true,

                boxZoom:
                    true,

                keyboard:
                    true

            }
        );


    /*
    GLOBAL VIEW

    This is deliberately NOT Wyoming,
    North Pivot, or any fake field.

    */

    state.map.setView(
        [
            20,
            0
        ],
        2
    );


    /*
    REAL SATELLITE IMAGERY
    */

    state.imageryLayer =
        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {

                maxZoom:
                    19,

                attribution:
                    "Satellite imagery © Esri",

                crossOrigin:
                    true

            }
        );


    state.imageryLayer.addTo(
        state.map
    );


    /*
    REFERENCE MAP
    */

    state.referenceLayer =
        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {

                maxZoom:
                    19,

                attribution:
                    "© OpenStreetMap contributors"

            }
        );


    /*
    MAP EVENTS
    */

    state.map.on(
        "zoomend",
        updateMapTelemetry
    );


    state.map.on(
        "moveend",
        updateMapTelemetry
    );


    state.map.on(
        "mousemove",
        event => {

            updateMapCursor(
                event.latlng
            );

        }
    );


    /*
    Give Leaflet time to calculate
    its dimensions.
    */

    setTimeout(
        () => {

            state.map.invalidateSize();

            updateMapTelemetry();

        },
        300
    );


    state.initialMapReady =
        true;

}


/* =========================================================
   MAP TELEMETRY
========================================================= */

function updateMapTelemetry() {

    if (
        !state.map
    ) {

        return;
    }


    const center =
        state.map.getCenter();


    const zoom =
        state.map.getZoom();


    if (
        mapCoordinates
    ) {

        mapCoordinates.textContent =
            `${center.lat.toFixed(4)}° / ` +
            `${center.lng.toFixed(4)}° · ` +
            `ZOOM ${zoom.toFixed(1)}`;

    }

}


/* =========================================================
   MAP CURSOR
========================================================= */

function updateMapCursor(
    coordinates
) {

    /*
    The map itself remains fully interactive.
    This function simply keeps the
    coordinate display current.
    */

    if (
        !coordinates
    ) {

        return;
    }

}


/* =========================================================
   GEOJSON FILE INPUT
========================================================= */

if (geojsonInput) {

    geojsonInput.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (file) {

                readGeoJSON(
                    file
                );

            }

        }
    );

}


/* =========================================================
   DRAG AND DROP
========================================================= */

if (uploadBox) {

    uploadBox.addEventListener(
        "dragover",
        event => {

            event.preventDefault();

            uploadBox.classList.add(
                "dragging"
            );

        }
    );


    uploadBox.addEventListener(
        "dragleave",
        () => {

            uploadBox.classList.remove(
                "dragging"
            );

        }
    );


    uploadBox.addEventListener(
        "drop",
        event => {

            event.preventDefault();

            uploadBox.classList.remove(
                "dragging"
            );


            const file =
                event.dataTransfer.files[0];


            if (file) {

                readGeoJSON(
                    file
                );

            }

        }
    );

}


/* =========================================================
   READ GEOJSON
========================================================= */

function readGeoJSON(file) {

    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    if (
        extension !== "geojson" &&
        extension !== "json"
    ) {

        alert(
            "Please select a GeoJSON file."
        );

        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        event => {

            try {

                const data =
                    JSON.parse(
                        event.target.result
                    );


                loadField(
                    data,
                    file.name
                );

            }

            catch (
                error
            ) {

                console.error(
                    error
                );

                alert(
                    "The GeoJSON file could not be read."
                );

            }

        };


    reader.readAsText(
        file
    );

}


/* =========================================================
   LOAD FIELD
========================================================= */

function loadField(
    data,
    filename
) {

    initializeMap();


    if (
        !state.map
    ) {

        return;
    }


    /*
    Remove previous boundary
    */

    if (
        state.fieldLayer
    ) {

        state.map.removeLayer(
            state.fieldLayer
        );

    }


    try {

        state.fieldLayer =
            L.geoJSON(
                data,
                {

                    style: {

                        color:
                            "#e4e9e9",

                        weight:
                            3,

                        opacity:
                            0.95,

                        fillColor:
                            "#8fa39b",

                        fillOpacity:
                            0.13

                    },

                    onEachFeature:
                        function(
                            feature,
                            layer
                        ) {

                            layer.on(
                                "mouseover",
                                () => {

                                    layer.setStyle(
                                        {

                                            weight:
                                                4,

                                            fillOpacity:
                                                0.22

                                        }
                                    );

                                }
                            );


                            layer.on(
                                "mouseout",
                                () => {

                                    layer.setStyle(
                                        {

                                            weight:
                                                3,

                                            fillOpacity:
                                                0.13

                                        }
                                    );

                                }
                            );

                        }

                }
            );


        state.fieldLayer.addTo(
            state.map
        );


        const bounds =
            state.fieldLayer.getBounds();


        if (
            !bounds.isValid()
        ) {

            throw new Error(
                "Invalid field geometry."
            );

        }


        /*
        FLY TO THE USER'S FIELD
        */

        state.map.flyToBounds(
            bounds,
            {

                padding:
                    [70, 70],

                maxZoom:
                    17,

                duration:
                    reducedMotion
                        ? 0
                        : 1.8

            }
        );


        state.fieldLoaded =
            true;


        /*
        Calculate field information
        */

        const area =
            calculateArea(
                data
            );


        const perimeter =
            calculatePerimeter(
                data
            );


        const center =
            bounds.getCenter();


        /*
        Generate field name
        from filename.
        */

        const cleanFilename =
            filename
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
                .trim();


        const formattedName =
            cleanFilename
                ? cleanFilename
                    .replace(
                        /\b\w/g,
                        letter =>
                            letter.toUpperCase()
                    )
                : "ACTIVE FIELD";


        /*
        Update interface
        */

        if (fieldName) {

            fieldName.textContent =
                formattedName;

        }


        if (fieldMeta) {

            fieldMeta.textContent =
                `${area.toFixed(2)} ACRES · ` +
                `${perimeter.toFixed(2)} MI PERIMETER`;

        }


        if (areaValue) {

            areaValue.textContent =
                `${area.toFixed(2)} AC`;

        }


        if (perimeterValue) {

            perimeterValue.textContent =
                `${perimeter.toFixed(2)} MI`;

        }


        if (centerValue) {

            centerValue.textContent =
                `${center.lat.toFixed(4)}°, ` +
                `${center.lng.toFixed(4)}°`;

        }


        /*
        No fabricated satellite metrics.
        */

        if (ndviValue) {

            ndviValue.textContent =
                "—";

        }


        if (stressValue) {

            stressValue.textContent =
                "—";

        }


        /*
        Move from world upload state
        to field workspace.
        */

        if (uploadPanel) {

            uploadPanel.style.display =
                "none";

        }


        if (fieldWorkspace) {

            fieldWorkspace.classList.remove(
                "hidden"
            );

        }


        setTimeout(
            () => {

                state.map.invalidateSize();

                updateMapTelemetry();

            },
            250
        );

    }

    catch (
        error
    ) {

        console.error(
            error
        );

        alert(
            "The uploaded GeoJSON does not contain a valid field boundary."
        );

    }

}


/* =========================================================
   AREA CALCULATION
========================================================= */

function calculateArea(
    geojson
) {

    let area =
        0;


    function ringArea(
        ring
    ) {

        if (
            !ring ||
            ring.length < 3
        ) {

            return 0;

        }


        const radius =
            6378137;


        let total =
            0;


        for (
            let i = 0;
            i < ring.length - 1;
            i++
        ) {

            const a =
                ring[i];

            const b =
                ring[i + 1];


            const lon1 =
                a[0] *
                Math.PI /
                180;

            const lat1 =
                a[1] *
                Math.PI /
                180;

            const lon2 =
                b[0] *
                Math.PI /
                180;

            const lat2 =
                b[1] *
                Math.PI /
                180;


            total +=
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


        return Math.abs(
            total *
            radius *
            radius /
            2
        );

    }


    function processGeometry(
        geometry
    ) {

        if (
            !geometry
        ) {

            return;
        }


        if (
            geometry.type ===
            "Polygon"
        ) {

            area +=
                ringArea(
                    geometry.coordinates[0]
                );

        }


        if (
            geometry.type ===
            "MultiPolygon"
        ) {

            geometry.coordinates.forEach(
                polygon => {

                    if (
                        polygon &&
                        polygon[0]
                    ) {

                        area +=
                            ringArea(
                                polygon[0]
                            );

                    }

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


    return (
        area /
        4046.8564224
    );

}


/* =========================================================
   PERIMETER CALCULATION
========================================================= */

function calculatePerimeter(
    geojson
) {

    let total =
        0;


    function distance(
        a,
        b
    ) {

        const R =
            6371000;


        const lat1 =
            a[1] *
            Math.PI /
            180;

        const lat2 =
            b[1] *
            Math.PI /
            180;

        const dLat =
            (
                b[1] -
                a[1]
            ) *
            Math.PI /
            180;

        const dLon =
            (
                b[0] -
                a[0]
            ) *
            Math.PI /
            180;


        const value =
            Math.sin(
                dLat / 2
            ) ** 2 +
            Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(
                dLon / 2
            ) ** 2;


        return (
            2 *
            R *
            Math.atan2(
                Math.sqrt(value),
                Math.sqrt(1 - value)
            )
        );

    }


    function ringLength(
        ring
    ) {

        if (
            !ring ||
            ring.length < 2
        ) {

            return;
        }


        for (
            let i = 0;
            i < ring.length - 1;
            i++
        ) {

            total +=
                distance(
                    ring[i],
                    ring[i + 1]
                );

        }

    }


    function processGeometry(
        geometry
    ) {

        if (
            !geometry
        ) {

            return;
        }


        if (
            geometry.type ===
            "Polygon"
        ) {

            geometry.coordinates.forEach(
                ringLength
            );

        }


        if (
            geometry.type ===
            "MultiPolygon"
        ) {

            geometry.coordinates.forEach(
                polygon => {

                    polygon.forEach(
                        ringLength
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


    return (
        total /
        1609.344
    );

}


/* =========================================================
   FIELD ANALYSIS BUTTON
========================================================= */

if (scanButton) {

    scanButton.addEventListener(
        "click",
        () => {

            if (
                !state.fieldLoaded
            ) {

                return;
            }


            scanButton.disabled =
                true;


            scanButton.textContent =
                "PROCESSING FIELD...";


            if (ndviValue) {

                ndviValue.textContent =
                    "PENDING";

            }


            if (stressValue) {

                stressValue.textContent =
                    "PENDING";

            }


            setTimeout(
                () => {

                    scanButton.disabled =
                        false;

                    scanButton.textContent =
                        "RUN FIELD ANALYSIS";


                    if (ndviValue) {

                        ndviValue.textContent =
                            "—";

                    }


                    if (stressValue) {

                        stressValue.textContent =
                            "—";

                    }


                    alert(
                        "Field geometry has been processed successfully. Connect a satellite remote-sensing data source to calculate actual NDVI and crop-stress measurements."
                    );

                },
                1400
            );

        }
    );

}


/* =========================================================
   RESET MAP
========================================================= */

if (resetMap) {

    resetMap.addEventListener(
        "click",
        () => {

            if (
                !state.map
            ) {

                return;
            }


            /*
            If a field exists,
            return to the field.

            Otherwise return to
            the global world view.
            */

            if (
                state.fieldLayer
            ) {

                state.map.flyToBounds(
                    state.fieldLayer.getBounds(),
                    {

                        padding:
                            [70, 70],

                        maxZoom:
                            17,

                        duration:
                            reducedMotion
                                ? 0
                                : 1.2

                    }
                );

            }

            else {

                state.map.flyTo(
                    [
                        20,
                        0
                    ],
                    2,
                    {

                        duration:
                            reducedMotion
                                ? 0
                                : 1.2

                    }
                );

            }

        }
    );

}


/* =========================================================
   MAP LAYER SWITCHING
========================================================= */

document
    .querySelectorAll(
        ".layer-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

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


                    const layer =
                        button.dataset.layer;


                    if (
                        !state.map
                    ) {

                        return;
                    }


                    if (
                        layer ===
                        "satellite"
                    ) {

                        if (
                            state.referenceLayer &&
                            state.map.hasLayer(
                                state.referenceLayer
                            )
                        ) {

                            state.map.removeLayer(
                                state.referenceLayer
                            );

                        }


                        if (
                            state.imageryLayer &&
                            !state.map.hasLayer(
                                state.imageryLayer
                            )
                        ) {

                            state.imageryLayer.addTo(
                                state.map
                            );

                        }

                    }


                    if (
                        layer ===
                        "street"
                    ) {

                        if (
                            state.imageryLayer &&
                            state.map.hasLayer(
                                state.imageryLayer
                            )
                        ) {

                            state.map.removeLayer(
                                state.imageryLayer
                            );

                        }


                        if (
                            state.referenceLayer &&
                            !state.map.hasLayer(
                                state.referenceLayer
                            )
                        ) {

                            state.referenceLayer.addTo(
                                state.map
                            );

                        }

                    }

                }
            );

        }
    );


/* =========================================================
   INITIAL DRAW
========================================================= */

drawSpace();
