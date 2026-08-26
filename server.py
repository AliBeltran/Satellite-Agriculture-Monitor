from flask import Flask, request, jsonify, send_from_directory
import requests
import os
from datetime import datetime, timedelta

app = Flask(__name__, static_folder="web")


# ============================================================
# CONFIGURATION
# ============================================================

CLIENT_ID = os.environ.get("SENTINEL_CLIENT_ID")
CLIENT_SECRET = os.environ.get("SENTINEL_CLIENT_SECRET")

TOKEN_URL = (
    "https://services.sentinel-hub.com/oauth/token"
)

STATISTICS_URL = (
    "https://services.sentinel-hub.com/api/v1/statistics"
)


# ============================================================
# GET SENTINEL HUB ACCESS TOKEN
# ============================================================

def get_access_token():

    if not CLIENT_ID or not CLIENT_SECRET:

        raise Exception(
            "Sentinel Hub credentials are not configured."
        )

    response = requests.post(

        TOKEN_URL,

        data={
            "grant_type": "client_credentials",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET
        },

        timeout=30

    )

    response.raise_for_status()

    return response.json()["access_token"]


# ============================================================
# EXTRACT FIELD GEOMETRY
# ============================================================

def extract_geometry(data):

    if not data:
        raise Exception(
            "No spatial data was supplied."
        )


    # Single Feature

    if data.get("type") == "Feature":

        return data.get("geometry")


    # FeatureCollection

    if data.get("type") == "FeatureCollection":

        features = data.get(
            "features",
            []
        )

        # Prefer a polygon because NDVI
        # needs an area of interest.

        for feature in features:

            geometry = feature.get(
                "geometry"
            )

            if not geometry:
                continue

            if geometry.get("type") in [
                "Polygon",
                "MultiPolygon"
            ]:

                return geometry


        # Fall back to first geometry

        for feature in features:

            geometry = feature.get(
                "geometry"
            )

            if geometry:

                return geometry


    # Raw geometry

    if data.get("type") in [
        "Polygon",
        "MultiPolygon",
        "Point",
        "LineString",
        "MultiLineString"
    ]:

        return data


    raise Exception(
        "Unable to find a valid geometry."
    )


# ============================================================
# CHECK THAT GEOMETRY CAN BE USED FOR NDVI
# ============================================================

def validate_ndvi_geometry(
    geometry
):

    geometry_type =
        geometry.get("type")


    if geometry_type not in [
        "Polygon",
        "MultiPolygon"
    ]:

        raise Exception(

            "NDVI analysis requires a polygon field boundary. "
            "A GPX track can be displayed on the map, but "
            "a track by itself does not define an area for "
            "field NDVI statistics."

        )


# ============================================================
# SENTINEL-2 NDVI EVALSCRIPT
# ============================================================

NDVI_EVALSCRIPT = """

//VERSION=3

function setup() {

    return {

        input: [

            {
                bands: [
                    "B04",
                    "B08",
                    "SCL",
                    "dataMask"
                ]
            }

        ],

        output: [

            {
                id: "ndvi",
                bands: 1,
                sampleType: "FLOAT32"
            },

            {
                id: "dataMask",
                bands: 1
            }

        ]

    };

}


function evaluatePixel(sample) {

    /*
    --------------------------------------------------------
    CLOUD / INVALID PIXEL FILTER
    --------------------------------------------------------

    SCL classes:

    3  = cloud shadow
    8  = cloud medium probability
    9  = cloud high probability
    10 = cirrus
    11 = snow / ice

    --------------------------------------------------------
    */


    if (
        sample.dataMask === 0
    ) {

        return {

            ndvi: [0],

            dataMask: [0]

        };

    }


    if (
        sample.SCL === 3 ||
        sample.SCL === 8 ||
        sample.SCL === 9 ||
        sample.SCL === 10 ||
        sample.SCL === 11
    ) {

        return {

            ndvi: [0],

            dataMask: [0]

        };

    }


    /*
    --------------------------------------------------------
    NDVI

    NDVI = (NIR - RED) / (NIR + RED)

    Sentinel-2:

    B08 = NIR
    B04 = RED
    --------------------------------------------------------
    */


    const denominator =

        sample.B08 +
        sample.B04;


    if (
        denominator === 0
    ) {

        return {

            ndvi: [0],

            dataMask: [0]

        };

    }


    const ndvi =

        (
            sample.B08 -
            sample.B04
        )
        /
        denominator;


    return {

        ndvi: [ndvi],

        dataMask: [1]

    };

}

"""


