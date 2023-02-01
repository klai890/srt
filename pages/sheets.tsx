import styles from '../styles/Mileage.module.css'
import Layout from '../components/Layout';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, NextRouter } from 'next/router'
import React from 'react'
import jwt from 'jsonwebtoken';
import cookieCutter from 'cookie-cutter'
import { formatData, headers } from '../lib/strava/api/mileage-csv';
import parseGooglePath from '../utils/parseGooglePath';
import type {GoogleUser, GoogleParams, NewSpreadsheet} from '../typings';
import { useSession, signIn, signOut } from "next-auth/react"
import {CSVLink, CSVDownload} from 'react-csv';
import { getToken } from "next-auth/jwt"
import { authOptions } from './api/auth/[...nextauth].js'
import { unstable_getServerSession } from "next-auth/next"
import type ActivityWeek from '../lib/strava/models/ActivityWeek'

// TODO: 
// * Store Token data in the session (or another variable)?
// * Refresh token?
// * Define signIn() for Strava (two separate sign in funcitons for Sheets and Strava)
// * Extract CSV Data from sign in Strava
// * Extract CSV Data into Google Sheets


// Name of cookie
const SHEETS_COOKIE = 'sheets-token';

// JWT Key
const KEY = 'TUxj90CG5oOqMDOwPI378k1LYTAJtVTvZ_qUZECqyxdbYw3US1PAW3wqZy4FXgraACn7zbM7fPZFHcUoBtb-VA';

// https://stackoverflow.com/questions/65752932/internal-api-fetch-with-getserversideprops-next-js
export async function getServerSideProps(context){
  const session = await unstable_getServerSession(context.req, context.res, authOptions)

  console.log("SESSION: ")
  console.log(session);
  const token = await getToken({req: context.req, secret: process.env.NEXTAUTH_SECRET});

  console.log('TOKEN:')
  console.log(token);

  if (token){

    // console.log("PASSED REFRESH TOKEN:")
    // console.log(session.refreshToken);
    const data = await formatData({
      userId: token.id, 
      accessToken: session.accessToken, 
      refreshToken: session.refreshToken
    });
    
    console.log("SERVERSIDE PROPS DATA: ")
    console.log(data);
    
    return {
      props: {
        csvData : data
      }
    }
  }

  else 
  return { 
    props: {
      csvData: null
    }
  }
}

/**
 * The component!
 */
