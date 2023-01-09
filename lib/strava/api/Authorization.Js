const clientId = process.env.STRAVA_ID;
const clientSecret = process.env.STRAVA_SECRET;
const TOKEN_ENDPOINT = "https://www.strava.com/oauth/token";
const OAUTH_ENDPOINT = "https://www.strava.com/oauth/authorize?";
const REDIRECT_URL = "http://localhost:3000/mileage"
const SCOPE = "activity:read,activity:read_all"

// <---------------- GENERATE USER CODE & REFRESH TOKEN (TOOD) ---------------------->

// export const authenticate = async () => {
//   const OAUTH_URL = `${OAUTH_ENDPOINT}
//     client_id=${clientId}
//     &response_type=code
//     &redirect_uri=${REDIRECT_URL}
//     /exchange_token&approval_prompt=force&scope=${SCOPE}`

//   const response = await fetch (OAUTH_URL, {
//     method: 'POST', 
//     headers: {
//       Accept: "application/json, text/plain, */*",
//       "Content-Type": "application/json",
//       'Access-Control-Allow-Origin': '*',

//     },

//     body: JSON.stringify({a: 1, b: 2})
//   })
// }

// const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

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