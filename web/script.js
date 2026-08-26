/* =========================================================
   REAL NDVI ANALYSIS
========================================================= */

function initializeScanButton() {

    if (!scanButton) {
        return;
    }


    scanButton.addEventListener(
        "click",
        runRealNDVIAnalysis
    );

}


/* =========================================================
   RUN REAL NDVI ANALYSIS
========================================================= */

async function runRealNDVIAnalysis() {

    if (
        !state.fieldLoaded ||
        !state.fieldData
    ) {

        alert(
            "Load a GeoJSON field boundary first."
        );

        return;

    }


    /*
    ---------------------------------------------------------
    NDVI requires an area.

    GPX tracks can be displayed, but a track alone
    isn't an agricultural field boundary.
    ---------------------------------------------------------
    */

    const geometry =
        extractFieldGeometry(
            state.fieldData
        );


    if (
        !geometry ||
        ![
            "Polygon",
            "MultiPolygon"
        ].includes(
            geometry.type
        )
    ) {

        alert(

            "Real NDVI analysis requires a Polygon or MultiPolygon field boundary.\n\n" +
            "Your GPX track can still be displayed on the map."

        );

        return;

    }


    scanButton.disabled =
        true;


    scanButton.textContent =
        "CONNECTING TO SENTINEL-2...";


    try {

        /*
        -----------------------------------------------------
        DATE RANGE

        Last 30 days
        -----------------------------------------------------
        */

        const end =
            new Date();


        const start =
            new Date();


        start.setDate(
            end.getDate() - 30
        );


        const startDate =
            start
                .toISOString()
                .split("T")[0];


        const endDate =
            end
                .toISOString()
                .split("T")[0];


        /*
        -----------------------------------------------------
        SERVER REQUEST
        -----------------------------------------------------
        */

        const response =
            await fetch(

                "/api/ndvi",

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            geometry:
                                geometry,

                            startDate:
                                startDate,

                            endDate:
                                endDate,

                            maxCloudCoverage:
                                30

                        })

                }

            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(

                result.error ||
                "NDVI request failed."

            );

        }


        if (
            !result.success
        ) {

            throw new Error(

                result.error ||
                "NDVI analysis failed."

            );

        }


        /*
        -----------------------------------------------------
        DISPLAY REAL VALUES
        -----------------------------------------------------
        */

        displayRealNDVI(
            result
        );


    }

    catch (error) {

        console.error(
            "NDVI ERROR:",
            error
        );


        alert(

            "Unable to retrieve real NDVI data.\n\n" +
            error.message

        );

    }

    finally {

        scanButton.disabled =
            false;


        scanButton.textContent =
            "◈ RUN NDVI ANALYSIS";

    }

}


/* =========================================================
   EXTRACT FIELD GEOMETRY
========================================================= */

function extractFieldGeometry(
    data
) {

    if (!data) {
        return null;
    }


    if (
        data.type ===
        "Feature"
    ) {

        return data.geometry;

    }


    if (
        data.type ===
        "FeatureCollection"
    ) {

        /*
        Prefer Polygon
        */

        for (
            const feature of
            data.features || []
        ) {

            if (
                feature.geometry &&

                (
                    feature.geometry.type ===
                    "Polygon"

                    ||

                    feature.geometry.type ===
                    "MultiPolygon"
                )
            ) {

                return feature.geometry;

            }

        }


        /*
        Fall back to first geometry
        */

        for (
            const feature of
            data.features || []
        ) {

            if (
                feature.geometry
            ) {

                return feature.geometry;

            }

        }

    }


    return data;

}


/* =========================================================
   DISPLAY REAL NDVI
========================================================= */

function displayRealNDVI(
    result
) {

    const analysis =
        result.analysis;


    if (!analysis) {

        return;

    }


    /*
    ---------------------------------------------------------
    NDVI
    ---------------------------------------------------------
    */

    if (ndviValue) {

        ndviValue.textContent =

            analysis.mean !== null
                ? analysis.mean.toFixed(2)
                : "—";

    }


    /*
    ---------------------------------------------------------
    CONDITION
    ---------------------------------------------------------
    */

    if (stressValue) {

        stressValue.textContent =

            analysis.condition ||
            "UNKNOWN";

    }


    /*
    ---------------------------------------------------------
    FIELD DATA WARNING / STATUS
    ---------------------------------------------------------
    */

    const warning =
        document.querySelector(
            ".data-warning"
        );


    if (warning) {

        warning.innerHTML = `

            <strong>
                REAL SENTINEL-2 NDVI
            </strong>

            <br>

            Mean:
            ${
                analysis.mean !== null
                    ? analysis.mean.toFixed(3)
                    : "—"
            }

            <br>

            Minimum:
            ${
                analysis.minimum !== null
                    ? analysis.minimum.toFixed(3)
                    : "—"
            }

            <br>

            Maximum:
            ${
                analysis.maximum !== null
                    ? analysis.maximum.toFixed(3)
                    : "—"
            }

            <br>

            Standard deviation:
            ${
                analysis.standardDeviation !== null
                    ? analysis.standardDeviation.toFixed(3)
                    : "—"
            }

            <br><br>

            Source:
            Sentinel-2 L2A

            <br>

            Observation:
            ${formatDate(
                analysis.to
            )}

        `;

    }


    /*
    ---------------------------------------------------------
    ADD RESULT TO UI
    ---------------------------------------------------------
    */

    updateNDVIStatusPanel(
        analysis
    );


    /*
    ---------------------------------------------------------
    DRAW NDVI VISUALIZATION
    ---------------------------------------------------------
    */

    createRealNDVIVisualization(
        analysis
    );

}


