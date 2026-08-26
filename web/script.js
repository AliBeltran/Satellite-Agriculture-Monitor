"use strict";

/*
===========================================================
 SATELLITE AGRICULTURE MONITOR
 Professional Earth Observation Interface
 Designed by Ali Beltran
===========================================================
*/

const missionScreen =
    document.getElementById("missionScreen");

const agricultureApp =
    document.getElementById("agricultureApp");

const satellite =
    document.getElementById("satellite");

const spectralBurst =
    document.getElementById("spectralBurst");

const canvas =
    document.getElementById("spaceCanvas");

const ctx =
    canvas.getContext("2d");

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


/* =====================================================
   STATE
===================================================== */

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

    animationFrame: null,

    stars: []

};


/* =====================================================
   REDUCED MOTION
===================================================== */

const reducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


/* =====================================================
   CANVAS
===================================================== */

function resizeCanvas() {

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


/* =====================================================
   STARS
===================================================== */

function createStars() {

    state.stars = [];

    for (
        let i = 0;
        i < 450;
        i++
    ) {

        state.stars.push({

            x: Math.random(),

            y: Math.random(),

            size:
                Math.random() * 1.4,

            opacity:
                .2 +
                Math.random() * .7,

            depth:
                Math.random()

        });

    }

}

createStars();


/* =====================================================
   SPACE BACKGROUND
===================================================== */

function drawSpace() {

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


    const background =
        ctx.createRadialGradient(
            width * .68,
            height * .52,
            0,
            width * .68,
            height * .52,
            width
        );

    background.addColorStop(
        0,
        "#1a2528"
    );

    background.addColorStop(
        .4,
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
                .5
            ) * parallax;


        const y =
            star.y * height +
            (
                state.mouseY -
                .5
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
    Earth limb
    */

    const earthX =
        width * .73;

    const earthY =
        height * 1.12;

    const earthRadius =
        Math.min(
            width,
            height
        ) * .58;


    const earth =
        ctx.createRadialGradient(
            earthX - earthRadius * .2,
            earthY - earthRadius * .3,
            earthRadius * .1,
            earthX,
            earthY,
            earthRadius
        );


    earth.addColorStop(
        0,
        "#33484a"
    );

    earth.addColorStop(
        .55,
        "#182628"
    );

    earth.addColorStop(
        .9,
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
    Atmospheric rim
    */

    ctx.beginPath();

    ctx.arc(
        earthX,
        earthY,
        earthRadius * .99,
        Math.PI * 1.02,
        Math.PI * 1.95
    );


    ctx.strokeStyle =
        "rgba(160,205,210,.2)";

    ctx.lineWidth =
        3;

    ctx.stroke();


    /*
    Orbital guide
    */

    ctx.beginPath();

    ctx.ellipse(
        width * .65,
        height * .48,
        width * .4,
        height * .12,
        -.12,
        0,
        Math.PI * 2
    );


    ctx.strokeStyle =
        "rgba(180,195,195,.12)";

    ctx.lineWidth =
        1;

    ctx.stroke();

}


/* =====================================================
   ANIMATION
===================================================== */

function animate() {

    if (
        !state.transitioning
    ) {

        state.mouseX +=
            (
                state.targetX -
                state.mouseX
            ) * .07;


        state.mouseY +=
            (
                state.targetY -
                state.mouseY
            ) * .07;


        /*
        Move satellite
        */

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
                .5
            ) * 8}deg)
            `;


        /*
        Telemetry coordinate
        */

        const lat =
            39.8283 +
            (
                state.mouseY -
                .5
            ) * 12;


        targetCoordinates.textContent =
            `${lat.toFixed(3)}° N`;


        drawSpace();

    }


    state.animationFrame =
        requestAnimationFrame(
            animate
        );

}

animate();


/* =====================================================
   MOUSE CONTROL
===================================================== */

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


/* =====================================================
   SCROLL TRANSITION
===================================================== */

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


    missionScreen.classList.add(
        "bursting"
    );


    setTimeout(
        () => {

            missionScreen.classList.add(
                "departing"
            );

        },
        450
    );


    setTimeout(
        () => {

            missionScreen.style.display =
                "none";

            agricultureApp.classList.add(
                "visible"
            );


            initializeMap();


            /*
            Information bubble appears
            after the user has entered
            the agriculture interface.
            */

            setTimeout(
                () => {

                    infoBubble.classList.add(
                        "visible"
                    );

                },
                4500
            );

        },
        1050
    );

}


/*
Scroll down or up initiates
the mission transition.
*/

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


/*
Keyboard alternative
*/

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


/* =====================================================
   CLOSE INFO BUBBLE
===================================================== */

closeBubble.addEventListener(
    "click",
    () => {

        infoBubble.classList.remove(
            "visible"
        );

    }
);


/* =====================================================
   MAP
===================================================== */

function initializeMap() {

    if (
        state.map
    ) {

        setTimeout(
            () => {

                state.map.invalidateSize();

            },
            100
        );

        return;

    }


    if (
        typeof L === "undefined"
    ) {

        console.error(
            "Leaflet failed to load."
        );

        return;

    }


    state.map =
        L.map(
            fieldMap,
            {

                zoomControl: true,

                attributionControl: true,

                minZoom: 2,

                maxZoom: 19

            }
        );


    state.map.setView(
        [
            39.8283,
            -98.5795
        ],
        4
    );


    /*
    Actual satellite imagery.
    */

    state.imageryLayer =
        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {

                maxZoom: 19,

                attribution:
                    "Satellite imagery © Esri"

            }
        );


    state.imageryLayer.addTo(
        state.map
    );


    /*
    Reference layer.
    */

    state.referenceLayer =
        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {

                maxZoom: 19,

                opacity: .65,

                attribution:
                    "© OpenStreetMap contributors"

            }
        );


    setTimeout(
        () => {

            state.map.invalidateSize();

        },
        200
    );

}


/* =====================================================
   GEOJSON INPUT
===================================================== */

geojsonInput.addEventListener(
    "change",
    event => {

        const file =
            event.target.files[0];

        if (
            file
        ) {

            readGeoJSON(
                file
            );

        }

    }
);


/* =====================================================
   DRAG / DROP
===================================================== */

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


        if (
            file
        ) {

            readGeoJSON(
                file
            );

        }

    }
);


/* =====================================================
   READ GEOJSON
===================================================== */

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


/* =====================================================
   LOAD FIELD
===================================================== */

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
                            "#e3e8e8",

                        weight:
                            3,

                        opacity:
                            .95,

                        fillColor:
                            "#8fa39b",

                        fillOpacity:
                            .12

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
                "Invalid geometry."
            );

        }


        state.map.fitBounds(
            bounds,
            {
                padding:
                    [60, 60],

                maxZoom:
                    17
            }
        );


        state.fieldLoaded =
            true;


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
                .trim()
                .replace(
                    /\b\w/g,
                    letter =>
                        letter.toUpperCase()
                );


        fieldName.textContent =
            cleanFilename ||
            "ACTIVE FIELD";


        fieldMeta.textContent =
            `${area.toFixed(2)} ACRES · ` +
            `${perimeter.toFixed(2)} MI PERIMETER`;


        areaValue.textContent =
            `${area.toFixed(2)} AC`;


        perimeterValue.textContent =
            `${perimeter.toFixed(2)} MI`;


        centerValue.textContent =
            `${center.lat.toFixed(4)}°, ${center.lng.toFixed(4)}°`;


        uploadPanel.style.display =
            "none";


        fieldWorkspace.classList.remove(
            "hidden"
        );


        setTimeout(
            () => {

                state.map.invalidateSize();

            },
            200
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


/* =====================================================
   AREA CALCULATION
===================================================== */

function calculateArea(
    geojson
) {

    let area =
        0;


    function ringArea(
        ring
    ) {

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

                    area +=
                        ringArea(
                            polygon[0]
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
        area /
        4046.8564224
    );

}


/* =====================================================
   PERIMETER
===================================================== */

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


/* =====================================================
   FIELD ANALYSIS
===================================================== */

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
            "ANALYZING...";


        /*
        Intentionally does not invent
        satellite measurements.
        */

        ndviValue.textContent =
            "PENDING";


        stressValue.textContent =
            "PENDING";


        setTimeout(
            () => {

                scanButton.disabled =
                    false;

                scanButton.textContent =
                    "RUN FIELD ANALYSIS";

                ndviValue.textContent =
                    "—";

                stressValue.textContent =
                    "—";

                alert(
                    "Field geometry has been processed. Connect a satellite imagery or remote-sensing data source to calculate actual NDVI and crop-stress measurements."
                );

            },
            1400
        );

    }
);


/* =====================================================
   RESET MAP
===================================================== */

resetMap.addEventListener(
    "click",
    () => {

        if (
            state.fieldLayer &&
            state.map
        ) {

            state.map.fitBounds(
                state.fieldLayer.getBounds(),
                {
                    padding:
                        [60, 60],

                    maxZoom:
                        17
                }
            );

        }

    }
);


/* =====================================================
   IMAGERY LAYERS
===================================================== */

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
                            state.map.hasLayer(
                                state.imageryLayer
                            )
                        ) {

                            state.map.removeLayer(
                                state.imageryLayer
                            );

                        }


                        if (
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