# ============================================================
# NDVI API
# ============================================================

@app.post("/api/ndvi")
def calculate_ndvi():

    try:

        payload =
            request.get_json()


        if not payload:

            return jsonify({

                "success": False,

                "error":
                    "No request data supplied."

            }), 400


        geometry =
            extract_geometry(
                payload.get("geometry")
            )


        validate_ndvi_geometry(
            geometry
        )


        # ----------------------------------------------------
        # DATE RANGE
        # ----------------------------------------------------

        end_date =
            payload.get(
                "endDate"
            )


        start_date =
            payload.get(
                "startDate"
            )


        if not end_date:

            end_date =
                datetime.utcnow().date().isoformat()


        if not start_date:

            end =
                datetime.fromisoformat(
                    end_date
                )


            start =
                end -
                timedelta(days=30)


            start_date =
                start.isoformat()


        # ----------------------------------------------------
        # CLOUD COVER
        # ----------------------------------------------------

        max_cloud =
            payload.get(
                "maxCloudCoverage",
                30
            )


        # ----------------------------------------------------
        # AUTHENTICATION
        # ----------------------------------------------------

        token =
            get_access_token()


        # ----------------------------------------------------
        # STATISTICAL API REQUEST
        # ----------------------------------------------------

        request_body = {

            "input": {

                "bounds": {

                    "geometry":
                        geometry,

                    "properties": {

                        "crs":
                            "http://www.opengis.net/def/crs/OGC/1.3/CRS84"

                    }

                },

                "data": [

                    {

                        "type":
                            "sentinel-2-l2a",

                        "dataFilter": {

                            "maxCloudCoverage":
                                max_cloud

                        }

                    }

                ]

            },


            "aggregation": {

                "timeRange": {

                    "from":
                        start_date +
                        "T00:00:00Z",

                    "to":
                        end_date +
                        "T23:59:59Z"

                },

                "aggregationInterval": {

                    "of":
                        "P30D"

                },

                "evalscript":
                    NDVI_EVALSCRIPT,

                "resx":
                    10,

                "resy":
                    10

            },


            "calculations": {

                "default": {

                    "statistics": {

                        "default": {}

                    }

                }

            }

        }


        # ----------------------------------------------------
        # CALL SENTINEL HUB
        # ----------------------------------------------------

        response =
            requests.post(

                STATISTICS_URL,

                headers={

                    "Authorization":
                        f"Bearer {token}",

                    "Content-Type":
                        "application/json",

                    "Accept":
                        "application/json"

                },

                json=request_body,

                timeout=120

            )


        if not response.ok:

            return jsonify({

                "success": False,

                "error":
                    "Sentinel Hub returned an error.",

                "details":
                    response.text

            }), response.status_code


        result =
            response.json()


        # ----------------------------------------------------
        # PARSE RESULTS
        # ----------------------------------------------------

        if (
            result.get("status")
            == "FAILED"
        ):

            return jsonify({

                "success": False,

                "error":
                    "NDVI calculation failed.",

                "details":
                    result

            }), 500


        intervals =
            result.get(
                "data",
                []
            )


        if not intervals:

            return jsonify({

                "success": False,

                "error":
                    "No Sentinel-2 observations were found for this field and date range."

            }), 404


        processed = []


        for interval in intervals:

            interval_outputs =
                interval.get(
                    "outputs",
                    {}
                )


            ndvi_output =
                interval_outputs.get(
                    "ndvi",
                    {}
                )


            bands =
                ndvi_output.get(
                    "bands",
                    {}
                )


            band =
                bands.get(
                    "B0",
                    {}
                )


            stats =
                band.get(
                    "stats",
                    {}
                )


            if not stats:

                continue


            processed.append({

                "from":
                    interval
                    .get("interval", {})
                    .get("from"),

                "to":
                    interval
                    .get("interval", {})
                    .get("to"),

                "minimum":
                    stats.get(
                        "min"
                    ),

                "maximum":
                    stats.get(
                        "max"
                    ),

                "mean":
                    stats.get(
                        "mean"
                    ),

                "standardDeviation":
                    stats.get(
                        "stDev"
                    ),

                "sampleCount":
                    stats.get(
                        "sampleCount"
                    ),

                "noDataCount":
                    stats.get(
                        "noDataCount"
                    )

            })


        if not processed:

            return jsonify({

                "success": False,

                "error":
                    "Sentinel-2 data was found, but no valid NDVI pixels were available. Try a longer date range or lower cloud filtering."

            }), 404


        # ----------------------------------------------------
        # MOST RECENT VALID INTERVAL
        # ----------------------------------------------------

        latest =
            processed[-1]


        mean =
            latest["mean"]


        minimum =
            latest["minimum"]


        maximum =
            latest["maximum"]


        standard_deviation =
            latest["standardDeviation"]


        # ----------------------------------------------------
        # CONDITION
        # ----------------------------------------------------

        if mean is None:

            condition =
                "NO DATA"

        elif mean >= 0.70:

            condition =
                "HIGH VEGETATION"

        elif mean >= 0.50:

            condition =
                "HEALTHY"

        elif mean >= 0.30:

            condition =
                "MODERATE"

        elif mean >= 0.15:

            condition =
                "LOW"

        else:

            condition =
                "VERY LOW"


        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return jsonify({

            "success":
                True,

            "source":
                "Sentinel-2 L2A",

            "provider":
                "Copernicus Sentinel data via Sentinel Hub",

            "analysis":

                {

                    "from":
                        latest["from"],

                    "to":
                        latest["to"],

                    "mean":
                        mean,

                    "minimum":
                        minimum,

                    "maximum":
                        maximum,

                    "standardDeviation":
                        standard_deviation,

                    "sampleCount":
                        latest["sampleCount"],

                    "noDataCount":
                        latest["noDataCount"],

                    "condition":
                        condition

                },

            "history":
                processed

        })


    except Exception as error:

        print(
            "NDVI ERROR:",
            error
        )


        return jsonify({

            "success":
                False,

            "error":
                str(error)

        }), 500


