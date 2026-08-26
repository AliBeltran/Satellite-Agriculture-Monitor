"use strict";

/*
===========================================================
 SATELLITE AGRICULTURE MONITOR
 Interactive Agricultural + Space Landing System
 Designed by Ali Beltran
===========================================================
*/


/* =========================================================
   DOM
========================================================= */

const canvas =
    document.getElementById("agriCanvas");

const ctx =
    canvas.getContext("2d");

const missionScreen =
    document.getElementById("missionScreen");

const startMission =
    document.getElementById("startMission");

const mainInterface =
    document.getElementById("mainInterface");

const geojsonInput =
    document.getElementById("geojsonInput");

const mapUpload =
    document.getElementById("mapUpload");

const fieldState =
    document.getElementById("fieldState");

const fieldName =
    document.getElementById("fieldName");

const fieldMeta =
    document.getElementById("fieldMeta");

const fieldMap =
    document.getElementById("fieldMap");

const scanButton =
    document.getElementById("scanButton");

const appMessage =
    document.getElementById("appMessage");

const timelineSlider =
    document.getElementById("timelineSlider");

const timelineDate =
    document.getElementById("timelineDate");

const liveLatitude =
    document.getElementById("liveLatitude");

const liveLongitude =
    document.getElementById("liveLongitude");


/* =========================================================
   APPLICATION STATE
========================================================= */

const state = {

    map: null,

    fieldLayer: null,

    fieldLoaded: false,

    fieldName: "",

    areaAcres: 0,

    perimeterMiles: 0,

    center: null,

    mouseX: 0.5,

    mouseY: 0.5,

    targetMouseX: 0.5,

    targetMouseY: 0.5,

    time: 0,

    scan: 0,

    stars: [],

    particles: []

};


/* =========================================================
   CANVAS
========================================================= */

