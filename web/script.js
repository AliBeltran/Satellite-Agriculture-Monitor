"use strict";


/*
===========================================================
 SATELLITE AGRICULTURE MONITOR

 Designed by Ali Beltran

 3D orbital interface
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


const threeContainer =
    document.getElementById(
        "threeContainer"
    );


const cursorCanvas =
    document.getElementById(
        "cursorGalaxy"
    );


const spectralTransition =
    document.getElementById(
        "spectralTransition"
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


/* =====================================================
   STATE
===================================================== */

const state = {

    transitioning: false,

    map: null,

    analysisMap: null,

    fieldLayer: null,

    fieldLoaded: false,

    targetX: 0,

    targetY: 0,

    currentX: 0,

    currentY: 0,

    satellite: null,

    satelliteGroup: null,

    renderer: null,

    camera: null,

    scene: null,

    clock: null,

    cursorParticles: []

};


/* =====================================================
   WAIT FOR LIBRARIES
===================================================== */

window.addEventListener(
    "load",
    () => {

        initializeThree();

        initializeCursor();

    }
);


/* =====================================================
   THREE.JS SCENE
===================================================== */

function initializeThree() {

    if (
        typeof THREE ===
        "undefined"
    ) {

        console.error(
            "Three.js did not load."
        );

        return;

    }


    /*
    Scene
    */

    state.scene =
        new THREE.Scene();


    /*
    Camera
    */

    state.camera =
        new THREE.PerspectiveCamera(
            42,
            window.innerWidth /
            window.innerHeight,
            .1,
            2000
        );


    state.camera.position.set(
        0,
        1.5,
        13
    );


    /*
    Renderer
    */

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


    state.renderer.outputColorSpace =
        THREE.SRGBColorSpace;


    state.renderer.toneMapping =
        THREE.ACESFilmicToneMapping;


    state.renderer.toneMappingExposure =
        1.1;


    threeContainer.appendChild(
        state.renderer.domElement
    );


    /*
    Clock
    */

    state.clock =
        new THREE.Clock();


    /*
    Lighting
    */

    createLighting();


    /*
    Stars
    */

    createThreeStars();


    /*
    Satellite
    */

    createSatellite();


    /*
    Earth
    */

    createEarth();


    /*
    Animation
    */

    animateThree();

}


/* =====================================================
   LIGHTING
===================================================== */

function createLighting() {

    /*
    Sun.
    */

    const sun =
        new THREE.DirectionalLight(
            0xffffff,
            4.5
        );


    sun.position.set(
        -8,
        7,
        12
    );


    state.scene.add(
        sun
    );


    /*
    Cool fill.
    */

    const fill =
        new THREE.DirectionalLight(
            0x7899b5,
            1.2
        );


    fill.position.set(
        8,
        2,
        -8
    );


    state.scene.add(
        fill
    );


    /*
    Ambient.
    */

    const ambient =
        new THREE.AmbientLight(
            0x536166,
            .45
        );


    state.scene.add(
        ambient
    );

}


/* =====================================================
   THREE STARFIELD
===================================================== */

function createThreeStars() {

    const geometry =
        new THREE.BufferGeometry();


    const count = 2800;


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
            70 +
            Math.random() *
            120;


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

            color:
                0xdce7e8,

            size:
                .06,

            transparent:
                true,

            opacity:
                .8,

            sizeAttenuation:
                true

        });


    const stars =
        new THREE.Points(
            geometry,
            material
        );


    state.scene.add(
        stars
    );

}


/* =====================================================
   EARTH
===================================================== */

