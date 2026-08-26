"use strict";

/*
===========================================================
 SATELLITE AGRICULTURE MONITOR
 Open-source agricultural earth observation interface
 Designed by Ali Beltran
===========================================================
*/


/* =========================================================
   STATE
========================================================= */

const state = {

    scene: null,

    camera: null,

    renderer: null,

    earth: null,

    atmosphere: null,

    clouds: null,

    stars: null,

    clock: null,

    map: null,

    analysisMap: null,

    fieldLayer: null,

    fieldLoaded: false,

    mouseX: 0,

    mouseY: 0,

    smoothMouseX: 0,

    smoothMouseY: 0,

    transitioning: false

};


/* =========================================================
   ELEMENTS
========================================================= */

const missionScreen =
    document.getElementById(
        "missionScreen"
    );


const agricultureApp =
    document.getElementById(
        "agricultureApp"
    );


const threeContainer =
    document.getElementById(
        "threeContainer"
    );


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


const analysisMapPreview =
    document.getElementById(
        "analysisMapPreview"
    );


/* =========================================================
   INITIALIZE
========================================================= */

window.addEventListener(
    "load",
    () => {

        initializeEarth();

        initializeInteractions();

        initializeGeoJSON();

        initializeInfoBubble();

        initializeScanButton();

        initializeResetButton();

    }
);


/* =========================================================
   3D EARTH
========================================================= */

function initializeEarth() {

    if (
        typeof THREE ===
        "undefined"
    ) {

        console.error(
            "Three.js failed to load."
        );

        return;

    }


    if (
        !threeContainer
    ) {

        return;

    }


    /* Scene */

    state.scene =
        new THREE.Scene();


    /* Camera */

    state.camera =
        new THREE.PerspectiveCamera(

            38,

            window.innerWidth /
            window.innerHeight,

            0.1,

            1000

        );


    state.camera.position.set(
        0,
        0,
        7
    );


    /* Renderer */

    state.renderer =
        new THREE.WebGLRenderer({

            antialias: true,

            alpha: true,

            powerPreference:
                "high-performance"

        });


    state.renderer.setPixelRatio(

        Math.min(
            window.devicePixelRatio,
            2
        )

    );


    state.renderer.setSize(

        window.innerWidth,

        window.innerHeight

    );


    state.renderer.toneMapping =
        THREE.ACESFilmicToneMapping;


    state.renderer.toneMappingExposure =
        1.15;


    threeContainer.appendChild(
        state.renderer.domElement
    );


    state.clock =
        new THREE.Clock();


    createLighting();

    createStars();

    createEarth();

    createAtmosphere();

    createClouds();


    animateEarth();

}


/* =========================================================
   LIGHTING
========================================================= */

function createLighting() {

    const sun =
        new THREE.DirectionalLight(
            0xffffff,
            4.5
        );


    sun.position.set(
        -5,
        3,
        8
    );


    state.scene.add(
        sun
    );


    const ambient =
        new THREE.AmbientLight(
            0x657b62,
            0.65
        );


    state.scene.add(
        ambient
    );


    const rim =
        new THREE.DirectionalLight(
            0x739a72,
            1.2
        );


    rim.position.set(
        7,
        -3,
        -6
    );


    state.scene.add(
        rim
    );

}


/* =========================================================
   STARS
========================================================= */

function createStars() {

    const count =
        3500;


    const geometry =
        new THREE.BufferGeometry();


    const positions =
        new Float32Array(
            count * 3
        );


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const radius =
            30 +
            Math.random() * 100;


        const theta =
            Math.random() *
            Math.PI *
            2;


        const phi =
            Math.acos(
                2 *
                Math.random() -
                1
            );


        positions[
            i * 3
        ] =
            radius *
            Math.sin(phi) *
            Math.cos(theta);


        positions[
            i * 3 + 1
        ] =
            radius *
            Math.sin(phi) *
            Math.sin(theta);


        positions[
            i * 3 + 2
        ] =
            radius *
            Math.cos(phi);

    }


    geometry.setAttribute(

        "position",

        new THREE.BufferAttribute(
            positions,
            3
        )

    );


    const material =
        new THREE.PointsMaterial({

            color: 0xd7dfd3,

            size: 0.045,

            transparent: true,

            opacity: 0.72,

            sizeAttenuation: true

        });


    state.stars =
        new THREE.Points(
            geometry,
            material
        );


    state.scene.add(
        state.stars
    );

}


/* =========================================================
   EARTH
========================================================= */

function createEarth() {

    const geometry =
        new THREE.SphereGeometry(
            2.65,
            128,
            128
        );


    const loader =
        new THREE.TextureLoader();


    const texture =
        loader.load(

            "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",

            loadedTexture => {

                loadedTexture.colorSpace =
                    THREE.SRGBColorSpace;

            }

        );


    const material =
        new THREE.MeshStandardMaterial({

            map: texture,

            roughness: 0.88,

            metalness: 0.02

        });


    state.earth =
        new THREE.Mesh(
            geometry,
            material
        );


    state.earth.position.set(
        1.25,
        -0.1,
        -0.2
    );


    state.scene.add(
        state.earth
    );

}


