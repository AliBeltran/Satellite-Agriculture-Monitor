"use strict";

/*
===========================================================
 SATELLITE AGRICULTURE MONITOR
 Procedural 3D Earth Observation Satellite
 Designed by Ali Beltran
===========================================================
*/

const missionScreen = document.getElementById("missionScreen");
const agricultureApp = document.getElementById("agricultureApp");
const threeContainer = document.getElementById("threeContainer");
const targetCoordinates = document.getElementById("targetCoordinates");

const cursorGalaxy = document.getElementById("cursorGalaxy");

const uploadBox = document.getElementById("uploadBox");
const uploadPanel = document.getElementById("uploadPanel");
const geojsonInput = document.getElementById("geojsonInput");

const fieldWorkspace = document.getElementById("fieldWorkspace");
const fieldName = document.getElementById("fieldName");
const fieldMeta = document.getElementById("fieldMeta");

const areaValue = document.getElementById("areaValue");
const perimeterValue = document.getElementById("perimeterValue");
const centerValue = document.getElementById("centerValue");
const ndviValue = document.getElementById("ndviValue");
const stressValue = document.getElementById("stressValue");

const scanButton = document.getElementById("scanButton");
const infoBubble = document.getElementById("infoBubble");
const closeBubble = document.getElementById("closeBubble");
const resetMap = document.getElementById("resetMap");
const analysisMapPreview =
    document.getElementById("analysisMapPreview");

const state = {
    scene: null,
    camera: null,
    renderer: null,
    satellite: null,
    clock: null,

    mouseX: 0,
    mouseY: 0,
    smoothMouseX: 0,
    smoothMouseY: 0,

    transitioning: false,

    map: null,
    analysisMap: null,
    fieldLayer: null,
    fieldLoaded: false
};


/* =========================================================
   REMOVE GALAXY CURSOR
========================================================= */

if (cursorGalaxy) {
    cursorGalaxy.remove();
}


/* =========================================================
   THREE.JS INITIALIZATION
========================================================= */

window.addEventListener("load", () => {

    if (typeof THREE === "undefined") {
        console.error("Three.js failed to load.");
        return;
    }

    initializeThree();

});


function initializeThree() {

    state.scene = new THREE.Scene();

    state.camera = new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
    );

    state.camera.position.set(
        0,
        1.2,
        14
    );


    state.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });

    state.renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    state.renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    state.renderer.outputColorSpace =
        THREE.SRGBColorSpace;

    state.renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    state.renderer.toneMappingExposure = 1.15;

    threeContainer.appendChild(
        state.renderer.domElement
    );


    state.clock = new THREE.Clock();


    createLighting();
    createStars();
    createEarth();
    createSatellite();

    animate();

}


/* =========================================================
   LIGHTING
========================================================= */

function createLighting() {

    const sun = new THREE.DirectionalLight(
        0xffffff,
        5
    );

    sun.position.set(
        -8,
        8,
        12
    );

    state.scene.add(sun);


    const blueFill = new THREE.DirectionalLight(
        0x7d9cb2,
        1.5
    );

    blueFill.position.set(
        8,
        1,
        -8
    );

    state.scene.add(blueFill);


    const softLight = new THREE.HemisphereLight(
        0xdce7e7,
        0x111719,
        1
    );

    state.scene.add(softLight);

}


/* =========================================================
   STAR FIELD
========================================================= */

function createStars() {

    const count = 3500;

    const geometry =
        new THREE.BufferGeometry();

    const positions =
        new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {

        const radius =
            65 + Math.random() * 140;

        const theta =
            Math.random() * Math.PI * 2;

        const phi =
            Math.acos(
                2 * Math.random() - 1
            );

        positions[i * 3] =
            radius *
            Math.sin(phi) *
            Math.cos(theta);

        positions[i * 3 + 1] =
            radius *
            Math.sin(phi) *
            Math.sin(theta);

        positions[i * 3 + 2] =
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
            color: 0xd8e3e5,
            size: 0.055,
            transparent: true,
            opacity: 0.75,
            sizeAttenuation: true
        });

    const stars =
        new THREE.Points(
            geometry,
            material
        );

    state.scene.add(stars);
}