function createEarth() {

    const geometry =
        new THREE.SphereGeometry(
            8,
            64,
            64
        );


    const material =
        new THREE.MeshStandardMaterial({

            color:
                0x183a42,

            roughness:
                1,

            metalness:
                0

        });


    const earth =
        new THREE.Mesh(
            geometry,
            material
        );


    earth.position.set(
        7,
        -8,
        -20
    );


    earth.scale.set(
        1.5,
        1.5,
        1.5
    );


    state.scene.add(
        earth
    );


    /*
    Atmosphere.
    */

    const atmosphereGeometry =
        new THREE.SphereGeometry(
            8.1,
            64,
            64
        );


    const atmosphereMaterial =
        new THREE.MeshBasicMaterial({

            color:
                0x6bbad0,

            transparent:
                true,

            opacity:
                .12,

            side:
                THREE.BackSide

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


    state.scene.add(
        atmosphere
    );

}


/* =====================================================
   SATELLITE
===================================================== */

function createSatellite() {

    const satellite =
        new THREE.Group();


    state.satelliteGroup =
        satellite;


    satellite.scale.set(
        1.35,
        1.35,
        1.35
    );


    state.scene.add(
        satellite
    );


    /*
    Main spacecraft bus.
    */

    createSpacecraftBody(
        satellite
    );


    /*
    Solar panels.
    */

    createSolarPanel(
        satellite,
        -3.4
    );


    createSolarPanel(
        satellite,
        3.4
    );


    /*
    Communication dish.
    */

    createDish(
        satellite
    );


    /*
    Earth observation sensor.
    */

    createSensor(
        satellite
    );


    /*
    Antennas.
    */

    createAntennas(
        satellite
    );


    /*
    Thermal blankets.
    */

    createThermalPanels(
        satellite
    );


    /*
    Initial position.
    */

    satellite.position.set(
        1,
        1,
        0
    );

}


/* =====================================================
   SPACECRAFT BODY
===================================================== */

function createSpacecraftBody(
    parent
) {

    const geometry =
        new THREE.BoxGeometry(
            2.8,
            2,
            2.2
        );


    const material =
        new THREE.MeshStandardMaterial({

            color:
                0x9da29f,

            roughness:
                .48,

            metalness:
                .58

        });


    const body =
        new THREE.Mesh(
            geometry,
            material
        );


    parent.add(
        body
    );


    /*
    Dark equipment panel.
    */

    const panelMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x202829,

            roughness:
                .7,

            metalness:
                .45

        });


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const panel =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    .65,
                    .45,
                    .025
                ),
                panelMaterial
            );


        panel.position.set(
            -0.85 +
            (i % 3) *
            .82,
            .2 -
            Math.floor(i / 3) *
            .75,
            1.12
        );


        parent.add(
            panel
        );

    }


    /*
    Gold thermal side panels.
    */

    const goldMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0xb89545,

            roughness:
                .62,

            metalness:
                .42

        });


    const side =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.5,
                1.65,
                .04
            ),
            goldMaterial
        );


    side.position.z =
        -1.13;


    parent.add(
        side
    );


    /*
    Structural rails.
    */

    const railMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x535c5c,

            roughness:
                .38,

            metalness:
                .72

        });


    for (
        let x of [-1.15, 1.15]
    ) {

        const rail =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    .12,
                    2.05,
                    2.3
                ),
                railMaterial
            );


        rail.position.x =
            x;


        parent.add(
            rail
        );

    }

}


/* =====================================================
   SOLAR PANEL
===================================================== */

function createSolarPanel(
    parent,
    x
) {

    const panelGroup =
        new THREE.Group();


    panelGroup.position.x =
        x;


    /*
    Boom.
    */

    const boomMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x858d8b,

            roughness:
                .4,

            metalness:
                .7

        });


    const boom =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.0,
                .12,
                .12
            ),
            boomMaterial
        );


    boom.position.x =
        x > 0
            ? -1
            : 1;


    panelGroup.add(
        boom
    );


    /*
    Solar panel.
    */

    const panelMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x163c73,

            roughness:
                .28,

            metalness:
                .25

        });


    const panel =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.9,
                2.25,
                .08
            ),
            panelMaterial
        );


    panel.position.x =
        x > 0
            ? 1.65
            : -1.65;


    panelGroup.add(
        panel
    );


    /*
    Grid lines.
    */

    const lineMaterial =
        new THREE.LineBasicMaterial({

            color:
                0xa9bfd0,

            transparent:
                true,

            opacity:
                .55

        });


    /*
    Vertical grid.
    */

    for (
        let i = -1;
        i <= 1;
        i++
    ) {

        const points = [

            new THREE.Vector3(
                panel.position.x +
                i * .7,
                -1.05,
                .06
            ),

            new THREE.Vector3(
                panel.position.x +
                i * .7,
                1.05,
                .06
            )

        ];


        const geometry =
            new THREE.BufferGeometry()
                .setFromPoints(
                    points
                );


        panelGroup.add(
            new THREE.Line(
                geometry,
                lineMaterial
            )
        );

    }


    /*
    Horizontal grid.
    */

    for (
        let i = -1;
        i <= 1;
        i++
    ) {

        const points = [

            new THREE.Vector3(
                panel.position.x -
                1.35,
                i * .56,
                .06
            ),

            new THREE.Vector3(
                panel.position.x +
                1.35,
                i * .56,
                .06
            )

        ];


        const geometry =
            new THREE.BufferGeometry()
                .setFromPoints(
                    points
                );


        panelGroup.add(
            new THREE.Line(
                geometry,
                lineMaterial
            )
        );

    }


    parent.add(
        panelGroup
    );

}


