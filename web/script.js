"use strict";


/* =========================================================
   AGRICULTURAL SPACE LANDING SYSTEM
========================================================= */

const canvas =
    document.getElementById("agriCanvas");

const ctx =
    canvas.getContext("2d");

const missionScreen =
    document.getElementById("missionScreen");

const startMission =
    document.getElementById("startMission");

const latitude =
    document.getElementById("liveLatitude");

const longitude =
    document.getElementById("liveLongitude");


let width = 0;
let height = 0;

let mouseX = 0;
let mouseY = 0;

let targetMouseX = 0;
let targetMouseY = 0;

let time = 0;

let scanPosition = -1;

let stars = [];

let particles = [];


/* =========================================================
   RESIZE
========================================================= */

function resizeCanvas() {

    width =
        canvas.width =
            window.innerWidth *
            devicePixelRatio;

    height =
        canvas.height =
            window.innerHeight *
            devicePixelRatio;

    canvas.style.width =
        window.innerWidth + "px";

    canvas.style.height =
        window.innerHeight + "px";

    ctx.setTransform(
        devicePixelRatio,
        0,
        0,
        devicePixelRatio,
        0,
        0
    );

    width =
        window.innerWidth;

    height =
        window.innerHeight;

}


window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();


/* =========================================================
   STAR FIELD
========================================================= */

function createStars() {

    stars = [];

    for (
        let i = 0;
        i < 700;
        i++
    ) {

        stars.push({

            x:
                Math.random() *
                width,

            y:
                Math.random() *
                height,

            size:
                Math.random() *
                1.5,

            brightness:
                Math.random(),

            depth:
                Math.random()

        });

    }

}

createStars();


/* =========================================================
   AGRICULTURAL PARTICLES
========================================================= */

function createParticles() {

    particles = [];

    for (
        let i = 0;
        i < 800;
        i++
    ) {

        particles.push({

            x:
                Math.random(),

            y:
                Math.random(),

            speed:
                .0002 +
                Math.random() *
                .0008,

            size:
                Math.random() *
                2,

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

        targetMouseX =
            event.clientX /
            window.innerWidth;

        targetMouseY =
            event.clientY /
            window.innerHeight;

    }
);


/* =========================================================
   DRAW STARS
========================================================= */

function drawStars() {

    for (
        const star
        of stars
    ) {

        const parallax =
            star.depth *
            20;

        const x =
            star.x +
            (
                mouseX -
                .5
            ) *
            parallax;

        const y =
            star.y +
            (
                mouseY -
                .5
            ) *
            parallax;


        const brightness =
            .2 +
            star.brightness *
            .8;


        ctx.fillStyle =
            `rgba(
                180,
                255,
                150,
                ${brightness}
            )`;


        ctx.fillRect(
            x,
            y,
            star.size,
            star.size
        );

    }

}


/* =========================================================
   FIELD TERRAIN
========================================================= */

function drawTerrain() {

    const centerX =
        width * .66;

    const horizon =
        height * .39;

    /*
    Perspective field
    */

    for (
        let row = 0;
        row < 65;
        row++
    ) {

        const progress =
            row / 65;

        const y =
            horizon +
            Math.pow(
                progress,
                1.75
            ) *
            height *
            .75;


        const perspective =
            .12 +
            progress *
            1.8;


        /*
        NDVI gradient
        */

        const gradient =
            ctx.createLinearGradient(
                0,
                y,
                width,
                y
            );


        gradient.addColorStop(
            0,
            "rgba(7,25,10,.1)"
        );


        gradient.addColorStop(
            .25,
            "rgba(20,75,20,.45)"
        );


        gradient.addColorStop(
            .5,
            "rgba(130,220,30,.5)"
        );


        gradient.addColorStop(
            .7,
            "rgba(190,220,20,.35)"
        );


        gradient.addColorStop(
            1,
            "rgba(30,70,15,.15)"
        );


        ctx.strokeStyle =
            gradient;

        ctx.lineWidth =
            1;


        /*
        Curved agricultural rows
        */

        for (
            let column = -25;
            column < 30;
            column++
        ) {

            const baseX =
                centerX +
                column *
                75 *
                perspective;


            ctx.beginPath();


            for (
                let step = 0;
                step <= 1;
                step += .025
            ) {

                const yy =
                    horizon +
                    step *
                    (
                        y -
                        horizon
                    );


                const wave =
                    Math.sin(
                        step * 8 +
                        time * .0007 +
                        column
                    ) *
                    22 *
                    progress;


                const distortion =
                    Math.sin(
                        time * .001 +
                        column * .6
                    ) *
                    mouseX *
                    15;


                const xx =
                    baseX +
                    wave +
                    distortion;


                if (
                    step === 0
                ) {

                    ctx.moveTo(
                        xx,
                        yy
                    );

                }

                else {

                    ctx.lineTo(
                        xx,
                        yy
                    );

                }

            }


            ctx.stroke();

        }

    }


    /*
    ---------------------------------------------------------
    Field parcels
    ---------------------------------------------------------
    */

    for (
        let i = 0;
        i < 80;
        i++
    ) {

        const x =
            width *
            (.42 +
            Math.random() *
            .55);

        const y =
            horizon +
            Math.random() *
            height *
            .48;


        const w =
            20 +
            Math.random() *
            70;


        const h =
            5 +
            Math.random() *
            30;


        const intensity =
            .2 +
            Math.random() *
            .7;


        ctx.fillStyle =
            `rgba(
                ${100 + intensity * 100},
                ${170 + intensity * 80},
                25,
                .12
            )`;


        ctx.fillRect(
            x,
            y,
            w,
            h
        );

    }

}


/* =========================================================
   SPECTRAL PARTICLES
========================================================= */

function drawParticles() {

    for (
        const particle
        of particles
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
                .3 +
                particle.y *
                .65
            );


        const wave =
            Math.sin(
                particle.y *
                30 +
                time *
                .001
            ) *
            20;


        const alpha =
            .15 +
            Math.sin(
                time * .002 +
                particle.phase
            ) *
            .1;


        ctx.fillStyle =
            `rgba(
                160,
                255,
                40,
                ${alpha}
            )`;


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

    const orbitTime =
        time *
        .00015;


    const satelliteX =
        width *
        (
            .62 +
            Math.sin(
                orbitTime
            ) *
            .25
        );


    const satelliteY =
        height *
        (
            .16 +
            Math.cos(
                orbitTime
            ) *
            .05
        );


    /*
    Satellite body
    */

    ctx.save();

    ctx.translate(
        satelliteX,
        satelliteY
    );


    ctx.rotate(
        -.15
    );


    ctx.fillStyle =
        "#b7d7b0";


    ctx.fillRect(
        -15,
        -6,
        30,
        12
    );


    /*
    Solar panels
    */

    ctx.fillStyle =
        "#173b30";


    ctx.fillRect(
        -65,
        -4,
        43,
        8
    );


    ctx.fillRect(
        22,
        -4,
        43,
        8
    );


    ctx.strokeStyle =
        "#a8ff28";

    ctx.strokeRect(
        -65,
        -4,
        43,
        8
    );

    ctx.strokeRect(
        22,
        -4,
        43,
        8
    );


    /*
    Sensor
    */

    ctx.fillStyle =
        "#a8ff28";

    ctx.beginPath();

    ctx.arc(
        0,
        10,
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
            satelliteX,
            satelliteY,
            satelliteX - 200,
            height * .72
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
        satelliteX - 5,
        satelliteY + 12
    );

    ctx.lineTo(
        satelliteX - 240,
        height * .72
    );

    ctx.lineTo(
        satelliteX + 30,
        height * .72
    );

    ctx.closePath();

    ctx.fill();

}


/* =========================================================
   SCAN LINE
========================================================= */

function drawScanLine() {

    scanPosition += .002;

    if (
        scanPosition > 1
    ) {

        scanPosition =
            -1;

    }


    const y =
        height *
        scanPosition;


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
        .5,
        "rgba(160,255,40,.12)"
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
        width,
        160
    );


    ctx.fillStyle =
        "rgba(180,255,80,.35)";


    ctx.fillRect(
        0,
        y,
        width,
        1
    );

}


/* =========================================================
   GRID
========================================================= */

function drawGrid() {

    ctx.strokeStyle =
        "rgba(140,255,70,.06)";

    ctx.lineWidth =
        1;


    for (
        let x = 0;
        x < width;
        x += 80
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            height
        );

        ctx.stroke();

    }


    for (
        let y = 0;
        y < height;
        y += 80
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            width,
            y
        );

        ctx.stroke();

    }

}