/* =========================================================
   EARTH
========================================================= */

function createEarth() {

    const earthGeometry =
        new THREE.SphereGeometry(
            8,
            64,
            64
        );

    const earthMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x1d3e45,
            roughness: 1,
            metalness: 0
        });

    const earth =
        new THREE.Mesh(
            earthGeometry,
            earthMaterial
        );

    earth.position.set(
        7,
        -8,
        -23
    );

    earth.scale.set(
        1.45,
        1.45,
        1.45
    );

    state.scene.add(earth);


    const atmosphereGeometry =
        new THREE.SphereGeometry(
            8.12,
            64,
            64
        );

    const atmosphereMaterial =
        new THREE.MeshBasicMaterial({
            color: 0x65b5ca,
            transparent: true,
            opacity: 0.13,
            side: THREE.BackSide
        });

    const atmosphere =
        new THREE.Mesh(
            atmosphereGeometry,
            atmosphereMaterial
        );

    atmosphere.position.copy(
        earth.position
    );

    atmosphere.scale.copy(
        earth.scale
    );

    state.scene.add(atmosphere);

}


/* =========================================================
   SATELLITE
========================================================= */

function createSatellite() {

    const satellite =
        new THREE.Group();

    state.satellite =
        satellite;

    state.scene.add(
        satellite
    );


    /*
    Main bus
    */

    createMainBus(
        satellite
    );


    /*
    Solar wings
    */

    createSolarWing(
        satellite,
        -1
    );

    createSolarWing(
        satellite,
        1
    );


    /*
    Sensor
    */

    createEarthObservationSensor(
        satellite
    );


    /*
    Communication antenna
    */

    createCommunicationDish(
        satellite
    );


    /*
    High gain antenna
    */

    createHighGainAntenna(
        satellite
    );


    /*
    Star tracker
    */

    createStarTrackers(
        satellite
    );


    /*
    Thermal blankets
    */

    createThermalBlankets(
        satellite
    );


    /*
    Structural hardware
    */

    createStructuralHardware(
        satellite
    );


    satellite.position.set(
        0,
        1,
        0
    );

    satellite.scale.set(
        1.35,
        1.35,
        1.35
    );

}


/* =========================================================
   MATERIAL HELPERS
========================================================= */

function metalMaterial(
    color,
    roughness = 0.45,
    metalness = 0.7
) {

    return new THREE.MeshStandardMaterial({

        color,

        roughness,

        metalness

    });

}


function createBox(
    parent,
    size,
    position,
    material
) {

    const mesh =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                size.x,
                size.y,
                size.z
            ),
            material
        );

    mesh.position.copy(
        position
    );

    parent.add(mesh);

    return mesh;
}


/* =========================================================
   MAIN SPACECRAFT BUS
========================================================= */