/* =====================================================
   COMMUNICATION DISH
===================================================== */

function createDish(
    parent
) {

    const group =
        new THREE.Group();


    group.position.set(
        0,
        1.65,
        .1
    );


    /*
    Dish bowl.

    Using a hemisphere-like sphere
    with a clipped-looking scale.
    */

    const geometry =
        new THREE.SphereGeometry(
            .9,
            32,
            16,
            0,
            Math.PI * 2,
            0,
            Math.PI / 2
        );


    const material =
        new THREE.MeshStandardMaterial({

            color:
                0xb8beb9,

            roughness:
                .58,

            metalness:
                .4,

            side:
                THREE.DoubleSide

        });


    const dish =
        new THREE.Mesh(
            geometry,
            material
        );


    dish.rotation.x =
        Math.PI;


    group.add(
        dish
    );


    /*
    Feed horn.
    */

    const feed =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                .12,
                .12,
                .75,
                16
            ),
            new THREE.MeshStandardMaterial({

                color:
                    0x5d6564,

                roughness:
                    .4,

                metalness:
                    .7

            })
        );


    feed.position.y =
        -.5;


    group.add(
        feed
    );


    parent.add(
        group
    );

}


/* =====================================================
   SENSOR
===================================================== */

function createSensor(
    parent
) {

    const housing =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .85,
                .7,
                .8
            ),
            new THREE.MeshStandardMaterial({

                color:
                    0x323b3b,

                roughness:
                    .42,

                metalness:
                    .65

            })
        );


    housing.position.set(
        .2,
        -1.45,
        .2
    );


    parent.add(
        housing
    );


    /*
    Optical lens.
    */

    const lens =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                .28,
                .28,
                .18,
                32
            ),
            new THREE.MeshStandardMaterial({

                color:
                    0x182b38,

                roughness:
                    .1,

                metalness:
                    .3,

                emissive:
                    0x102a3c,

                emissiveIntensity:
                    .35

            })
        );


    lens.rotation.x =
        Math.PI / 2;


    lens.position.set(
        .2,
        -1.45,
        .62
    );


    parent.add(
        lens
    );


    /*
    Lens ring.
    */

    const ring =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                .31,
                .035,
                12,
                32
            ),
            new THREE.MeshStandardMaterial({

                color:
                    0xb4bbb7,

                metalness:
                    .75,

                roughness:
                    .3

            })
        );


    ring.position.set(
        .2,
        -1.45,
        .71
    );


    parent.add(
        ring
    );

}


/* =====================================================
   ANTENNAS
===================================================== */

function createAntennas(
    parent
) {

    const material =
        new THREE.MeshStandardMaterial({

            color:
                0x9ca4a2,

            roughness:
                .3,

            metalness:
                .75

        });


    /*
    Main mast.
    */

    const mast =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                .045,
                .045,
                2.5,
                12
            ),
            material
        );


    mast.position.y =
        2.5;


    parent.add(
        mast
    );


    /*
    Small side booms.
    */

    for (
        const x of [-1.25, 1.25]
    ) {

        const antenna =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    .035,
                    .035,
                    1.4,
                    10
                ),
                material
            );


        antenna.position.set(
            x,
            1.25,
            .4
        );


        antenna.rotation.z =
            x > 0
                ? -.55
                : .55;


        parent.add(
            antenna
        );

    }

}


/* =====================================================
   THERMAL PANELS
===================================================== */

function createThermalPanels(
    parent
) {

    const gold =
        new THREE.MeshStandardMaterial({

            color:
                0xc1a05c,

            roughness:
                .62,

            metalness:
                .4

        });


    for (
        let i = -1;
        i <= 1;
        i++
    ) {

        const panel =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    .68,
                    .03,
                    1.7
                ),
                gold
            );


        panel.position.x =
            i * .72;


        panel.position.z =
            -1.17;


        parent.add(
            panel
        );

    }

}


