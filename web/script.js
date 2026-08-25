```javascript
// ============================================================
// SATELLITE AGRICULTURE MONITOR
// Dashboard Controller + Interactive Field Map
// ============================================================


// ============================================================
// SAMPLE FIELD DATA
// ============================================================

const fields = {

    "North Pivot": {
        location: "Laramie County, Wyoming",
        acres: 127.4,

        health: 87,
        ndvi: 0.72,
        uniformity: 92,

        stress: "LOW",
        growth: "+8.4%",

        vegetation: "HIGH",
        waterStress: "LOW",
        variability: "8%",

        vegetationDescription:
            "Strong vegetation activity",

        waterDescription:
            "No significant stress",

        variabilityDescription:
            "Moderate variation detected"
    },


    "South Pasture": {
        location: "Laramie County, Wyoming",
        acres: 83.1,

        health: 64,
        ndvi: 0.51,
        uniformity: 74,

        stress: "MODERATE",
        growth: "+2.1%",

        vegetation: "MODERATE",
        waterStress: "MODERATE",
        variability: "17%",

        vegetationDescription:
            "Moderate vegetation activity",

        waterDescription:
            "Possible water stress",

        variabilityDescription:
            "Higher field variability"
    },


    "West Hay Field": {
        location: "Laramie County, Wyoming",
        acres: 241.8,

        health: 91,
        ndvi: 0.81,
        uniformity: 95,

        stress: "LOW",
        growth: "+11.7%",

        vegetation: "VERY HIGH",
        waterStress: "LOW",
        variability: "5%",

        vegetationDescription:
            "Excellent vegetation activity",

        waterDescription:
            "No significant water stress",

        variabilityDescription:
            "Very uniform field"
    }

};


// ============================================================
// DOM ELEMENTS
// ============================================================

const fieldSelect =
    document.getElementById("fieldSelect");


// ============================================================
// STAT CARDS
// ============================================================

const statCards =
    document.querySelectorAll(".stat-card");


const healthValue =
    statCards[0]?.querySelector(".stat-value");

const healthChange =
    statCards[0]?.querySelector(".stat-change");


const ndviValue =
    statCards[1]?.querySelector(".stat-value");

const ndviChange =
    statCards[1]?.querySelector(".stat-change");


const uniformityValue =
    statCards[2]?.querySelector(".stat-value");

const uniformityChange =
    statCards[2]?.querySelector(".stat-change");


const stressValue =
    statCards[3]?.querySelector(".stat-value");

const stressChange =
    statCards[3]?.querySelector(".stat-change");


// ============================================================
// FIELD INFORMATION
// ============================================================

const fieldName =
    document.querySelector(".field-name");

const fieldMeta =
    document.querySelector(".field-meta");


// ============================================================
// ANALYSIS ELEMENTS
// ============================================================

const analysisItems =
    document.querySelectorAll(".analysis-item");


const vegetationValue =
    analysisItems[0]?.querySelector(".analysis-value");

const vegetationDescription =
    analysisItems[0]?.querySelector(
        ".analysis-description"
    );


const waterValue =
    analysisItems[1]?.querySelector(".analysis-value");

const waterDescription =
    analysisItems[1]?.querySelector(
        ".analysis-description"
    );


const variabilityValue =
    analysisItems[2]?.querySelector(".analysis-value");

const variabilityDescription =
    analysisItems[2]?.querySelector(
        ".analysis-description"
    );


const growthValue =
    analysisItems[3]?.querySelector(".analysis-value");


// ============================================================
// UPDATE DASHBOARD
// ============================================================

function updateDashboard(fieldNameSelected) {

    const field =
        fields[fieldNameSelected];

    if (!field) {

        console.error(
            "Field not found:",
            fieldNameSelected
        );

        return;
    }


    // Field information

    if (fieldName) {

        fieldName.textContent =
            fieldNameSelected;

    }


    if (fieldMeta) {

        fieldMeta.textContent =
            `${field.location} · ${field.acres} acres`;

    }


    // Health

    if (healthValue) {

        healthValue.textContent =
            field.health;

    }


    if (healthChange) {

        healthChange.textContent =
            `${field.growth} this month`;

    }


    // NDVI

    if (ndviValue) {

        ndviValue.textContent =
            field.ndvi.toFixed(2);

    }


    if (ndviChange) {

        ndviChange.textContent =
            `${field.growth} from last scan`;

    }


    // Uniformity

    if (uniformityValue) {

        uniformityValue.textContent =
            `${field.uniformity}%`;

    }


    if (uniformityChange) {

        uniformityChange.textContent =
            "Current field assessment";

    }


    // Stress

    if (stressValue) {

        stressValue.textContent =
            field.stress;

    }


    if (stressChange) {

        if (field.stress === "LOW") {

            stressChange.textContent =
                "No critical issues";

            stressChange.className =
                "stat-change";

        }

        else if (field.stress === "MODERATE") {

            stressChange.textContent =
                "Field scouting recommended";

            stressChange.className =
                "stat-change warning";

        }

        else {

            stressChange.textContent =
                "Immediate investigation recommended";

            stressChange.className =
                "stat-change danger";
        }

    }


    // Vegetation

    if (vegetationValue) {

        vegetationValue.textContent =
            field.vegetation;

    }


    if (vegetationDescription) {

        vegetationDescription.textContent =
            field.vegetationDescription;

    }


    // Water stress

    if (waterValue) {

        waterValue.textContent =
            field.waterStress;

    }


    if (waterDescription) {

        waterDescription.textContent =
            field.waterDescription;

    }


    // Variability

    if (variabilityValue) {

        variabilityValue.textContent =
            field.variability;

    }


    if (variabilityDescription) {

        variabilityDescription.textContent =
            field.variabilityDescription;

    }


    // Growth

    if (growthValue) {

        growthValue.textContent =
            field.growth;

    }


    console.log(
        `Dashboard updated: ${fieldNameSelected}`
    );
}


// ============================================================
// FIELD SELECTOR
// ============================================================

if (fieldSelect) {

    fieldSelect.addEventListener(
        "change",
        function () {

            updateDashboard(
                this.value
            );

        }
    );

}


// ============================================================
// SIDEBAR NAVIGATION
// ============================================================

const navItems =
    document.querySelectorAll(".nav-item");


navItems.forEach(
    function (item) {

        item.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                navItems.forEach(
                    function (nav) {

                        nav.classList.remove(
                            "active"
                        );

                    }
                );


                item.classList.add(
                    "active"
                );


                console.log(
                    "Navigation:",
                    item.innerText.trim()
                );

            }
        );

    }
);


// ============================================================
// REFRESH BUTTON
// ============================================================

const buttons =
    document.querySelectorAll(".btn");


const refreshButton =
    buttons[0];


if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        function () {

            const originalText =
                refreshButton.textContent;

            refreshButton.textContent =
                "⟳ Updating...";

            refreshButton.disabled =
                true;


            setTimeout(
                function () {

                    refreshButton.textContent =
                        "✓ Updated";

                    refreshButton.disabled =
                        false;


                    setTimeout(
                        function () {

                            refreshButton.textContent =
                                originalText;

                        },
                        1500
                    );

                },
                1000
            );

        }
    );

}


// ============================================================
// ADD FIELD
// ============================================================

const addFieldButton =
    buttons[1];


if (addFieldButton) {

    addFieldButton.addEventListener(
        "click",
        function () {

            const newFieldName =
                prompt(
                    "Enter the name of the new field:"
                );


            if (!newFieldName) {
                return;
            }


            const acreageInput =
                prompt(
                    "Enter the field acreage:"
                );


            if (!acreageInput) {
                return;
            }


            const acreage =
                Number(acreageInput);


            if (
                Number.isNaN(acreage) ||
                acreage <= 0
            ) {

                alert(
                    "Please enter a valid acreage."
                );

                return;
            }


            fields[newFieldName] = {

                location:
                    "Custom Field",

                acres:
                    acreage,

                health:
                    0,

                ndvi:
                    0,

                uniformity:
                    0,

                stress:
                    "UNKNOWN",

                growth:
                    "N/A",

                vegetation:
                    "PENDING",

                waterStress:
                    "PENDING",

                variability:
                    "PENDING",

                vegetationDescription:
                    "Satellite analysis pending",

                waterDescription:
                    "Satellite analysis pending",

                variabilityDescription:
                    "Satellite analysis pending"

            };


            const option =
                document.createElement("option");


            option.textContent =
                newFieldName;

            option.value =
                newFieldName;


            fieldSelect.appendChild(
                option
            );


            fieldSelect.value =
                newFieldName;


            updateDashboard(
                newFieldName
            );

        }
    );

}


// ============================================================
// INTERACTIVE FIELD MAP
// ============================================================

let map = null;

let fieldLayer = null;


// ============================================================
// INITIALIZE LEAFLET MAP
// ============================================================

function initializeMap() {

    const mapElement =
        document.getElementById(
            "fieldMap"
        );


    if (!mapElement) {

        console.error(
            "Field map element was not found."
        );

        return;
    }


    if (typeof L === "undefined") {

        console.error(
            "Leaflet was not loaded."
        );

        return;
    }


    map =
        L.map(
            "fieldMap",
            {
                zoomControl: true
            }
        ).setView(
            [41.14, -104.82],
            11
        );


    // OpenStreetMap base layer

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(
        map
    );


    console.log(
        "Interactive field map initialized."
    );
}


// ============================================================
// LOAD GEOJSON
// ============================================================

function loadGeoJSON(geojson) {

    if (!map) {

        console.error(
            "Map has not been initialized."
        );

        return;
    }


    // Remove existing field

    if (fieldLayer) {

        map.removeLayer(
            fieldLayer
        );

        fieldLayer =
            null;
    }


    // Validate basic GeoJSON structure

    if (
        !geojson ||
        typeof geojson !== "object"
    ) {

        alert(
            "Invalid GeoJSON file."
        );

        return;
    }


    // Create field layer

    fieldLayer =
        L.geoJSON(
            geojson,
            {

                style: {

                    color:
                        "#4f7955",

                    weight:
                        3,

                    opacity:
                        0.95,

                    fillColor:
                        "#78a878",

                    fillOpacity:
                        0.30
                },


                onEachFeature:
                    function (
                        feature,
                        layer
                    ) {

                        const properties =
                            feature.properties || {};


                        const name =
                            properties.name ||
                            properties.Name ||
                            properties.field_name ||
                            "Uploaded Field";


                        layer.bindPopup(`

                            <div
                                class="field-popup-title"
                            >
                                ${escapeHTML(name)}
                            </div>

                            <div
                                class="field-popup-data"
                            >
                                Field boundary loaded successfully.
                            </div>

                        `);

                    }

            }
        ).addTo(
            map
        );


    const bounds =
        fieldLayer.getBounds();


    if (!bounds.isValid()) {

        alert(
            "The GeoJSON did not contain a valid geographic boundary."
        );

        map.removeLayer(
            fieldLayer
        );

        fieldLayer =
            null;

        return;
    }


    // Zoom to field

    map.fitBounds(
        bounds,
        {
            padding: [30, 30]
        }
    );


    // Hide upload panel

    const uploadPanel =
        document.getElementById(
            "mapUpload"
        );


    if (uploadPanel) {

        uploadPanel.classList.add(
            "hidden"
        );

    }


    console.log(
        "GeoJSON field loaded successfully."
    );
}


// ============================================================
// HTML SAFETY
// ============================================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ============================================================
// PROCESS GEOJSON FILE
// ============================================================

function processGeoJSONFile(file) {

    if (!file) {
        return;
    }


    const fileName =
        file.name.toLowerCase();


    if (
        !fileName.endsWith(".geojson") &&
        !fileName.endsWith(".json")
    ) {

        alert(
            "Please upload a GeoJSON file."
        );

        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            try {

                const geojson =
                    JSON.parse(
                        event.target.result
                    );


                loadGeoJSON(
                    geojson
                );

            }

            catch (error) {

                console.error(
                    error
                );

                alert(
                    "The file could not be read as valid GeoJSON."
                );

            }

        };


    reader.onerror =
        function () {

            alert(
                "There was a problem reading the file."
            );

        };


    reader.readAsText(
        file
    );
}


// ============================================================
// GEOJSON FILE INPUT
// ============================================================

const geojsonInput =
    document.getElementById(
        "geojsonInput"
    );


if (geojsonInput) {

    geojsonInput.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];


            processGeoJSONFile(
                file
            );

        }
    );

}


// ============================================================
// DRAG & DROP
// ============================================================

const mapUpload =
    document.getElementById(
        "mapUpload"
    );


if (mapUpload) {

    mapUpload.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            mapUpload.classList.add(
                "dragging"
            );

        }
    );


    mapUpload.addEventListener(
        "dragleave",
        function () {

            mapUpload.classList.remove(
                "dragging"
            );

        }
    );


    mapUpload.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();

            mapUpload.classList.remove(
                "dragging"
            );


            const files =
                event.dataTransfer.files;


            if (
                files &&
                files.length > 0
            ) {

                processGeoJSONFile(
                    files[0]
                );

            }

        }
    );

}


// ============================================================
// RESET MAP
// ============================================================

const resetMapButton =
    document.getElementById(
        "resetMap"
    );


if (resetMapButton) {

    resetMapButton.addEventListener(
        "click",
        function () {

            if (!map) {
                return;
            }


            if (fieldLayer) {

                map.removeLayer(
                    fieldLayer
                );

                fieldLayer =
                    null;

            }


            map.setView(
                [41.14, -104.82],
                11
            );


            const uploadPanel =
                document.getElementById(
                    "mapUpload"
                );


            if (uploadPanel) {

                uploadPanel.classList.remove(
                    "hidden"
                );

            }

        }
    );

}


// ============================================================
// INITIALIZE
// ============================================================

updateDashboard(
    fieldSelect?.value || "North Pivot"
);

initializeMap();


console.log(
    "Satellite Agriculture Monitor initialized."
);
```