function createMainBus(
    parent
) {

    const body =
        createBox(
            parent,

            new THREE.Vector3(
                3.0,
                2.25,
                2.35
            ),

            new THREE.Vector3(
                0,
                0,
                0
            ),

            metalMaterial(
                0x9ca19e,
                0.42,
                0.65
            )
        );


    /*
    Dark radiator panel
    */

    const radiator =
        createBox(
            parent,

            new THREE.Vector3(
                2.65,
                1.8,
                0.06
            ),

            new THREE.Vector3(
                0,
                0,
                1.21
            ),

            metalMaterial(
                0x252d2e,
                0.72,
                0.45
            )
        );


    /*
    Equipment panels
    */

    const equipment =
        metalMaterial(
            0x303839,
            0.55,
            0.5
        );


    for (
        let x = -0.9;
        x <= 0.9;
        x += 0.9
    ) {

        createBox(
            parent,

            new THREE.Vector3(
                0.6,
                0.55,
                0.07
            ),

            new THREE.Vector3(
                x,
                0.45,
                1.25
            ),

            equipment
        );

    }


    /*
    Vertical structural rails
    */

    const rails =
        metalMaterial(
            0x596160,
            0.32,
            0.85
        );


    for (
        const x of [-1.3, 1.3]
    ) {

        createBox(
            parent,

            new THREE.Vector3(
                0.12,
                2.2,
                2.45
            ),

            new THREE.Vector3(
                x,
                0,
                0
            ),

            rails
        );

    }


    /*
    Top avionics box
    */

    createBox(
        parent,

        new THREE.Vector3(
            1.2,
            0.35,
            1.0
        ),

        new THREE.Vector3(
            0,
            1.28,
            0
        ),

        metalMaterial(
            0x747b78,
            0.4,
            0.7
        )
    );

}


/* =========================================================
   SOLAR WING
========================================================= */

function createSolarWing(
    parent,
    side
) {

    const wing =
        new THREE.Group();


    wing.position.x =
        side * 3.5;


    /*
    Deployment arm
    */

    createBox(
        wing,

        new THREE.Vector3(
            1.3,
            0.12,
            0.12
        ),

        new THREE.Vector3(
            -side * 0.65,
            0,
            0
        ),

        metalMaterial(
            0x737c7b,
            0.32,
            0.85
        )
    );


    /*
    Solar panel
    */

    const solar =
        new THREE.MeshStandardMaterial({

            color:
                0x153d72,

            roughness:
                0.3,

            metalness:
                0.28

        });


    createBox(
        wing,

        new THREE.Vector3(
            3.3,
            2.5,
            0.09
        ),

        new THREE.Vector3(
            side * 1.5,
            0,
            0
        ),

        solar
    );


    /*
    Solar cell grid
    */

    const grid =
        new THREE.LineBasicMaterial({

            color:
                0xaabed0,

            transparent:
                true,

            opacity:
                0.6

        });


    const centerX =
        side * 1.5;


    for (
        let x = -1.2;
        x <= 1.2;
        x += 0.6
    ) {

        const points = [

            new THREE.Vector3(
                centerX + x,
                -1.2,
                0.055
            ),

            new THREE.Vector3(
                centerX + x,
                1.2,
                0.055
            )

        ];


        const geometry =
            new THREE.BufferGeometry()
                .setFromPoints(
                    points
                );


        wing.add(
            new THREE.Line(
                geometry,
                grid
            )
        );

    }


    for (
        let y = -0.8;
        y <= 0.8;
        y += 0.8
    ) {

        const points = [

            new THREE.Vector3(
                centerX - 1.6,
                y,
                0.055
            ),

            new THREE.Vector3(
                centerX + 1.6,
                y,
                0.055
            )

        ];


        const geometry =
            new THREE.BufferGeometry()
                .setFromPoints(
                    points
                );


        wing.add(
            new THREE.Line(
                geometry,
                grid
            )
        );

    }


    parent.add(
        wing
    );

}


/* =========================================================
   EARTH OBSERVATION SENSOR
========================================================= */

function createEarthObservationSensor(
    parent
) {

    const housingMaterial =
        metalMaterial(
            0x303837,
            0.35,
            0.75
        );


    const housing =
        createBox(
            parent,

            new THREE.Vector3(
                0.9,
                0.75,
                0.85
            ),

            new THREE.Vector3(
                0.25,
                -1.5,
                0
            ),

            housingMaterial
        );


    /*
    Optical lens
    */

    const lens =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.31,
                0.31,
                0.22,
                32
            ),

            new THREE.MeshStandardMaterial({

                color:
                    0x102b3b,

                roughness:
                    0.08,

                metalness:
                    0.45,

                emissive:
                    0x071925,

                emissiveIntensity:
                    0.4

            })
        );


    lens.rotation.x =
        Math.PI / 2;


    lens.position.set(
        0.25,
        -1.5,
        0.48
    );


    parent.add(
        lens
    );


    /*
    Lens ring
    */

    const ring =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                0.34,
                0.04,
                16,
                40
            ),

            metalMaterial(
                0xb4bbb7,
                0.28,
                0.8
            )
        );


    ring.position.set(
        0.25,
        -1.5,
        0.61
    );


    parent.add(
        ring
    );

}