function resizeCanvas() {

    const ratio =
        window.devicePixelRatio || 1;

    canvas.width =
        window.innerWidth * ratio;

    canvas.height =
        window.innerHeight * ratio;

    canvas.style.width =
        window.innerWidth + "px";

    canvas.style.height =
        window.innerHeight + "px";

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
   CREATE STARS
========================================================= */

function createStars() {

    state.stars = [];

    for (
        let i = 0;
        i < 650;
        i++
    ) {

        state.stars.push({

            x:
                Math.random(),

            y:
                Math.random(),

            size:
                Math.random() * 1.6,

            depth:
                Math.random(),

            brightness:
                Math.random()

        });

    }

}


createStars();


/* =========================================================
   CREATE PARTICLES
========================================================= */

function createParticles() {

    state.particles = [];

    for (
        let i = 0;
        i < 700;
        i++
    ) {

        state.particles.push({

            x:
                Math.random(),

            y:
                Math.random(),

            size:
                Math.random() * 2,

            speed:
                0.00015 +
                Math.random() * 0.0008,

            phase:
                Math.random() *
                Math.PI * 2

        });

    }

}


createParticles();


/* =========================================================
   MOUSE
========================================================= */

window.addEventListener(
    "pointermove",
    event => {

        state.targetMouseX =
            event.clientX /
            window.innerWidth;

        state.targetMouseY =
            event.clientY /
            window.innerHeight;

    }
);


/* =========================================================
   STARS
========================================================= */

function drawStars() {

    for (
        const star
        of state.stars
    ) {

        const parallax =
            star.depth * 30;

        const x =
            star.x *
            window.innerWidth +
            (
                state.mouseX -
                0.5
            ) *
            parallax;

        const y =
            star.y *
            window.innerHeight +
            (
                state.mouseY -
                0.5
            ) *
            parallax;


        const alpha =
            0.15 +
            star.brightness *
            0.7;


        ctx.fillStyle =
            `rgba(180,255,130,${alpha})`;


        ctx.fillRect(
            x,
            y,
            star.size,
            star.size
        );

    }

}


/* =========================================================
   TERRAIN
========================================================= */

function drawTerrain() {

    const width =
        window.innerWidth;

    const height =
        window.innerHeight;

    const horizon =
        height * 0.40;

    const centerX =
        width * 0.68;


    /*
    Atmospheric glow
    */

    const glow =
        ctx.createRadialGradient(
            centerX,
            height * 0.55,
            0,
            centerX,
            height * 0.55,
            width * 0.7
        );


    glow.addColorStop(
        0,
        "rgba(130,255,35,.20)"
    );


    glow.addColorStop(
        0.5,
        "rgba(20,110,30,.08)"
    );


    glow.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    ctx.fillStyle =
        glow;


    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /*
    Agricultural contour rows
    */

    for (
        let row = 0;
        row < 75;
        row++
    ) {

        const progress =
            row / 75;

        const baseY =
            horizon +
            Math.pow(
                progress,
                1.75
            ) *
            height *
            0.72;


        ctx.beginPath();


        for (
            let step = 0;
            step <= 1;
            step += 0.025
        ) {

            const y =
                horizon +
                step *
                (
                    baseY -
                    horizon
                );


            const wave =
                Math.sin(
                    step * 8 +
                    state.time * 0.0008 +
                    row * 0.2
                ) *
                (
                    15 +
                    progress * 35
                );


            const mouseDistortion =
                (
                    state.mouseX -
                    0.5
                ) *
                80 *
                progress;


            const x =
                centerX +
                (
                    step -
                    0.5
                ) *
                width *
                (
                    0.4 +
                    progress * 1.5
                ) +
                wave +
                mouseDistortion;


            if (
                step === 0
            ) {

                ctx.moveTo(
                    x,
                    y
                );

            }

            else {

                ctx.lineTo(
                    x,
                    y
                );

            }

        }


        const hue =
            80 +
            Math.sin(
                row * 0.4 +
                state.time * 0.0004
            ) *
            25;


        ctx.strokeStyle =
            `hsla(${hue},90%,55%,${0.08 + progress * 0.16})`;


        ctx.lineWidth =
            1;


        ctx.stroke();

    }


    /*
    Field parcels
    */

    for (
        let i = 0;
        i < 130;
        i++
    ) {

        const x =
            width *
            (
                0.38 +
                Math.random() *
                0.6
            );

        const y =
            horizon +
            Math.random() *
            height *
            0.48;


        const w =
            10 +
            Math.random() * 65;

        const h =
            4 +
            Math.random() * 25;


        const health =
            Math.random();


        let color;


        if (
            health > 0.72
        ) {

            color =
                "rgba(160,240,35,.13)";

        }

        else if (
            health > 0.4
        ) {

            color =
                "rgba(230,190,30,.12)";

        }

        else {

            color =
                "rgba(220,55,30,.10)";

        }


        ctx.fillStyle =
            color;


        ctx.fillRect(
            x,
            y,
            w,
            h
        );

    }

}


/* =========================================================
   PARTICLES
========================================================= */

function drawParticles() {

    const width =
        window.innerWidth;

    const height =
        window.innerHeight;


    for (
        const particle
        of state.particles
    ) {

        particle.y -=
            particle.speed;


        if (
            particle.y < 0
        ) {

            particle.y = 1;

        }


        const x =
            particle.x *
            width;


        const y =
            height *
            (
                0.2 +
                particle.y * 0.75
            );


        const wave =
            Math.sin(
                particle.y * 30 +
                state.time * 0.002
            ) *
            20;


        const alpha =
            0.08 +
            Math.sin(
                state.time * 0.002 +
                particle.phase
            ) *
            0.08;


        ctx.fillStyle =
            `rgba(170,255,50,${alpha})`;


        ctx.fillRect(
            x + wave,
            y,
            particle.size,
            particle.size
        );

    }

}


/* =========================================================
   SATELLITE
========================================================= */

function drawSatellite() {

    const width =
        window.innerWidth;

    const height =
        window.innerHeight;


    const orbit =
        state.time * 0.00012;


    const x =
        width *
        (
            0.68 +
            Math.sin(orbit) * 0.22
        );


    const y =
        height *
        (
            0.15 +
            Math.cos(orbit) * 0.055
        );


    ctx.save();

    ctx.translate(
        x,
        y
    );


    ctx.rotate(
        -0.18
    );


    /*
    Solar panels
    */

    ctx.fillStyle =
        "#17382b";

    ctx.strokeStyle =
        "#7fdc53";


    ctx.fillRect(
        -70,
        -5,
        45,
        10
    );


    ctx.strokeRect(
        -70,
        -5,
        45,
        10
    );


    ctx.fillRect(
        25,
        -5,
        45,
        10
    );


    ctx.strokeRect(
        25,
        -5,
        45,
        10
    );


    /*
    Body
    */

    ctx.fillStyle =
        "#cbdac6";


    ctx.fillRect(
        -15,
        -8,
        30,
        16
    );


    /*
    Sensor
    */

    ctx.fillStyle =
        "#a8ff28";


    ctx.beginPath();

    ctx.arc(
        0,
        12,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.restore();


    /*
    Scan beam
    */

    const beam =
        ctx.createLinearGradient(
            x,
            y,
            x - 200,
            height * 0.72
        );


    beam.addColorStop(
        0,
        "rgba(160,255,40,.25)"
    );


    beam.addColorStop(
        1,
        "rgba(160,255,40,0)"
    );


    ctx.fillStyle =
        beam;


    ctx.beginPath();

    ctx.moveTo(
        x - 6,
        y + 12
    );

    ctx.lineTo(
        x - 230,
        height * 0.72
    );

    ctx.lineTo(
        x + 35,
        height * 0.72
    );

    ctx.closePath();

    ctx.fill();

}


/* =========================================================
   SCAN LINE
========================================================= */

function drawScanLine() {

    state.scan += 0.003;


    if (
        state.scan > 1.2
    ) {

        state.scan =
            -0.2;

    }


    const y =
        window.innerHeight *
        state.scan;


    const gradient =
        ctx.createLinearGradient(
            0,
            y - 80,
            0,
            y + 80
        );


    gradient.addColorStop(
        0,
        "rgba(160,255,40,0)"
    );


    gradient.addColorStop(
        0.5,
        "rgba(160,255,40,.10)"
    );


    gradient.addColorStop(
        1,
        "rgba(160,255,40,0)"
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        0,
        y - 80,
        window.innerWidth,
        160
    );


    ctx.fillStyle =
        "rgba(180,255,80,.25)";


    ctx.fillRect(
        0,
        y,
        window.innerWidth,
        1
    );

}


/* =========================================================
   MAIN ANIMATION
========================================================= */

function animate() {

    state.time++;


    state.mouseX +=
        (
            state.targetMouseX -
            state.mouseX
        ) * 0.045;


    state.mouseY +=
        (
            state.targetMouseY -
            state.mouseY
        ) * 0.045;


    ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );


    /*
    Background
    */

    const background =
        ctx.createRadialGradient(
            window.innerWidth * 0.65,
            window.innerHeight * 0.55,
            0,
            window.innerWidth * 0.65,
            window.innerHeight * 0.55,
            window.innerWidth
        );


    background.addColorStop(
        0,
        "#0a1a0b"
    );


    background.addColorStop(
        0.5,
        "#020903"
    );


    background.addColorStop(
        1,
        "#000000"
    );


    ctx.fillStyle =
        background;


    ctx.fillRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );


    drawStars();

    drawTerrain();

    drawParticles();

    drawSatellite();

    drawScanLine();


    requestAnimationFrame(
        animate
    );

}


