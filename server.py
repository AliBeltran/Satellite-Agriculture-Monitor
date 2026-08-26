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

TOKEN_URL = "https://services.sentinel-hub.com/oauth/token"

STATISTICS_URL = "https://services.sentinel-hub.com/api/v1/statistics"


# ============================================================
# SENTINEL HUB AUTHENTICATION
# ============================================================

def get_access_token():

    if not CLIENT_ID or not CLIENT_SECRET:
        raise Exception(
            "Sentinel Hub credentials are missing."
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
# EXTRACT GEOMETRY
# ============================================================

def extract_geometry(data):

    if not data:
        raise Exception(
            "No geometry was supplied."
        )

    if data.get("type") == "Feature":

        return data.get("geometry")


    if data.get("type") == "FeatureCollection":

        features = data.get(
            "features",
            []
        )

        # Prefer an agricultural field polygon.

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


        # Otherwise use the first geometry.

        for feature in features:

            geometry = feature.get(
                "geometry"
            )

            if geometry:
                return geometry


    if data.get("type") in [
        "Polygon",
        "MultiPolygon",
        "Point",
        "LineString",
        "MultiLineString"
    ]:

        return data


    raise Exception(
        "Could not find a valid GeoJSON geometry."
    )


# ============================================================
# NDVI REQUIRES A POLYGON
# ============================================================

def validate_geometry(geometry):

    if not geometry:

        raise Exception(
            "No geometry found."
        )

    if geometry.get("type") not in [
        "Polygon",
        "MultiPolygon"
    ]:

        raise Exception(
            "Real NDVI analysis requires a Polygon or MultiPolygon field boundary."
        )


# ============================================================
# NDVI EVALSCRIPT
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
            }

        ]

    };

}


function evaluatePixel(sample) {

    /*
    ----------------------------------------------------------
    Remove invalid pixels and clouds.

    Sentinel-2 SCL:
    3  = cloud shadow
    8  = medium probability cloud
    9  = high probability cloud
    10 = cirrus
    11 = snow/ice
    ----------------------------------------------------------
    */

    if (
        sample.dataMask === 0 ||
        sample.SCL === 3 ||
        sample.SCL === 8 ||
        sample.SCL === 9 ||
        sample.SCL === 10 ||
        sample.SCL === 11
    ) {

        return {
            ndvi: [NaN]
        };

    }


    /*
    ----------------------------------------------------------
    Sentinel-2:

    B04 = Red
    B08 = Near Infrared

    NDVI = (NIR - Red) / (NIR + Red)
    ----------------------------------------------------------
    */

    const denominator =
        sample.B08 + sample.B04;


    if (
        denominator === 0
    ) {

        return {
            ndvi: [NaN]
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
        ndvi: [ndvi]
    };

}

"""


# ============================================================
# FIND STATISTICS IN RESPONSE
# ============================================================

def extract_statistics(interval):

    outputs = interval.get(
        "outputs",
        {}
    )

    # Usually the output is named "ndvi".

    ndvi_output = outputs.get(
        "ndvi"
    )

    if not ndvi_output:

        # Defensive fallback.

        for value in outputs.values():

            if isinstance(value, dict):

                if "bands" in value:

                    ndvi_output = value
                    break


    if not ndvi_output:

        return None


    bands = ndvi_output.get(
        "bands",
        {}
    )


    band = None


    if "B0" in bands:

        band = bands["B0"]

    elif "B1" in bands:

        band = bands["B1"]

    else:

        for value in bands.values():

            if isinstance(value, dict):

                band = value
                break


    if not band:

        return None


    statistics = band.get(
        "stats"
    )


    if not statistics:

        return None


    return statistics


# ============================================================
# NDVI API
# ============================================================

@app.post("/api/ndvi")
def calculate_ndvi():

    try:

        payload = request.get_json()

        if not payload:

            return jsonify({
                "success": False,
                "error": "No request body supplied."
            }), 400


        geometry = extract_geometry(
            payload.get("geometry")
        )


        validate_geometry(
            geometry
        )


        # ----------------------------------------------------
        # DATE RANGE
        # ----------------------------------------------------

        end_date = payload.get(
            "endDate"
        )


        start_date = payload.get(
            "startDate"
        )


        if not end_date:

            end_date = (
                datetime.utcnow()
                .date()
                .isoformat()
            )


        if not start_date:

            end = datetime.fromisoformat(
                end_date
            )

            start = (
                end -
                timedelta(days=30)
            )

            start_date = start.isoformat()


        # ----------------------------------------------------
        # CLOUD FILTER
        # ----------------------------------------------------

        max_cloud = payload.get(
            "maxCloudCoverage",
            30
        )


        # ----------------------------------------------------
        # AUTH
        # ----------------------------------------------------

        token = get_access_token()


        # ----------------------------------------------------
        # SENTINEL HUB REQUEST
        # ----------------------------------------------------

        request_body = {

            "input": {

                "bounds": {

                    "geometry": geometry,

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
                        f"{start_date}T00:00:00Z",

                    "to":
                        f"{end_date}T23:59:59Z"

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

                "default": {}

            }

        }


        response = requests.post(

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
                    "Sentinel Hub request failed.",

                "details":
                    response.text

            }), response.status_code


        result = response.json()


        # ----------------------------------------------------
        # PROCESS INTERVALS
        # ----------------------------------------------------

        intervals = result.get(
            "data",
            []
        )


        processed = []


        for interval in intervals:

            stats = extract_statistics(
                interval
            )


            if not stats:
                continue


            interval_info = interval.get(
                "interval",
                {}
            )


            processed.append({

                "from":
                    interval_info.get(
                        "from"
                    ),

                "to":
                    interval_info.get(
                        "to"
                    ),

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
                    "No valid Sentinel-2 NDVI observations were found. Try increasing the date range or cloud threshold."

            }), 404


        # ----------------------------------------------------
        # MOST RECENT OBSERVATION
        # ----------------------------------------------------

        latest = processed[-1]


        mean = latest["mean"]


        # ----------------------------------------------------
        # VEGETATION CONDITION
        # ----------------------------------------------------

        if mean is None:

            condition = "NO DATA"

        elif mean >= 0.70:

            condition = "HIGH VEGETATION"

        elif mean >= 0.50:

            condition = "HEALTHY"

        elif mean >= 0.30:

            condition = "MODERATE"

        elif mean >= 0.15:

            condition = "LOW"

        else:

            condition = "VERY LOW"


        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return jsonify({

            "success": True,

            "source":
                "Sentinel-2 L2A",

            "provider":
                "Copernicus Sentinel data",

            "analysis": {

                "from":
                    latest["from"],

                "to":
                    latest["to"],

                "mean":
                    latest["mean"],

                "minimum":
                    latest["minimum"],

                "maximum":
                    latest["maximum"],

                "standardDeviation":
                    latest["standardDeviation"],

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

            "success": False,

            "error":
                str(error)

        }), 500


# ============================================================
# STATUS
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
# START
# ============================================================

if __name__ == "__main__":

    print()
    print(
        "=============================================="
    )
    print(
        " SATELLITE AGRICULTURE MONITOR"
    )
    print(
        " REAL SENTINEL-2 NDVI"
    )
    print(
        "=============================================="
    )
    print()

    if CLIENT_ID and CLIENT_SECRET:

        print(
            "Sentinel Hub credentials: READY"
        )

    else:

        print(
            "Sentinel Hub credentials: MISSING"
        )

    print()
    print(
        "Open: http://localhost:8000"
    )
    print()

    app.run(
        host="127.0.0.1",
        port=8000,
        debug=True
    )