/* =========================================================
   COMMUNICATION DISH
========================================================= */

function createCommunicationDish(
    parent
) {

    const group =
        new THREE.Group();


    group.position.set(
        -0.85,
        1.65,
        0
    );


    const dish =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.85,
                32,
                16,
                0,
                Math.PI * 2,
                0,
                Math.PI / 2
            ),

            metalMaterial(
                0xb4b9b5,
                0.48,
                0.55
            )

        );


    dish.rotation.x =
        Math.PI;


    group.add(dish);


    /*
    Feed support
    */

    const support =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.045,
                0.045,
                0.8,
                12
            ),

            metalMaterial(
                0x555e5c,
                0.3,
                0.8
            )
        );


    support.position.y =
        -0.45;


    group.add(support);


    /*
    Feed receiver
    */

    const feed =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.12,
                0.12,
                0.2,
                16
            ),

            metalMaterial(
                0x2c3333,
                0.3,
                0.8
            )
        );


    feed.position.y =
        -0.86;


    group.add(feed);


    parent.add(
        group
    );

}


/* =========================================================
   HIGH GAIN ANTENNA
========================================================= */

function createHighGainAntenna(
    parent
) {

    const antenna =
        new THREE.Group();


    antenna.position.set(
        1.05,
        1.55,
        -0.3
    );


    const mast =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.035,
                0.035,
                1.7,
                10
            ),

            metalMaterial(
                0x737b79,
                0.3,
                0.85
            )
        );


    mast.rotation.z =
        -0.4;


    antenna.add(mast);


    const tip =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.13,
                16,
                16
            ),

            metalMaterial(
                0xaeb6b2,
                0.25,
                0.8
            )
        );


    tip.position.set(
        0.33,
        0.75,
        0
    );


    antenna.add(tip);


    parent.add(
        antenna
    );

}


/* =========================================================
   STAR TRACKERS
========================================================= */

function createStarTrackers(
    parent
) {

    const material =
        metalMaterial(
            0x272e2f,
            0.3,
            0.8
        );


    for (
        const x of [-1.0, 1.0]
    ) {

        const tracker =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.16,
                    0.16,
                    0.18,
                    20
                ),

                material
            );


        tracker.rotation.x =
            Math.PI / 2;


        tracker.position.set(
            x,
            1.35,
            0.7
        );


        parent.add(
            tracker
        );

    }

}


/* =========================================================
   THERMAL BLANKETS
========================================================= */

function createThermalBlankets(
    parent
) {

    const thermal =
        new THREE.MeshStandardMaterial({

            color:
                0xc09a4f,

            roughness:
                0.72,

            metalness:
                0.38

        });


    for (
        let i = -2;
        i <= 2;
        i++
    ) {

        createBox(
            parent,

            new THREE.Vector3(
                0.52,
                0.035,
                1.8
            ),

            new THREE.Vector3(
                i * 0.58,
                0,
                -1.2
            ),

            thermal
        );

    }

}


/* =========================================================
   STRUCTURAL HARDWARE
========================================================= */

function createStructuralHardware(
    parent
) {

    const material =
        metalMaterial(
            0x606866,
            0.25,
            0.9
        );


    /*
    Bottom struts
    */

    for (
        const x of [-1.1, 1.1]
    ) {

        const strut =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.055,
                    0.055,
                    1.0,
                    12
                ),
                material
            );


        strut.position.set(
            x,
            -1.6,
            0
        );


        parent.add(
            strut
        );

    }


    /*
    Small navigation antenna
    */

    const antenna =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.025,
                0.025,
                1.2,
                10
            ),
            material
        );


    antenna.position.set(
        1.15,
        2.1,
        0.6
    );


    antenna.rotation.z =
        0.3;


    parent.add(
        antenna
    );

}