/* =========================================================
   UPDATE NDVI STATUS
========================================================= */

function updateNDVIStatusPanel(
    analysis
) {

    const panel =
        document.querySelector(
            ".field-analysis-card:nth-child(2)"
        );


    if (!panel) {

        return;

    }


    let details =
        panel.querySelector(
            ".ndvi-details"
        );


    if (!details) {

        details =
            document.createElement(
                "div"
            );


        details.className =
            "ndvi-details";


        panel.appendChild(
            details
        );

    }


    details.innerHTML = `

        <div class="ndvi-detail-row">

            <span>
                SOURCE
            </span>

            <strong>
                SENTINEL-2 L2A
            </strong>

        </div>


        <div class="ndvi-detail-row">

            <span>
                PIXELS
            </span>

            <strong>
                ${
                    Number(
                        analysis.sampleCount || 0
                    ).toLocaleString()
                }
            </strong>

        </div>


        <div class="ndvi-detail-row">

            <span>
                CLOUD FILTER
            </span>

            <strong>
                ≤ 30%
            </strong>

        </div>


        <div class="ndvi-detail-row">

            <span>
                STATUS
            </span>

            <strong>
                REAL DATA
            </strong>

        </div>

    `;

}


/* =========================================================
   REAL NDVI VISUALIZATION PLACEHOLDER
========================================================= */

function createRealNDVIVisualization(
    analysis
) {

    /*
    IMPORTANT:

    The Statistical API gives us REAL NDVI
    statistics.

    It does not return the pixel-by-pixel
    NDVI image that we would use as a map
    overlay.

    Therefore this function currently adds
    a real-data status overlay rather than
    pretending the statistical result itself
    is an image.
    */


    if (!state.map) {

        return;

    }


    if (
        !state.fieldLayer
    ) {

        return;

    }


    /*
    ---------------------------------------------------------
    HIGHLIGHT FIELD
    ---------------------------------------------------------
    */

    state.fieldLayer.setStyle({

        color:
            getNDVIColor(
                analysis.mean
            ),

        weight:
            4,

        fillColor:
            getNDVIColor(
                analysis.mean
            ),

        fillOpacity:
            0.20

    });


    /*
    ---------------------------------------------------------
    FIELD POPUP
    ---------------------------------------------------------
    */

    const mean =
        analysis.mean !== null
            ? analysis.mean.toFixed(3)
            : "—";


    const minimum =
        analysis.minimum !== null
            ? analysis.minimum.toFixed(3)
            : "—";


    const maximum =
        analysis.maximum !== null
            ? analysis.maximum.toFixed(3)
            : "—";


    state.fieldLayer.bindPopup(

        `

        <div class="ndvi-popup">

            <strong>
                REAL NDVI
            </strong>

            <hr>

            <div>
                Mean:
                <b>${mean}</b>
            </div>

            <div>
                Minimum:
                <b>${minimum}</b>
            </div>

            <div>
                Maximum:
                <b>${maximum}</b>
            </div>

            <div>
                Condition:
                <b>
                    ${analysis.condition}
                </b>
            </div>

            <br>

            <small>
                Sentinel-2 L2A
            </small>

        </div>

        `

    );

}


/* =========================================================
   NDVI COLOR
========================================================= */

function getNDVIColor(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "#9a9a78";

    }


    if (value < 0.15) {

        return "#7b4b2a";

    }


    if (value < 0.30) {

        return "#b3943b";

    }


    if (value < 0.50) {

        return "#a8bd50";

    }


    if (value < 0.70) {

        return "#57964d";

    }


    return "#1e6133";

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(
    date
) {

    if (!date) {

        return "UNKNOWN";

    }


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return date;

    }


    return parsed.toLocaleDateString(
        undefined,
        {

            year:
                "numeric",

            month:
                "short",

            day:
                "numeric"

        }
    );

}