/* =========================================================
   ATMOSPHERE
========================================================= */

function createAtmosphere() {

    const geometry =
        new THREE.SphereGeometry(
            2.76,
            96,
            96
        );


    const material =
        new THREE.MeshBasicMaterial({

            color: 0x72a976,

            transparent: true,

            opacity: 0.14,

            side:
                THREE.BackSide

        });


    state.atmosphere =
        new THREE.Mesh(
            geometry,
            material
        );


    state.atmosphere.position.copy(
        state.earth.position
    );


    state.scene.add(
        state.atmosphere
    );


    const outerGeometry =
        new THREE.SphereGeometry(
            2.85,
            96,
            96
        );


    const outerMaterial =
        new THREE.MeshBasicMaterial({

            color: 0xa3c8a0,

            transparent: true,

            opacity: 0.04,

            side:
                THREE.BackSide

        });


    const outer =
        new THREE.Mesh(
            outerGeometry,
            outerMaterial
        );


    outer.position.copy(
        state.earth.position
    );


    state.scene.add(
        outer
    );

}


/* =========================================================
   CLOUDS
========================================================= */

function createClouds() {

    const geometry =
        new THREE.SphereGeometry(
            2.69,
            96,
            96
        );


    const material =
        new THREE.MeshStandardMaterial({

            color: 0xffffff,

            transparent: true,

            opacity: 0.055,

            roughness: 1,

            depthWrite: false

        });


    state.clouds =
        new THREE.Mesh(
            geometry,
            material
        );


    state.clouds.position.copy(
        state.earth.position
    );


    state.scene.add(
        state.clouds
    );

}


/* =========================================================
   EARTH ANIMATION
========================================================= */

function animateEarth() {

    requestAnimationFrame(
        animateEarth
    );


    const time =
        state.clock.getElapsedTime();


    /* Smooth pointer movement */

    state.smoothMouseX +=

        (
            state.mouseX -
            state.smoothMouseX
        ) *
        0.025;


    state.smoothMouseY +=

        (
            state.mouseY -
            state.smoothMouseY
        ) *
        0.025;


    /* Earth */

    if (
        state.earth
    ) {

        state.earth.rotation.y +=
            0.0012;


        state.earth.rotation.x =
            state.smoothMouseY *
            0.035;


        state.earth.rotation.z =
            state.smoothMouseX *
            0.02;

    }


    /* Clouds */

    if (
        state.clouds
    ) {

        state.clouds.rotation.y +=
            0.0015;

    }


    /* Atmosphere */

    if (
        state.atmosphere
    ) {

        const pulse =

            1 +

            Math.sin(
                time * 0.5
            ) *
            0.006;


        state.atmosphere.scale.set(
            pulse,
            pulse,
            pulse
        );

    }


    /* Stars */

    if (
        state.stars
    ) {

        state.stars.rotation.y +=
            0.00002;

    }


    updateCoordinates();


    if (
        state.renderer &&
        state.scene &&
        state.camera
    ) {

        state.renderer.render(
            state.scene,
            state.camera
        );

    }

}


/* =========================================================
   COORDINATES
========================================================= */

function updateCoordinates() {

    if (
        !targetCoordinates
    ) {

        return;

    }


    const latitude =

        38 +

        state.smoothMouseY *
        10;


    const longitude =

        -97 +

        state.smoothMouseX *
        25;


    targetCoordinates.textContent =

        `${Math.abs(latitude).toFixed(3)}° ` +
        `${latitude >= 0 ? "N" : "S"} / ` +
        `${Math.abs(longitude).toFixed(3)}° ` +
        `${longitude >= 0 ? "E" : "W"}`;

}


/* =========================================================
   INTERACTIONS
========================================================= */

function initializeInteractions() {

    /* Pointer controls Earth */

    window.addEventListener(

        "pointermove",

        event => {

            state.mouseX =

                (
                    event.clientX /
                    window.innerWidth -
                    0.5
                ) * 2;


            state.mouseY =

                (
                    event.clientY /
                    window.innerHeight -
                    0.5
                ) * 2;

        }

    );


    /* Resize */

    window.addEventListener(
        "resize",
        resizeThree
    );


    /* Scroll to page 2 */

    window.addEventListener(

        "wheel",

        event => {

            if (
                state.transitioning
            ) {

                return;

            }


            if (
                event.deltaY > 5
            ) {

                launchTransition();

            }

        },

        {
            passive: true
        }

    );


    /* Keyboard */

    window.addEventListener(

        "keydown",

        event => {

            if (
                state.transitioning
            ) {

                return;

            }


            if (

                event.key ===
                "ArrowDown"

                ||

                event.key ===
                "PageDown"

                ||

                event.key ===
                " "

            ) {

                launchTransition();

            }

        }

    );

}


/* =========================================================
   RESIZE
========================================================= */

function resizeThree() {

    if (
        !state.camera ||
        !state.renderer
    ) {

        return;

    }


    state.camera.aspect =

        window.innerWidth /
        window.innerHeight;


    state.camera.updateProjectionMatrix();


    state.renderer.setSize(

        window.innerWidth,

        window.innerHeight

    );

}


