"use strict";


/*
===========================================================
 SATELLITE AGRICULTURE MONITOR
 Designed by Ali Beltran
===========================================================
*/


/* =====================================================
   ELEMENTS
===================================================== */

const missionScreen =
    document.getElementById(
        "missionScreen"
    );


const agricultureApp =
    document.getElementById(
        "agricultureApp"
    );


const satellite =
    document.getElementById(
        "satellite"
    );


const canvas =
    document.getElementById(
        "spaceCanvas"
    );


const ctx =
    canvas
        ? canvas.getContext("2d")
        : null;


const targetCoordinates =
    document.getElementById(
        "targetCoordinates"
    );


const uploadBox =
    document.getElementById(
        "uploadBox"
    );


const uploadPanel =
    document.getElementById(
        "uploadPanel"
    );


const geojsonInput =
    document.getElementById(
        "geojsonInput"
    );


const fieldWorkspace =
    document.getElementById(
        "fieldWorkspace"
    );


const fieldName =
    document.getElementById(
        "fieldName"
    );


const fieldMeta =
    document.getElementById(
        "fieldMeta"
    );


const areaValue =
    document.getElementById(
        "areaValue"
    );


const perimeterValue =
    document.getElementById(
        "perimeterValue"
    );


const centerValue =
    document.getElementById(
        "centerValue"
    );


const ndviValue =
    document.getElementById(
        "ndviValue"
    );


const stressValue =
    document.getElementById(
        "stressValue"
    );


const scanButton =
    document.getElementById(
        "scanButton"
    );


const infoBubble =
    document.getElementById(
        "infoBubble"
    );


const closeBubble =
    document.getElementById(
        "closeBubble"
    );


const resetMap =
    document.getElementById(
        "resetMap"
    );


/* =====================================================
   STATE
===================================================== */

const state = {

    targetX: 0,

    targetY: 0,

    currentX: 0,

    currentY: 0,

    satelliteOrbitX: 0,

    satelliteOrbitY: 0,

    transitioning: false,

    map: null,

    fieldLayer: null,

    fieldLoaded: false,

    stars: []

};


const reducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


/* =====================================================
   SPACE CANVAS
===================================================== */

function resizeCanvas() {

    if (!canvas || !ctx) {

        return;

    }


    const ratio =
        window.devicePixelRatio || 1;


    canvas.width =
        window.innerWidth *
        ratio;


    canvas.height =
        window.innerHeight *
        ratio;


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


    const amount =
        reducedMotion
            ? 150
            : 450;


    for (
        let i = 0;
        i < amount;
        i++
    ) {

        state.stars.push({

            x:
                Math.random(),

            y:
                Math.random(),

            size:
                .4 +
                Math.random() * 1.4,

            opacity:
                .2 +
                Math.random() * .75,

            depth:
                Math.random()

        });

    }

}


createStars();


/* =====================================================
   SPACE
===================================================== */

