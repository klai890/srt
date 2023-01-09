const clientId = process.env.STRAVA_ID;
const clientSecret = process.env.STRAVA_SECRET;
const TOKEN_ENDPOINT = "https://www.strava.com/oauth/token";

// <---------------- RETRIEVE USER ACCESS TOKEN -------------------------------------->
export const getAccessToken = async (refreshToken) => {

  const body = JSON.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  // need to generate authorization code for the user

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body,
  });

  return response.json();
};