/* =========================================================
   ANIMATION
========================================================= */

function animate() {

    requestAnimationFrame(
        animate
    );


    const time =
        state.clock.getElapsedTime();


    /*
    Smooth mouse response.
    */

    state.smoothMouseX +=
        (
            state.mouseX -
            state.smoothMouseX
        ) * 0.025;


    state.smoothMouseY +=
        (
            state.mouseY -
            state.smoothMouseY
        ) * 0.025;


    if (
        state.satellite
    ) {

        /*
        Slow orbital movement.
        */

        state.satellite.position.x =
            Math.sin(
                time * 0.17
            ) * 3.6 +
            state.smoothMouseX * 0.8;


        state.satellite.position.y =
            Math.sin(
                time * 0.31
            ) * 1.25 +
            state.smoothMouseY * 0.55;


        state.satellite.position.z =
            Math.cos(
                time * 0.17
            ) * 1.8;


        /*
        Natural attitude changes.
        */

        state.satellite.rotation.y =
            time * 0.055 +
            state.smoothMouseX * 0.08;


        state.satellite.rotation.x =
            Math.sin(
                time * 0.12
            ) * 0.045 +
            state.smoothMouseY * 0.05;


        state.satellite.rotation.z =
            Math.sin(
                time * 0.09
            ) * 0.025;

    }


    /*
    Telemetry display.
    */

    if (
        targetCoordinates
    ) {

        const latitude =
            39.8 +
            state.smoothMouseY * 7;


        const longitude =
            -98.5 +
            state.smoothMouseX * 18;


        targetCoordinates.textContent =
            `${Math.abs(latitude).toFixed(3)}° ${
                latitude >= 0 ? "N" : "S"
            } / ${
                Math.abs(longitude).toFixed(3)
            }° ${
                longitude >= 0 ? "E" : "W"
            }`;

    }


    state.renderer.render(
        state.scene,
        state.camera
    );

}


/* =========================================================
   MOUSE
========================================================= */

window.addEventListener(
    "pointermove",
    event => {

        if (
            state.transitioning
        ) {
            return;
        }


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


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

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
);


/* =========================================================
   SPECTRAL TRANSITION
========================================================= */

function launchTransition() {

    if (
        state.transitioning
    ) {
        return;
    }


    state.transitioning = true;


    missionScreen.classList.add(
        "transitioning"
    );


    /*
    Make spacecraft accelerate.
    */

    if (
        state.satellite
    ) {

        state.satellite
            .scale
            .multiplyScalar(1.12);

    }


    setTimeout(
        () => {

            missionScreen.classList.add(
                "departing"
            );

        },
        750
    );


    setTimeout(
        () => {

            missionScreen.style.display =
                "none";


            agricultureApp.classList.add(
                "visible"
            );


            document.body.style.cursor =
                "default";


            initializeMap();


            setTimeout(
                () => {

                    if (
                        infoBubble
                    ) {

                        infoBubble.classList.add(
                            "visible"
                        );

                    }

                },
                4500
            );

        },
        1550
    );

}


/* =========================================================
   SCROLL TO SECOND SCREEN
========================================================= */

window.addEventListener(
    "wheel",
    event => {

        if (
            !state.transitioning &&
            Math.abs(event.deltaY) > 3
        ) {

            launchTransition();

        }

    },
    {
        passive: true
    }
);


/* =========================================================
   KEYBOARD TRANSITION
========================================================= */

window.addEventListener(
    "keydown",
    event => {

        if (
            state.transitioning
        ) {
            return;
        }


        if (
            event.key === "ArrowDown" ||
            event.key === "PageDown" ||
            event.key === " "
        ) {

            launchTransition();

        }

    }
);


/* =========================================================
   MAP
========================================================= */

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

                touchZoom: true

            }
        );


    state.map.setView(
        [20, 0],
        2
    );


    /*
    Satellite imagery.
    */

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