animate();


/* =========================================================
   TELEMETRY
========================================================= */

setInterval(
    () => {

        const lat =
            37.8062 +
            (
                state.mouseY -
                0.5
            ) *
            1.5;


        const lon =
            96.7911 +
            (
                state.mouseX -
                0.5
            ) *
            3;


        liveLatitude.textContent =
            `${lat.toFixed(4)}° N`;


        liveLongitude.textContent =
            `${lon.toFixed(4)}° W`;

    },
    80
);


/* =========================================================
   ENTER APPLICATION
========================================================= */

startMission.addEventListener(
    "click",
    () => {

        startMission.disabled =
            true;

        missionScreen.classList.add(
            "launching"
        );


        setTimeout(
            () => {

                missionScreen.style.display =
                    "none";

                mainInterface.classList.add(
                    "interface-ready"
                );


                initializeMap();

            },
            900
        );

    }
);


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message
) {

    appMessage.textContent =
        message;

    appMessage.classList.add(
        "visible"
    );


    clearTimeout(
        showMessage.timer
    );


    showMessage.timer =
        setTimeout(
            () => {

                appMessage.classList.remove(
                    "visible"
                );

            },
            3000
        );

}


/* =========================================================
   MAP
========================================================= */

function initializeMap() {

    if (
        state.map ||
        !window.L
    ) {

        return;

    }


    state.map =
        L.map(
            fieldMap,
            {

                zoomControl: true,

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


    L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {

            maxZoom: 19,

            attribution:
                "Tiles © Esri"

        }
    ).addTo(
        state.map
    );


    setTimeout(
        () => {

            state.map.invalidateSize();

        },
        300
    );

}


/* =========================================================
   GEOJSON UPLOAD
========================================================= */

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


/* =========================================================
   DRAG AND DROP
========================================================= */

mapUpload.addEventListener(
    "dragover",
    event => {

        event.preventDefault();

        mapUpload.classList.add(
            "drag-active"
        );

    }
);


mapUpload.addEventListener(
    "dragleave",
    () => {

        mapUpload.classList.remove(
            "drag-active"
        );

    }
);


mapUpload.addEventListener(
    "drop",
    event => {

        event.preventDefault();

        mapUpload.classList.remove(
            "drag-active"
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


/* =========================================================
   READ GEOJSON
========================================================= */

function readGeoJSON(
    file
) {

    const name =
        file.name.toLowerCase();


    if (
        !name.endsWith(".geojson") &&
        !name.endsWith(".json")
    ) {

        showMessage(
            "Please upload a GeoJSON file."
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

                showMessage(
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

        showMessage(
            "Map is not ready yet."
        );

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
                            "#a8ff28",

                        weight:
                            3,

                        opacity:
                            1,

                        fillColor:
                            "#74c947",

                        fillOpacity:
                            .22

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
                "Invalid geometry"
            );

        }


        state.map.fitBounds(
            bounds,
            {

                padding:
                    [80, 80],

                maxZoom:
                    17

            }
        );


        state.fieldLoaded =
            true;


        state.fieldName =
            cleanName(
                filename
            );


        state.areaAcres =
            calculateArea(
                data
            );


        state.perimeterMiles =
            calculatePerimeter(
                data
            );


        state.center =
            bounds.getCenter();


        fieldName.textContent =
            state.fieldName;


        fieldMeta.textContent =
            `${state.areaAcres.toFixed(2)} ACRES · ` +
            `${state.perimeterMiles.toFixed(2)} MI PERIMETER · ` +
            `${state.center.lat.toFixed(5)}° N / ` +
            `${Math.abs(state.center.lng).toFixed(5)}° W`;


        fieldState.classList.remove(
            "hidden"
        );


        document
            .getElementById(
                "uploadPanel"
            )
            .style.display =
            "none";


        showMessage(
            "Field boundary loaded successfully."
        );


    }

    catch (
        error
    ) {

        console.error(
            error
        );

        showMessage(
            "Invalid field geometry."
        );

    }

}


/* =========================================================
   FIELD NAME
========================================================= */

function cleanName(
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


/* =========================================================
   AREA
========================================================= */

function calculateArea(
    geojson
) {

    let area =
        0;


    function polygonArea(
        coordinates
    ) {

        const radius =
            6378137;


        let result =
            0;


        const ring =
            coordinates[0];


        if (
            !ring
        ) {

            return 0;

        }


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


            result +=
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
            result *
            radius *
            radius /
            2
        );

    }


    function geometryArea(
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

                    area +=
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

        geometryArea(
            geojson.geometry
        );

    }

    else if (
        geojson.type ===
        "FeatureCollection"
    ) {

        geojson.features.forEach(
            feature => {

                geometryArea(
                    feature.geometry
                );

            }
        );

    }

    else {

        geometryArea(
            geojson
        );

    }


    return (
        area /
        4046.8564224
    );

}


/* =========================================================
   PERIMETER
========================================================= */

function calculatePerimeter(
    geojson
) {

    let meters =
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
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(dLon / 2) ** 2;


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

            meters +=
                distance(
                    ring[i],
                    ring[i + 1]
                );

        }

    }


    function geometryLength(
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

        geometryLength(
            geojson.geometry
        );

    }

    else if (
        geojson.type ===
        "FeatureCollection"
    ) {

        geojson.features.forEach(
            feature => {

                geometryLength(
                    feature.geometry
                );

            }
        );

    }

    else {

        geometryLength(
            geojson
        );

    }


    return (
        meters /
        1609.344
    );

}


/* =========================================================
   SCAN
========================================================= */

scanButton.addEventListener(
    "click",
    () => {

        if (
            !state.fieldLoaded
        ) {

            showMessage(
                "Upload a field first."
            );

            return;

        }


        scanButton.disabled =
            true;


        scanButton.textContent =
            "◈ SCANNING FIELD...";


        showMessage(
            "Satellite field scan initiated."
        );


        setTimeout(
            () => {

                document
                    .getElementById(
                        "healthValue"
                    )
                    .textContent =
                    "ANALYZING";


                document
                    .getElementById(
                        "ndviValue"
                    )
                    .textContent =
                    "PROCESSING";


            },
            700
        );


        setTimeout(
            () => {

                document
                    .getElementById(
                        "healthValue"
                    )
                    .textContent =
                    "--";


                document
                    .getElementById(
                        "ndviValue"
                    )
                    .textContent =
                    "--";


                scanButton.disabled =
                    false;


                scanButton.textContent =
                    "◈ RUN FIELD SCAN";


                showMessage(
                    "Scan complete. Connect satellite imagery for analysis."
                );

            },
            2500
        );

    }
);


/* =========================================================
   MAP RESET
========================================================= */

document
    .getElementById("resetMap")
    .addEventListener(
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
                            [80, 80],

                        maxZoom:
                            17
                    }
                );

            }

        }
    );


/* =========================================================
   LAYERS
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


                    showMessage(
                        `${button.textContent.trim()} layer selected.`
                    );

                }
            );

        }
    );


/* =========================================================
   TIMELINE
========================================================= */

const timelineDates = [

    "APR 2026",
    "MAY 2026",
    "JUN 2026",
    "JUL 2026",
    "AUG 2026"

];


timelineSlider.addEventListener(
    "input",
    () => {

        timelineDate.textContent =
            timelineDates[
                Number(
                    timelineSlider.value
                )
            ];

    }
);