function Sheets({csvData}) {

  const router =  useRouter();
  const { data: session } = useSession();

  // Maybe instead of storing session as a boolean, store it as the
  // {access_token, token_type, expires_in, scope} format (make an interface)
  // So I can access it in the methods.
  const [googleSession, setGoogleSession] = useState<boolean>(false);
  const [googleInfo, setGoogleInfo] = useState<GoogleUser>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string>(null);


  const googleProfile = async () => {
    // FETCH https://www.googleapis.com/oauth2/v1/userinfo?alt=json
    // Add access token to the authorization header of the request

    const google_profile_endpoint = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json';
    const jwt_token = cookieCutter.get(SHEETS_COOKIE);
    
    // FETCH /api/token (retrieve access token)
    const token_res = await fetch('/api/token', {
      method: 'POST',
      headers: {
        // Make sure backend knows we're sending JSON data!!
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({jwt_token})
    }).then(t => t.json())
    
    var access_token;

    if (token_res.access_token) access_token = token_res.access_token;


    // FETCH https://www.googleapis.com/oauth2/v1/userinfo?alt=json (user info)
    const res: GoogleUser = await fetch(google_profile_endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    }).then(t => t.json())

    console.log("<-------------------- THE RESPONSE ------------------------------>");
    console.log(res);

    setGoogleInfo(res);

  }

  /**
   * Links to OAuth to authorize Google
   */
  const googleSignIn = () => {
        // Google's OAuth 2.0 endpoint for requesting an access token
      var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
    
      // Create <form> element to submit parameters to OAuth 2.0 endpoint.
      var form = document.createElement('form');
      form.setAttribute('method', 'GET'); // Send as a GET request.
      form.setAttribute('action', oauth2Endpoint);
    
      // Parameters to pass to OAuth 2.0 endpoint.
      var params = {'client_id': process.env.NEXT_PUBLIC_GAPI_CLIENT_ID,
                    'redirect_uri': process.env.NEXT_PUBLIC_GAPI_REDIRECT_URL,
                    'response_type': 'token',
                    // Google API: Separate with a space
                    'scope':'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/spreadsheets',
                    'include_granted_scopes': 'true',
                    'state': 'pass-through value'};
    
      // Add form parameters as hidden input values.
      for (var p in params) {
        var input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', p);
        input.setAttribute('value', params[p]);
        form.appendChild(input);
      }
    
      // Add form to page and submit it to open the OAuth 2.0 endpoint.
      document.body.appendChild(form);
      form.submit();
  }

  /**
   * IF OAuth2 has responded w params in the URL:
   * 1. Extract params
   * 2. Use params to create a JWT token
   * 3. Store JWT token in Local Storage as a cookie
   */
  const storeTokens = async() => {

    // 1. Extract Params
    console.log('<-------------- ROUTER.asPATH-------------------------->')
    console.log(router.asPath);
    
    const path: string = router.asPath;
    console.log(path);

    if (path === '/sheets') return;

    const params : GoogleParams = parseGooglePath(path);

    console.log('<----------------------- PARAMS ------------------------->');
    console.log(params);
    
    // 2. Use params to create a JWT token
    
    // Make FETCH request to get a JWT token
    if (params != null){
      const {access_token, token_type, expires_in, scope} = params;
      
      // FETCH /api/login (create JWT token)
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          // Make sure backend knows we're sending JSON data!!
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({access_token, token_type, expires_in, scope})
      }).then(t => t.json())

      const token = res.token;
      
      if (token) {
        console.log("<------------------------------ JWT TOKEN ---------------------->")
        console.log(token);
        const json = jwt.decode(token) as {[key:string]: string}
  
        // Set Cookies
        cookieCutter.set(SHEETS_COOKIE, token)
        console.log(json);
      }

    }

    // 3. Store JWT token in Local Storage as a cookie
    console.log("<------------------ GET SHEETS COOKIE ------------------>");
    console.log(cookieCutter.get(SHEETS_COOKIE))

    router.push('/sheets');
  }

  /**
   * Checks to see if the cookie is valid.
   * TODO: CHECK expiration date, add refresh token
   */
  function validateCookies(): void {
    if (cookieCutter.get(SHEETS_COOKIE) && cookieCutter.get(SHEETS_COOKIE).length != 0) setGoogleSession(true);
  }

  /**
   * Signs out a user from Google
   */
  function googleSignOut() {
    // Remove cookie
    cookieCutter.set(SHEETS_COOKIE, '');

    // Issue: After removed, we need to update!
    // Use a REACT hook to update!
    setGoogleSession(false);
  }

  /**
   * Exports Strava mileage to Google sheets
   */
  async function exportMileage(){
    // If not, don't do anything (TODO: maybe throw error?)
    if (googleSession && csvData) {
      // POST https://sheets.googleapis.com/v4/spreadsheets
      const google_sheets_endpoint = `https://sheets.googleapis.com/v4/spreadsheets?key=${process.env.NEXT_PUBLIC_GAPI_KEY}`;
      const jwt_token = cookieCutter.get(SHEETS_COOKIE);
      
      // FETCH /api/token (retrieve Google access token)
      const token_res = await fetch('/api/token', {
        method: 'POST',
        headers: {
          // Make sure backend knows we're sending JSON data!!
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({jwt_token})
      }).then(t => t.json())
      
      var access_token;
  
      if (token_res.access_token) access_token = token_res.access_token;

      const spreadsheetSettings : NewSpreadsheet = {
        properties: {
          title: 'Imported Strava Mileage'
        },
      }
  
  
      // POST https://sheets.googleapis.com/v4/spreadsheets (create a spreadsheet)
      const res: NewSpreadsheet = await fetch(google_sheets_endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }, 
        body: JSON.stringify(spreadsheetSettings)
      }).then(t => t.json())
      .catch(err => console.error(err));

      console.log("<----------------------------- NEW SPREADSHEET RES ---------------------------------->")
      var sheetId;
      if (res &&  res.spreadsheetId) {
        sheetId = res.spreadsheetId;
        setSpreadsheetId(res.spreadsheetId)
      }

      // PUT https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}  (fill spreadsheet)
      // TODO: Update data to array of arrays.
      const sheetData= []
      sheetData.push(["week", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "mileage"]);

      console.log("<---------------------- CSV DATA ------------------------------------->")
      console.log(csvData)
      if (csvData){
        for (var i = 0; i < csvData.length; i++){
          const week : ActivityWeek = csvData[i];
          const keys = Object.keys(week);
          const weekArray = []
          keys.forEach(key => {
            var miles = week[key];
            weekArray.push(miles);
          })
          sheetData.push(weekArray)
        }
      }

      const range = `Sheet1!A1:I${sheetData.length}`
      const sheets_put_endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueInputOption=RAW`


      console.log("<---------------------- SPREADSHEET DATA ------------------------------------->")
      console.log(sheetData);
      
      /**
       * values: [
       *  ["week", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "mileage"],
       *  [arr[i].week, arr[i].monday, ... arr[i].sunday, arr[i].mileage]
       * ]
       */
      const putRes = await fetch(sheets_put_endpoint, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({
          majorDimension: 'ROWS', 
          range: range,
          values: sheetData, 
        })
      }).then(t => {
        console.log("<-------------------------- SUCCESSFULLY WROTE MILEAGE TO SHEET------------------------------>")
        return t.json()
      })
      .catch(err => console.error(err))
  
      console.log("<-------------------- THE RESPONSE ------------------------------>");
      console.log(putRes);
    }
  }

  /**
   * 
   */

  /**
   * The function equivalent on componentOnMount
   * Store JWT token in session, setSession
   */
  useEffect(() => {
    storeTokens();

    // Verify Cookies.
    validateCookies();

    // Get info
    if (googleSession && googleInfo == null) googleProfile();
  })

  return (
    <Layout>
      
      <div className={styles.pageHeader}>
        <h1 className={styles.h2}>Strava, I want a mileage log because I'm a mileage hog!</h1>
        <p> Track runs on Strava to automatically update a mileage log on Google Sheets! </p>
      </div>

        <div className={styles.btnContainer}>
          <div className={styles.btnContent}>

        {/* Logged in : Options */}
        {googleSession && googleInfo &&(
          <>
                <p className={styles.description}>Signed in through Google Sheets as {googleInfo.name}</p>

                <div className={styles.btnGrid}>

                    {csvData && (
                      <button className={styles.btn} id={styles.btn2} onClick={() => exportMileage()}>
                        Export Mileage to Google Sheets
                       </button>

                    )}

                <button className={styles.btn} id={styles.btn2} onClick={() => googleSignOut()}>
                  Sign Out of Google Sheets
                </button>
              </div>
          </>
        )}

        {/* Not logged in : Prompt */}
        { !googleSession && (
            <>        
                  <p className={styles.description}>
                    Authorize Google to use the aforementioned services!
                  </p>
        
                  <button onClick={() => googleSignIn()} className={styles.googleBtn}>
                    <Image
                      src="/btn_google_signin_dark_focus_web.png"
                      alt="Connect with Google Sheets"
                      width={382}
                      height={92}
                    />
                  </button>
            </>
        )}

        </div>
      </div>

      <div className={styles.btnContainer}>
          <div className={styles.btnContent}>
 {/* Logged in : Options */}
 {session && (
          <>
                <p className={styles.description}>Signed in through Strava as {session.user}</p>

                <div className={styles.btnGrid}>

                    {csvData && (
                        <CSVLink 
                          data={csvData} 
                          headers={headers}
                          filename={"mileage.csv"}
                          className={styles.btn}
                        >
                          Export Mileage as CSV
                        </CSVLink>
                    )}

                <button className={styles.btn} id={styles.btn2} onClick={() => signOut()}>
                  Sign Out of Strava
                </button>
              </div>
          </>
        )}



        {/* Not logged in : Prompt */}
        { !session && (
            <>        
                  <p className={styles.description}>
                    Please authorize Strava to use the aforementioned services!
                  </p>
        
                  <button onClick={() => signIn()} className={styles.stravaBtn}>
                    <Image
                      src="/btn_strava_connectwith_orange.svg"
                      alt="Connect with Strava"
                      width={225}
                      height={55}
                    />
                  </button>
            </>
        )}

        </div>
        </div>

    </Layout>
  )
}

export default Sheets;