function drawSpace() {

    if (!ctx) {

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
    Background
    */

    const background =
        ctx.createRadialGradient(
            width * .68,
            height * .45,
            0,
            width * .68,
            height * .45,
            width
        );


    background.addColorStop(
        0,
        "#1b292d"
    );


    background.addColorStop(
        .4,
        "#0a1113"
    );


    background.addColorStop(
        1,
        "#010203"
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
            star.depth * 22;


        const x =
            star.x *
            width +
            state.targetX *
            parallax;


        const y =
            star.y *
            height +
            state.targetY *
            parallax;


        ctx.fillStyle =
            `rgba(
                220,
                230,
                230,
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
    Earth horizon
    */

    const earthX =
        width * .72;


    const earthY =
        height * 1.15;


    const earthRadius =
        Math.min(
            width,
            height
        ) * .58;


    const earth =
        ctx.createRadialGradient(
            earthX -
                earthRadius * .2,
            earthY -
                earthRadius * .3,
            earthRadius * .1,
            earthX,
            earthY,
            earthRadius
        );


    earth.addColorStop(
        0,
        "#3c5659"
    );


    earth.addColorStop(
        .5,
        "#1a2c30"
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
        earthRadius * .985,
        Math.PI * 1.02,
        Math.PI * 1.95
    );


    ctx.strokeStyle =
        "rgba(165,215,225,.22)";


    ctx.lineWidth = 3;


    ctx.stroke();


}


/* =====================================================
   SATELLITE MOVEMENT
===================================================== */

function updateSatellite() {

    if (
        !satellite ||
        state.transitioning
    ) {

        return;

    }


    /*
    Smooth mouse movement.
    */

    state.currentX +=
        (
            state.targetX -
            state.currentX
        ) * .025;


    state.currentY +=
        (
            state.targetY -
            state.currentY
        ) * .025;


    /*
    Subtle additional orbital
    movement controlled by JS.

    CSS is responsible for the
    large orbital path.
    */


    const mouseInfluenceX =
        state.currentX * 45;


    const mouseInfluenceY =
        state.currentY * 30;


    const rotation =
        state.currentX * 7;


    satellite.style.marginLeft =
        `${mouseInfluenceX}px`;


    satellite.style.marginTop =
        `${mouseInfluenceY}px`;


    satellite.style.transform =
        `
        translate(-50%, -50%)
        rotate(${rotation}deg)
        `;


    /*
    Telemetry coordinates
    */

    if (targetCoordinates) {

        const lat =
            39.8283 +
            state.currentY *
            8;


        const lon =
            -98.5795 +
            state.currentX *
            20;


        targetCoordinates.textContent =
            `${Math.abs(lat).toFixed(3)}° ${
                lat >= 0 ? "N" : "S"
            } / ${
                Math.abs(lon).toFixed(3)
            }° ${
                lon >= 0 ? "E" : "W"
            }`;

    }

}


/* =====================================================
   MAIN ANIMATION LOOP
===================================================== */

function animationLoop() {

    updateSatellite();

    drawSpace();

    requestAnimationFrame(
        animationLoop
    );

}


animationLoop();


/* =====================================================
   MOUSE
===================================================== */

window.addEventListener(
    "pointermove",
    event => {

        state.targetX =
            (
                event.clientX /
                window.innerWidth -
                .5
            ) * 2;


        state.targetY =
            (
                event.clientY /
                window.innerHeight -
                .5
            ) * 2;

    }
);


/* =====================================================
   GALAXY CURSOR
===================================================== */

const cursorCanvas =
    document.createElement(
        "canvas"
    );


cursorCanvas.id =
    "cursorGalaxy";


document.body.appendChild(
    cursorCanvas
);


const cursorContext =
    cursorCanvas.getContext(
        "2d"
    );


const cursorParticles = [];


let cursorX =
    window.innerWidth / 2;


let cursorY =
    window.innerHeight / 2;


let lastCursorX =
    cursorX;


let lastCursorY =
    cursorY;


/* =====================================================
   CURSOR CANVAS SIZE
===================================================== */

function resizeCursorCanvas() {

    const ratio =
        window.devicePixelRatio || 1;


    cursorCanvas.width =
        window.innerWidth *
        ratio;


    cursorCanvas.height =
        window.innerHeight *
        ratio;


    cursorCanvas.style.width =
        `${window.innerWidth}px`;


    cursorCanvas.style.height =
        `${window.innerHeight}px`;


    cursorContext.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );

}


resizeCursorCanvas();


window.addEventListener(
    "resize",
    resizeCursorCanvas
);


/* =====================================================
   CREATE STAR
===================================================== */

function createGalaxyParticle(
    x,
    y,
    velocityX,
    velocityY
) {

    const angle =
        Math.random() *
        Math.PI *
        2;


    const distance =
        2 +
        Math.random() *
        12;


    cursorParticles.push({

        x:
            x +
            Math.cos(angle) *
            distance,


        y:
            y +
            Math.sin(angle) *
            distance,


        vx:
            velocityX *
            .05 +
            (
                Math.random() -
                .5
            ) *
            .35,


        vy:
            velocityY *
            .05 +
            (
                Math.random() -
                .5
            ) *
            .35,


        size:
            .5 +
            Math.random() *
            1.7,


        life:
            1,


        decay:
            .008 +
            Math.random() *
            .025,


        hue:
            190 +
            Math.random() *
            70

    });

}


/* =====================================================
   POINTER STAR TRAIL
===================================================== */

window.addEventListener(
    "pointermove",
    event => {

        cursorX =
            event.clientX;


        cursorY =
            event.clientY;


        const velocityX =
            cursorX -
            lastCursorX;


        const velocityY =
            cursorY -
            lastCursorY;


        const movement =
            Math.sqrt(
                velocityX *
                velocityX +
                velocityY *
                velocityY
            );


        if (
            movement > 1
        ) {

            const amount =
                Math.min(
                    7,
                    Math.floor(
                        movement / 3
                    )
                );


            for (
                let i = 0;
                i < amount;
                i++
            ) {

                createGalaxyParticle(
                    cursorX,
                    cursorY,
                    velocityX,
                    velocityY
                );

            }

        }


        lastCursorX =
            cursorX;


        lastCursorY =
            cursorY;

    }
);


/* =====================================================
   DRAW GALAXY
===================================================== */

function drawCursorGalaxy() {

    cursorContext.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );


    /*
    Small amount of ambient
    dust around cursor.
    */

    if (
        Math.random() < .18
    ) {

        createGalaxyParticle(
            cursorX,
            cursorY,
            0,
            0
        );

    }


    for (
        let i =
            cursorParticles.length - 1;

        i >= 0;

        i--
    ) {

        const particle =
            cursorParticles[i];


        particle.x +=
            particle.vx;


        particle.y +=
            particle.vy;


        particle.vx *=
            .985;


        particle.vy *=
            .985;


        particle.life -=
            particle.decay;


        particle.size *=
            .992;


        if (
            particle.life <= 0
        ) {

            cursorParticles.splice(
                i,
                1
            );

            continue;

        }


        /*
        Glow
        */

        cursorContext.beginPath();


        cursorContext.arc(
            particle.x,
            particle.y,
            particle.size * 3,
            0,
            Math.PI * 2
        );


        cursorContext.fillStyle =
            `hsla(
                ${particle.hue},
                45%,
                78%,
                ${particle.life * .12}
            )`;


        cursorContext.fill();


        /*
        Star
        */

        cursorContext.beginPath();


        cursorContext.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );


        cursorContext.fillStyle =
            `hsla(
                ${particle.hue},
                30%,
                94%,
                ${particle.life}
            )`;


        cursorContext.fill();


        /*
        Star cross
        */

        if (
            particle.size > 1
        ) {

            cursorContext.strokeStyle =
                `rgba(
                    235,
                    242,
                    242,
                    ${particle.life * .35}
                )`;


            cursorContext.lineWidth =
                .5;


            cursorContext.beginPath();


            cursorContext.moveTo(
                particle.x -
                    particle.size * 3,
                particle.y
            );


            cursorContext.lineTo(
                particle.x +
                    particle.size * 3,
                particle.y
            );


            cursorContext.moveTo(
                particle.x,
                particle.y -
                    particle.size * 3
            );


            cursorContext.lineTo(
                particle.x,
                particle.y +
                    particle.size * 3
            );


            cursorContext.stroke();

        }

    }


    requestAnimationFrame(
        drawCursorGalaxy
    );

}


drawCursorGalaxy();


/* =====================================================
   TRANSITION
===================================================== */

function launchToAgriculture() {

    if (
        state.transitioning
    ) {

        return;

    }


    state.transitioning =
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


/* =====================================================
   SCROLL TRANSITION
===================================================== */

window.addEventListener(
    "wheel",
    event => {

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


/* =====================================================
   KEYBOARD TRANSITION
===================================================== */

window.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "ArrowDown" ||
            event.key === "PageDown" ||
            event.key === " "
        ) {

            launchToAgriculture();

        }

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
            300
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


    const worldMap =
        document.getElementById(
            "worldMap"
        );


    state.map =
        L.map(
            worldMap,
            {

                minZoom: 2,

                maxZoom: 19,

                worldCopyJump: true,

                scrollWheelZoom: true,

                dragging: true,

                doubleClickZoom: true,

                touchZoom: true,

                keyboard: true

            }
        );


    /*
    Global Earth.
    */

    state.map.setView(
        [
            20,
            0
        ],
        2
    );


    /*
    Satellite imagery.
    */

    const satelliteImagery =
        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {

                maxZoom: 19,

                attribution:
                    "Satellite imagery © Esri"

            }
        );


    satelliteImagery.addTo(
        state.map
    );


    setTimeout(
        () => {

            state.map.invalidateSize();

        },
        500
    );

}


/* =====================================================
   GEOJSON INPUT
===================================================== */

if (
    geojsonInput
) {

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

}


/* =====================================================
   DRAG / DROP
===================================================== */

if (
    uploadBox
) {

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

}


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

            catch (error) {

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
                            "#e7efeb",

                        weight:
                            3,

                        opacity:
                            .95,

                        fillColor:
                            "#88a796",

                        fillOpacity:
                            .18

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
                "Invalid field boundary."
            );

        }


        state.map.flyToBounds(
            bounds,
            {

                padding:
                    [70,70],

                maxZoom:
                    17,

                duration:
                    2

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
                .trim();


        const formattedName =
            cleanFilename
                ? cleanFilename.replace(
                    /\b\w/g,
                    letter =>
                        letter.toUpperCase()
                )
                : "ACTIVE FIELD";


        fieldName.textContent =
            formattedName;


        fieldMeta.textContent =
            `${area.toFixed(2)} ACRES · ` +
            `${perimeter.toFixed(2)} MI PERIMETER`;


        areaValue.textContent =
            `${area.toFixed(2)} AC`;


        perimeterValue.textContent =
            `${perimeter.toFixed(2)} MI`;


        centerValue.textContent =
            `${center.lat.toFixed(4)}°, ` +
            `${center.lng.toFixed(4)}°`;


        ndviValue.textContent =
            "—";


        stressValue.textContent =
            "—";


        uploadPanel.style.display =
            "none";


        fieldWorkspace.classList.remove(
            "hidden"
        );

    }

    catch (error) {

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

    let area = 0;


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


        let total = 0;


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

        if (!geometry) {

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


/* =====================================================
   PERIMETER
===================================================== */

function calculatePerimeter(
    geojson
) {

    let total = 0;


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

        if (!geometry) {

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
   FIELD SCAN
===================================================== */

if (
    scanButton
) {

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


            setTimeout(
                () => {

                    scanButton.disabled =
                        false;


                    scanButton.textContent =
                        "RUN FIELD ANALYSIS";


                    alert(
                        "Field geometry has been processed. Connect a satellite remote-sensing data source to calculate actual NDVI and crop-stress measurements."
                    );

                },
                1400
            );

        }
    );

}


/* =====================================================
   RESET MAP
===================================================== */

if (
    resetMap
) {

    resetMap.addEventListener(
        "click",
        () => {

            if (
                !state.map
            ) {

                return;

            }


            if (
                state.fieldLayer
            ) {

                state.map.flyToBounds(
                    state.fieldLayer.getBounds(),
                    {

                        padding:
                            [70,70],

                        maxZoom:
                            17,

                        duration:
                            1.2

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
                            1.2

                    }
                );

            }

        }
    );

}


/* =====================================================
   CLOSE INFO
===================================================== */

if (
    closeBubble
) {

    closeBubble.addEventListener(
        "click",
        () => {

            infoBubble.classList.remove(
                "visible"
            );

        }
    );

}