# ============================================================
# SYSTEM STATUS
# ============================================================

@app.get("/api/status")
def status():

    return jsonify({

        "application":
            "Satellite Agriculture Monitor",

        "ndvi":
            "REAL",

        "source":
            "Sentinel-2 L2A",

        "provider":
            "Sentinel Hub / Copernicus",

        "credentialsConfigured":
            bool(
                CLIENT_ID and
                CLIENT_SECRET
            )

    })


# ============================================================
# WEBSITE
# ============================================================

@app.route("/")
def root():

    return send_from_directory(
        "web",
        "index.html"
    )


@app.route("/<path:path>")
def static_files(path):

    return send_from_directory(
        "web",
        path
    )


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    print("")
    print(
        "=========================================="
    )
    print(
        " SATELLITE AGRICULTURE MONITOR"
    )
    print(
        " REAL SENTINEL-2 NDVI"
    )
    print(
        "=========================================="
    )
    print("")


    if CLIENT_ID and CLIENT_SECRET:

        print(
            "Sentinel Hub credentials: READY"
        )

    else:

        print(
            "Sentinel Hub credentials: MISSING"
        )


    print("")
    print(
        "Open: http://localhost:8000"
    )
    print("")


    app.run(

        host="127.0.0.1",

        port=8000,

        debug=True

    )
