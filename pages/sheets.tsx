import styles from '../styles/Mileage.module.css'
import Layout from '../components/Layout';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import React from 'react'
import jwt from 'jsonwebtoken';
import cookieCutter from 'cookie-cutter'
import { formatData, headers } from '../lib/strava/api/mileage-csv';
import parseGooglePath from '../utils/parseGooglePath';
import type {GoogleUser, GoogleParams, NewSpreadsheet, StravaSession} from '../typings';
import { useSession, signIn, signOut } from "next-auth/react"
import {CSVLink} from 'react-csv';
import { getToken } from "next-auth/jwt"
import { authOptions } from './api/auth/[...nextauth].js'
import { unstable_getServerSession } from "next-auth/next"
import type ActivityWeek from '../lib/strava/models/ActivityWeek'
import {formatRequests} from '../utils/sheetFormat'
import type { GetServerSideProps, GetServerSidePropsContext, PreviewData } from "next";
import type { NextAuthOptions } from 'next-auth'

// Name of cookie
const SHEETS_COOKIE = 'sheets-token';

// Login to Strava
// @ts-ignore
export async function getServerSideProps(context: GetServerSidePropsContext){
  const opts : NextAuthOptions = authOptions as NextAuthOptions;
  const session : StravaSession = await unstable_getServerSession(context.req, context.res, opts)
  const token = await getToken({req: context.req, secret: process.env.NEXTAUTH_SECRET});

  if (token){

    const data = await formatData({
      userId: token.id, 
      accessToken: session.accessToken, 
      refreshToken: session.refreshToken
    });
    
    return { props: { csvData : data } }
  }

  return { props: { csvData: null } }
}

/**
 * The component!
 */
function Sheets({csvData}) {

  const router =  useRouter();
  const { data: session } = useSession();
  const [googleSession, setGoogleSession] = useState<boolean>(false);
  const [googleInfo, setGoogleInfo] = useState<GoogleUser>(null);


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

      var sheetId;
      if (res &&  res.spreadsheetId) sheetId = res.spreadsheetId;

      // PUT https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}  (fill spreadsheet)
      const sheetData= []
      sheetData.push(["Week Of", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun", "Mileage"]);

      if (csvData){
        for (var i = 0; i < csvData.length; i++){
          const week : ActivityWeek = csvData[i];
          const keys = Object.keys(week);
          const weekArray = []
          keys.forEach(key => {
            var miles = week[key] == 0 ? '' : week[key];
            weekArray.push(miles);
          })
          sheetData.push(weekArray)
        }
      }

      const range = `Sheet1!A1:I${sheetData.length}`
      const sheets_put_endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueInputOption=RAW`

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
      }).then(t => { return t.json() })
      .catch(err => console.error(err))

      // TODO: ##666666 Sheet1!A1:I1
      // const sheets_post_endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`
      // console.log(formatRequests);

      // const postRes = await fetch(sheets_post_endpoint, {
      //   method: 'POST', 
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${access_token}`
      //   },
      //   body: JSON.stringify({
      //     requests: formatRequests
      //   })
      // }).then(t => { return t.json() })
      // .catch(err => console.error(err))
  
      // console.log("<-------------------- POST RESPONSE ------------------------------>");
      // console.log(postRes);


      // TODO: ##ff6d01 Sheet1!A2:A{len}

      // TODO: ##ff6d01 Sheet1!I2:I{len}

      // TODO: format:center Sheet1!A1:I{len}

      // TODO: User message
    }
  }

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
        <h1 className={styles.h2}>Download your Mileage Log!</h1>
        <p>A readable Google Sheet containing all your miles!</p>
      </div>

      {/* Image Gallery – Beautiful Advertising Screenshots */}
      <div className={styles.gallery}>
        <Image
          className={styles.sheetsWidescreen}
          src="/sheets.png"
          alt="Image of CSV File"
          width={909}
          height={253}
          priority
        />
        <Image
          className={styles.sheetsMobile}
          src="/sheets-mobile.png"
          alt="Image of CSV File"
          width={336}
          height={166}
          priority
        />
      </div>

        {/* Not logged in : Prompt */}
        { !googleSession || session == undefined ? (
              <div className={styles.btnContainer}>
                <div className={styles.btnContent}>
                  <p className={styles.description}>
                    Authorize Google and Strava to use the aforementioned services!
                  </p>

                  {!googleSession && (
                    <button onClick={() => googleSignIn()} className={`${styles.googleBtn} ${styles.authBtn}`}>
                      <Image
                        src="/btn_google_signin_dark_normal_web@2x.png"
                        alt="Connect with Google Sheets"
                        width={228}
                        height={55}
                      />
                    </button>
                  )}

                  {!session && (
                    <button onClick={() => signIn()} className={`${styles.stravaBtn} ${styles.authBtn}`}>
                      <Image
                        src="/btn_strava_connectwith_orange.svg"
                        alt="Connect with Strava"
                        width={225}
                        height={55}
                      />
                    </button>
                  )}
            </div>
          </div>
        ) : (<></>)}

        {/* Logged in : Options */}
        {googleSession && googleInfo &&(
          <div className={styles.btnContainer}>
              <div className={styles.btnContent}>
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
            </div>
          </div>

        )}

        {/* Logged in : Options */}
        {session && (
            <div className={styles.btnContainer}>
              <div className={styles.btnContent}>      
                <p className={styles.description}>Signed in through Strava as {session.user.name}</p>

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
            </div>
        </div>

        )}


    </Layout>
  )
}

export default Sheets;