/* =====================================================
   THREE ANIMATION
===================================================== */

function animateThree() {

    requestAnimationFrame(
        animateThree
    );


    if (
        !state.renderer ||
        !state.scene ||
        !state.camera
    ) {

        return;

    }


    const elapsed =
        state.clock.getElapsedTime();


    /*
    Satellite orbit.

    Large slow elliptical movement.
    */

    if (
        state.satelliteGroup
    ) {

        const orbitX =
            Math.sin(
                elapsed * .17
            ) * 4.5;


        const orbitY =
            Math.sin(
                elapsed * .34
            ) * 1.8;


        const orbitZ =
            Math.cos(
                elapsed * .17
            ) * 2;


        /*
        Mouse influence.
        */

        const mouseX =
            state.currentX * 1.4;


        const mouseY =
            state.currentY * .8;


        state.satelliteGroup.position.x =
            orbitX +
            mouseX;


        state.satelliteGroup.position.y =
            orbitY +
            mouseY;


        state.satelliteGroup.position.z =
            orbitZ;


        /*
        Natural spacecraft rotation.
        */

        state.satelliteGroup.rotation.y =
            elapsed * .07 +
            state.currentX * .12;


        state.satelliteGroup.rotation.x =
            Math.sin(
                elapsed * .11
            ) * .08 +
            state.currentY * .08;


        state.satelliteGroup.rotation.z =
            Math.sin(
                elapsed * .08
            ) * .045;

    }


    /*
    Smooth mouse.
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
    Telemetry.
    */

    if (
        targetCoordinates
    ) {

        const lat =
            39.8283 +
            state.currentY * 8;


        const lon =
            -98.5795 +
            state.currentX * 20;


        targetCoordinates.textContent =
            `${Math.abs(lat).toFixed(3)}° ${
                lat >= 0 ? "N" : "S"
            } / ${
                Math.abs(lon).toFixed(3)
            }° ${
                lon >= 0 ? "E" : "W"
            }`;

    }


    state.renderer.render(
        state.scene,
        state.camera
    );

}


/* =====================================================
   THREE RESIZE
===================================================== */

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


/* =====================================================
   MOUSE
===================================================== */

window.addEventListener(
    "pointermove",
    event => {

        if (
            state.transitioning
        ) {

            return;

        }


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

function initializeCursor() {

    if (
        !cursorCanvas
    ) {

        return;

    }


    resizeCursor();


    window.addEventListener(
        "resize",
        resizeCursor
    );


    window.addEventListener(
        "pointermove",
        createCursorParticles
    );


    drawCursor();

}


function resizeCursor() {

    const ratio =
        Math.min(
            window.devicePixelRatio,
            2
        );


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

}


/* =====================================================
   CURSOR PARTICLES
===================================================== */

function createCursorParticles(
    event
) {

    if (
        state.transitioning
    ) {

        return;

    }


    const amount =
        2 +
        Math.floor(
            Math.random() * 4
        );


    for (
        let i = 0;
        i < amount;
        i++
    ) {

        state.cursorParticles.push({

            x:
                event.clientX,

            y:
                event.clientY,

            vx:
                (
                    Math.random() -
                    .5
                ) * 1.2,

            vy:
                (
                    Math.random() -
                    .5
                ) * 1.2,

            size:
                .6 +
                Math.random() * 1.8,

            life:
                1,

            decay:
                .015 +
                Math.random() * .025,

            hue:
                190 +
                Math.random() * 90

        });

    }


    /*
    Prevent runaway particle count.
    */

    if (
        state.cursorParticles.length >
        500
    ) {

        state.cursorParticles.splice(
            0,
            100
        );

    }

}


/* =====================================================
   DRAW CURSOR
===================================================== */

function drawCursor() {

    requestAnimationFrame(
        drawCursor
    );


    if (
        !cursorCanvas
    ) {

        return;

    }


    const context =
        cursorCanvas.getContext(
            "2d"
        );


    context.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );


    for (
        let i =
            state.cursorParticles.length - 1;

        i >= 0;

        i--
    ) {

        const particle =
            state.cursorParticles[i];


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
            .993;


        if (
            particle.life <= 0
        ) {

            state.cursorParticles.splice(
                i,
                1
            );

            continue;

        }


        /*
        Soft halo.
        */

        context.beginPath();


        context.arc(
            particle.x,
            particle.y,
            particle.size * 4,
            0,
            Math.PI * 2
        );


        context.fillStyle =
            `hsla(
                ${particle.hue},
                50%,
                80%,
                ${particle.life * .08}
            )`;


        context.fill();


        /*
        Star.
        */

        context.beginPath();


        context.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );


        context.fillStyle =
            `hsla(
                ${particle.hue},
                35%,
                95%,
                ${particle.life}
            )`;


        context.fill();


        /*
        Cross sparkle.
        */

        if (
            particle.size > 1
        ) {

            context.strokeStyle =
                `rgba(
                    240,
                    245,
                    245,
                    ${particle.life * .4}
                )`;


            context.lineWidth =
                .5;


            context.beginPath();


            context.moveTo(
                particle.x -
                particle.size * 3,
                particle.y
            );


            context.lineTo(
                particle.x +
                particle.size * 3,
                particle.y
            );


            context.moveTo(
                particle.x,
                particle.y -
                particle.size * 3
            );


            context.lineTo(
                particle.x,
                particle.y +
                particle.size * 3
            );


            context.stroke();

        }

    }

}