if (
    geojsonInput
) {

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
            catch (error) {

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
   DRAG/DROP
========================================================= */

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


            if (file) {

                readGeoJSON(
                    file
                );

            }

        }
    );

}


/* =========================================================
   FIELD
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
                            "#e8efeb",

                        weight:
                            3,

                        opacity:
                            0.95,

                        fillColor:
                            "#88a895",

                        fillOpacity:
                            0.18

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
                "Invalid GeoJSON bounds."
            );

        }


        state.map.flyToBounds(
            bounds,
            {

                padding:
                    [70, 70],

                maxZoom:
                    17,

                duration:
                    2

            }
        );


        state.fieldLoaded = true;


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


        if (!name) {
            name = "ACTIVE FIELD";
        }


        name =
            name.replace(
                /\b\w/g,
                letter =>
                    letter.toUpperCase()
            );


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


        /*
        Geometry alone cannot calculate
        actual NDVI.
        */

        ndviValue.textContent = "—";
        stressValue.textContent = "—";


        if (uploadPanel) {
            uploadPanel.style.display =
                "none";
        }


        if (fieldWorkspace) {

            fieldWorkspace.classList.remove(
                "hidden"
            );

        }


        initializeAnalysisMap(
            data,
            bounds
        );

    }
    catch (error) {

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
        state.analysisMap
    ) {

        state.analysisMap.remove();

    }


    state.analysisMap =
        L.map(
            analysisMapPreview,
            {
                attributionControl:
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
                    "#f1f5f2",

                weight:
                    3,

                fillColor:
                    "#9bbba5",

                fillOpacity:
                    0.22

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

    let totalArea = 0;


    function ringArea(
        ring
    ) {

        if (
            !ring ||
            ring.length < 3
        ) {

            return 0;

        }


        const R = 6378137;

        let area = 0;


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


    function geometryArea(
        geometry
    ) {

        if (!geometry) {
            return;
        }


        if (
            geometry.type === "Polygon"
        ) {

            totalArea +=
                ringArea(
                    geometry.coordinates[0]
                );

        }


        if (
            geometry.type === "MultiPolygon"
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
        geojson.type === "Feature"
    ) {

        geometryArea(
            geojson.geometry
        );

    }
    else if (
        geojson.type === "FeatureCollection"
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

    let total = 0;


    function distance(
        a,
        b
    ) {

        const R = 6371000;

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


    function geometryLength(
        geometry
    ) {

        if (!geometry) {
            return;
        }


        if (
            geometry.type === "Polygon"
        ) {

            geometry.coordinates.forEach(
                ringLength
            );

        }


        if (
            geometry.type === "MultiPolygon"
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
        geojson.type === "Feature"
    ) {

        geometryLength(
            geojson.geometry
        );

    }
    else if (
        geojson.type === "FeatureCollection"
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


    return total / 1609.344;

}


/* =========================================================
   FIELD SCAN
========================================================= */

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


            scanButton.disabled = true;

            scanButton.textContent =
                "PROCESSING FIELD...";


            setTimeout(
                () => {

                    scanButton.disabled =
                        false;

                    scanButton.textContent =
                        "RUN FIELD ANALYSIS";


                    alert(
                        "Field geometry processed successfully. Connect a satellite remote-sensing data source to calculate actual NDVI, vegetation health, and crop-stress measurements."
                    );

                },
                1400
            );

        }
    );

}


/* =========================================================
   RESET
========================================================= */

if (
    resetMap
) {

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
                        duration: 1.2
                    }
                );

            }

        }
    );

}


/* =========================================================
   INFO BUBBLE
========================================================= */

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
