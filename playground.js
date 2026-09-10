if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ quiet: true });
}

const maptilerClient = require("@maptiler/client");

maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

async function getGeoData(address) {
  try {
    const geoData = await maptilerClient.geocoding.forward(address, {
      limit: 1,
    });

    console.log(geoData);
    return geoData;
  } catch (error) {
    console.error("Error fetching geocoding data:", error);
    throw error;
  }
}

getGeoData("1600 Pennsylvania Ave NW, Washington, DC 20500");