/* =====================================================
   TRANSITION
===================================================== */

function launchTransition() {

    if (
        state.transitioning
    ) {

        return;

    }


    state.transitioning =
        true;


    /*
    Remove cursor effect
    immediately.

    This means the galaxy
    effect ONLY exists on
    the first screen.
    */

    if (
        cursorCanvas
    ) {

        cursorCanvas.classList.add(
            "hidden"
        );

    }


    document.body.style.cursor =
        "default";


    /*
    Start spectral effect.
    */

    missionScreen.classList.add(
        "transitioning"
    );


    /*
    Slightly accelerate satellite.
    */

    if (
        state.satelliteGroup
    ) {

        state.satelliteGroup.scale.multiplyScalar(
            1.08
        );

    }


    /*
    Fade mission screen.
    */

    setTimeout(
        () => {

            missionScreen.classList.add(
                "departing"
            );

        },
        900
    );


    /*
    Reveal application.
    */

    setTimeout(
        () => {

            missionScreen.style.display =
                "none";


            agricultureApp.classList.add(
                "visible"
            );


            initializeMap();


            document.body.style.cursor =
                "default";


            /*
            Chat bubble appears
            after user has explored
            the second screen.
            */

            setTimeout(
                () => {

                    infoBubble.classList.add(
                        "visible"
                    );

                },
                5000
            );

        },
        1550
    );

}


/* =====================================================
   SCROLL
===================================================== */

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


/* =====================================================
   KEYBOARD
===================================================== */

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


    state.map.setView(
        [
            20,
            0
        ],
        2
    );


    /*
    Satellite imagery.

    This is the visual
    world imagery layer.
    */

    const satelliteImagery =
        L.tileLayer(

            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",

            {

                maxZoom:
                    19,

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
   DRAG AND DROP
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

function readGeoJSON(
    file
) {

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
                "Invalid boundary."
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


        const cleanName =
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
            cleanName
                ? cleanName.replace(
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


        /*
        Actual NDVI isn't calculated
        from geometry alone.
        */

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
            "The uploaded GeoJSON does not contain a valid field boundary."
        );

    }

}


/* =====================================================
   ANALYSIS MAP
===================================================== */

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

                zoomControl:
                    true,

                attributionControl:
                    false

            }
        );


    L.tileLayer(

        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",

        {

            maxZoom:
                19

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
                    .22

            }

        }
    ).addTo(
        state.analysisMap
    );


    state.analysisMap.fitBounds(
        bounds,
        {

            padding:
                [35,35]

        }
    );


    setTimeout(
        () => {

            state.analysisMap.invalidateSize();

        },
        200
    );

}


/* =====================================================
   AREA
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


    function geometryArea(
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


    function geometryLength(
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
                        "Field geometry processed successfully. Connect a satellite remote-sensing data source to calculate actual NDVI, vegetation health, and crop-stress measurements."
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
   CLOSE INFO BUBBLE
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
