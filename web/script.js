// ============================================================
// SATELLITE AGRICULTURE MONITOR
// Dashboard Controller
// ============================================================


// ------------------------------------------------------------
// SAMPLE FIELD DATA
// ------------------------------------------------------------

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


// ------------------------------------------------------------
// DOM ELEMENTS
// ------------------------------------------------------------

const fieldSelect =
    document.getElementById("fieldSelect");


// ------------------------------------------------------------
// STAT CARD ELEMENTS
// ------------------------------------------------------------

const statCards =
    document.querySelectorAll(".stat-card");


// Field Health
const healthValue =
    statCards[0].querySelector(".stat-value");

const healthChange =
    statCards[0].querySelector(".stat-change");


// NDVI
const ndviValue =
    statCards[1].querySelector(".stat-value");

const ndviChange =
    statCards[1].querySelector(".stat-change");


// Uniformity
const uniformityValue =
    statCards[2].querySelector(".stat-value");

const uniformityChange =
    statCards[2].querySelector(".stat-change");


// Stress
const stressValue =
    statCards[3].querySelector(".stat-value");

const stressChange =
    statCards[3].querySelector(".stat-change");


// ------------------------------------------------------------
// FIELD INFORMATION
// ------------------------------------------------------------

const fieldName =
    document.querySelector(".field-name");

const fieldMeta =
    document.querySelector(".field-meta");


// ------------------------------------------------------------
// ANALYSIS ELEMENTS
// ------------------------------------------------------------

const analysisItems =
    document.querySelectorAll(".analysis-item");


const vegetationValue =
    analysisItems[0].querySelector(".analysis-value");

const vegetationDescription =
    analysisItems[0].querySelector(
        ".analysis-description"
    );


const waterValue =
    analysisItems[1].querySelector(".analysis-value");

const waterDescription =
    analysisItems[1].querySelector(
        ".analysis-description"
    );


const variabilityValue =
    analysisItems[2].querySelector(".analysis-value");

const variabilityDescription =
    analysisItems[2].querySelector(
        ".analysis-description"
    );


const growthValue =
    analysisItems[3].querySelector(".analysis-value");


// ------------------------------------------------------------
// UPDATE DASHBOARD
// ------------------------------------------------------------

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


    // --------------------------------------------------------
    // FIELD HEADER
    // --------------------------------------------------------

    fieldName.textContent =
        fieldNameSelected;

    fieldMeta.textContent =
        `${field.location} · ${field.acres} acres`;


    // --------------------------------------------------------
    // HEALTH
    // --------------------------------------------------------

    healthValue.textContent =
        field.health;

    healthChange.textContent =
        `${field.growth} this month`;


    // --------------------------------------------------------
    // NDVI
    // --------------------------------------------------------

    ndviValue.textContent =
        field.ndvi.toFixed(2);

    ndviChange.textContent =
        `${field.growth} from last scan`;


    // --------------------------------------------------------
    // UNIFORMITY
    // --------------------------------------------------------

    uniformityValue.textContent =
        `${field.uniformity}%`;

    uniformityChange.textContent =
        "Current field assessment";


    // --------------------------------------------------------
    // STRESS
    // --------------------------------------------------------

    stressValue.textContent =
        field.stress;


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


    // --------------------------------------------------------
    // VEGETATION
    // --------------------------------------------------------

    vegetationValue.textContent =
        field.vegetation;

    vegetationDescription.textContent =
        field.vegetationDescription;


    // --------------------------------------------------------
    // WATER STRESS
    // --------------------------------------------------------

    waterValue.textContent =
        field.waterStress;

    waterDescription.textContent =
        field.waterDescription;


    // --------------------------------------------------------
    // FIELD VARIABILITY
    // --------------------------------------------------------

    variabilityValue.textContent =
        field.variability;

    variabilityDescription.textContent =
        field.variabilityDescription;


    // --------------------------------------------------------
    // GROWTH
    // --------------------------------------------------------

    growthValue.textContent =
        field.growth;


    console.log(
        `Dashboard updated: ${fieldNameSelected}`
    );
}


// ------------------------------------------------------------
// FIELD SELECTOR
// ------------------------------------------------------------

fieldSelect.addEventListener(
    "change",
    function () {

        updateDashboard(
            this.value
        );

    }
);


// ------------------------------------------------------------
// SIDEBAR NAVIGATION
// ------------------------------------------------------------

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


// ------------------------------------------------------------
// REFRESH BUTTON
// ------------------------------------------------------------

const buttons =
    document.querySelectorAll(".btn");


const refreshButton =
    buttons[0];


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


// ------------------------------------------------------------
// ADD FIELD BUTTON
// ------------------------------------------------------------

const addFieldButton =
    buttons[1];


addFieldButton.addEventListener(
    "click",
    function () {

        const fieldNameInput =
            prompt(
                "Enter the name of the new field:"
            );


        if (!fieldNameInput) {
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


        // Create a temporary field
        fields[fieldNameInput] = {

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


        // Add to selector

        const option =
            document.createElement("option");

        option.textContent =
            fieldNameInput;

        option.value =
            fieldNameInput;


        fieldSelect.appendChild(
            option
        );


        fieldSelect.value =
            fieldNameInput;


        updateDashboard(
            fieldNameInput
        );

    }
);


// ------------------------------------------------------------
// INITIALIZE DASHBOARD
// ------------------------------------------------------------

updateDashboard(
    fieldSelect.value
);


console.log(
    "Satellite Agriculture Monitor initialized."
);