/* =========================================================
   MAIN LOOP
========================================================= */

function animate() {

    time++;


    /*
    Smooth mouse
    */

    mouseX +=
        (
            targetMouseX -
            mouseX
        ) *
        .04;


    mouseY +=
        (
            targetMouseY -
            mouseY
        ) *
        .04;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /*
    Space background
    */

    const background =
        ctx.createRadialGradient(
            width * .65,
            height * .5,
            0,
            width * .65,
            height * .5,
            width
        );


    background.addColorStop(
        0,
        "#071408"
    );


    background.addColorStop(
        .45,
        "#020803"
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
        width,
        height
    );


    drawStars();

    drawGrid();

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
   LIVE TELEMETRY
========================================================= */

function updateTelemetry() {

    if (!latitude) {
        return;
    }


    const lat =
        37.8062 +
        (
            mouseY -
            .5
        ) *
        1.8;


    const lon =
        -96.7911 +
        (
            mouseX -
            .5
        ) *
        3.2;


    latitude.textContent =
        `${lat.toFixed(4)}° N`;


    longitude.textContent =
        `${Math.abs(lon).toFixed(4)}° W`;

}


setInterval(
    updateTelemetry,
    80
);


/* =========================================================
   ENTER FIELD
========================================================= */

if (startMission) {

    startMission.addEventListener(
        "click",
        () => {

            missionScreen.classList.add(
                "launching"
            );


            setTimeout(
                () => {

                    missionScreen.style.display =
                        "none";


                    /*
                    Your existing application
                    becomes visible here.
                    */

                    const mainInterface =
                        document.getElementById(
                            "mainInterface"
                        );


                    if (mainInterface) {

                        mainInterface.classList.add(
                            "interface-ready"
                        );

                    }

                },
                900
            );

        }
    );

}