/* =========================================================
   PAGE TRANSITION
========================================================= */

function launchTransition() {

    if (
        state.transitioning
    ) {

        return;

    }


    state.transitioning =
        true;


    missionScreen.classList.add(
        "transitioning"
    );


    setTimeout(

        () => {

            missionScreen.style.display =
                "none";


            agricultureApp.classList.add(
                "visible"
            );


            initializeWorldMap();


            setTimeout(

                () => {

                    showInfoBubble();

                },

                3500

            );

        },

        1200

    );

}


/* =========================================================
   WORLD MAP
========================================================= */

function initializeWorldMap() {

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
        typeof L ===
        "undefined"
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


    if (
        !worldMap
    ) {

        return;

    }


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

                zoomControl: true

            }

        );


    state.map.setView(
        [20, 0],
        2
    );


    /* Satellite imagery */

    L.tileLayer(

        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",

        {

            maxZoom: 19,

            attribution:
                "Satellite imagery © Esri"

        }

    ).addTo(
        state.map
    );


    setTimeout(

        () => {

            state.map.invalidateSize();

        },

        500

    );

}


/* =========================================================
   GEOJSON
========================================================= */

function initializeGeoJSON() {

    if (
        !geojsonInput
    ) {

        return;

    }


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


    /* Drag and drop */

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


/* =========================================================
   READ GEOJSON
========================================================= */

function readGeoJSON(
    file
) {

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
                    "Unable to read this GeoJSON file."
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

    initializeWorldMap();


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
                            "#eef6e8",

                        weight:
                            3,

                        opacity:
                            1,

                        fillColor:
                            "#71995e",

                        fillOpacity:
                            0.30

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
                    [80, 80],

                maxZoom:
                    17,

                duration:
                    2

            }

        );


        state.fieldLoaded =
            true;


        /* Geometry */

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


        /* Name */

        let name =

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


        if (
            !name
        ) {

            name =
                "ACTIVE FIELD";

        }


        name =
            name.replace(
                /\b\w/g,
                letter =>
                    letter.toUpperCase()
            );


        /* Interface */

        fieldName.textContent =
            name;


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


        initializeAnalysisMap(
            data,
            bounds
        );

    }

    catch (
        error
    ) {

        console.error(
            error
        );


        alert(
            "This GeoJSON does not contain a valid field boundary."
        );

    }

}


/* =========================================================
   ANALYSIS MAP
========================================================= */

function initializeAnalysisMap(
    data,
    bounds
) {

    if (
        !analysisMapPreview
    ) {

        return;

    }


    if (
        state.analysisMap
    ) {

        state.analysisMap.remove();

    }


    state.analysisMap =

        L.map(

            analysisMapPreview,

            {

                attributionControl:
                    false,

                zoomControl:
                    false

            }

        );


    L.tileLayer(

        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",

        {

            maxZoom: 19

        }

    ).addTo(
        state.analysisMap
    );


    L.geoJSON(

        data,

        {

            style: {

                color:
                    "#f0f6eb",

                weight:
                    3,

                fillColor:
                    "#769b62",

                fillOpacity:
                    0.25

            }

        }

    ).addTo(
        state.analysisMap
    );


    state.analysisMap.fitBounds(

        bounds,

        {

            padding:
                [35, 35]

        }

    );


    setTimeout(

        () => {

            state.analysisMap.invalidateSize();

        },

        300

    );

}


/* =========================================================
   AREA CALCULATION
========================================================= */

function calculateArea(
    geojson
) {

    let totalArea =
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


        const R =
            6378137;


        let area =
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


            area +=

                (lon2 - lon1) *

                (
                    2 +
                    Math.sin(lat1) +
                    Math.sin(lat2)
                );

        }


        return Math.abs(

            area *
            R *
            R /
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

            totalArea +=

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

                    totalArea +=

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

        totalArea /
        4046.8564224

    );

}


/* =========================================================
   PERIMETER
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

                Math.sqrt(
                    1 - value
                )

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
   FIELD SCAN
========================================================= */

function initializeScanButton() {

    if (
        !scanButton
    ) {

        return;

    }


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
                        "◈ RUN FIELD SCAN";


                    alert(

                        "Field geometry processed successfully. Actual NDVI and crop-stress measurements require a connected satellite remote-sensing data source."

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

function initializeResetButton() {

    if (
        !resetMap
    ) {

        return;

    }


    resetMap.addEventListener(

        "click",

        () => {

            if (
                state.analysisMap &&
                state.fieldLayer
            ) {

                state.analysisMap.fitBounds(

                    state.fieldLayer.getBounds()

                );

            }

            else if (
                state.map
            ) {

                state.map.flyTo(

                    [20, 0],

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


/* =========================================================
   INFO BUBBLE
========================================================= */

function initializeInfoBubble() {

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

}


function showInfoBubble() {

    if (
        infoBubble
    ) {

        infoBubble.classList.add(
            "visible"
        );

    }

}
