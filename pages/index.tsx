import styles from '../styles/Mileage.module.css'
import Layout from '../components/Layout';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import React from 'react'
import jwt from 'jsonwebtoken';
import cookieCutter from 'cookie-cutter'
import { getStravaData, headers, MAX_CALLS } from '../lib/strava/api/utils';
import parseGooglePath from '../utils/parseGooglePath';
import type {GoogleUser, GoogleParams, NewSpreadsheet} from '../typings';
import { useSession, signIn, signOut } from "next-auth/react"
import {CSVLink} from 'react-csv';
import type ActivityWeek from '../lib/strava/models/ActivityWeek'
import { getMondays } from '../lib/strava/api/utils'
import { compareWeeks } from '../lib/strava/models/ActivityWeek';

// Name of cookie
const SHEETS_COOKIE = 'sheets-token';

/**
 * The component!
 */
export default function Sheets(){

  const router =  useRouter();
  const { data: session } = useSession();
  const [googleSession, setGoogleSession] = useState<boolean>(false);
  const [googleInfo, setGoogleInfo] = useState<GoogleUser>(null);
  const [csvData, setData] = useState<Array<ActivityWeek> | null>(null);
  const [bfDate, setBfDate] = useState<Date | null>(new Date());
  const [afDate, setAfDate] = useState<Date | null>(new Date(bfDate.valueOf() - 6*2.628e+9));
  const [apiCalls, setApiCalls] = useState<number>(0);
  const [sheetLink, setSheetLink] = useState<string | null>(null);

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
    const path: string = router.asPath;
    console.log(path);

    if (path === '/') return;

    const params : GoogleParams = parseGooglePath(path);
    
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

    router.push('/');
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

      setSheetLink(`https://docs.google.com/spreadsheets/d/${sheetId}`)
    }
  }

  /**
   * Fetches activity data.
   */
  const fetchData = async () => {

    const mondays : Array<Date> = getMondays(bfDate, afDate);
    
    var excludedWeeks : Array<Date> = [];
    var data : Array<ActivityWeek> = csvData ? csvData : [];
    for (const monday of mondays) {
        const inArray : boolean = data.find(item => item.week === monday.toLocaleDateString()) ? true : false;

        if (!inArray) {
          const cached_response : string | null = localStorage.getItem(monday.toLocaleDateString())
          
          if (cached_response == null){
            excludedWeeks.push(monday);
          }

          else {
            data.push(JSON.parse(cached_response) as ActivityWeek)
          }
        }
    }

    // All dates in cache.
    if (excludedWeeks.length == 0) {
      data.sort(compareWeeks)
      setData(data);
    }

    // Fetch missing weeks.
    else {

      var bf = new Date(excludedWeeks[excludedWeeks.length - 1])
      bf.setDate(bf.getDate() + 7)
      if (bf.valueOf() > Date.now()) bf = new Date(); // make sure it gets the entirety of the week.
      var af = excludedWeeks[0];
      
      if (apiCalls < MAX_CALLS * 2) {

        const fetched_data : Array<ActivityWeek> | null = await getStravaData(
          session.userid, 
          session.accessToken, 
          // not getting the last week because using the mondays.
          bf, 
          af
        );
  
        setApiCalls(apiCalls + 5);
        
        // Add to local storage.
        if (fetched_data != null){
          fetched_data.forEach(wk => localStorage.setItem(wk.week, JSON.stringify(wk)));
          data = data.concat(fetched_data);
          data.sort(compareWeeks)
          setData(data);
        }
      }

      else {
        alert("API calls has surpassed the maximum. Sorry!")
      }
    }
    
  }

  const updateData = async () => {
    setBfDate(afDate)
    setAfDate(new Date(bfDate.valueOf() - 6*2.628e+9))
    fetchData()
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
        <p>As a CSV. Coming Soon – download as a Google Sheet</p>
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
                    Authorize Strava to use the aforementioned services!
                  </p>

                  {/* {!googleSession && (
                    <button onClick={() => googleSignIn()} className={`${styles.googleBtn} ${styles.authBtn}`}>
                      <Image
                        src="/btn_google_signin_dark_normal_web@2x.png"
                        alt="Connect with Google Sheets"
                        width={228}
                        height={55}
                      />
                    </button>
                  )} */}

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
        { session && (//googleSession && googleInfo &&(
          <div className={styles.btnContainer}>
              <div className={styles.btnContent}>
                {/* <p className={styles.description}>Signed in through Google Sheets as {googleInfo.name}</p> */}

                <div className={styles.btnGrid}>

                    {/* TODO – Comply with Google private policy. */}
                    {/* {csvData && (
                      <button className={styles.btn} id={styles.btn2} onClick={() => exportMileage()}>
                        Export Mileage to Google Sheets
                      </button>
                    )} */}

                    {sheetLink && (<a href={sheetLink} className={styles.link} target="_blank">Link to Generated Google Sheet</a>)}

                  <h3>Select additional date ranges to export</h3>

                  <label><strong>Date time picker</strong></label>

                  <p>
                  <button onClick={e => updateData()}> Generate Previous 6 Months </button>
                  </p>

                  <p>
                    Please be patient, this may take up to 10 seconds because data fetching
                    from Strava takes some time!
                  </p>


                  {/* Preview Data */}
                  <div>
                  {csvData != null && csvData.map((week, id) => 
                      <div key={id}>Week of: {week.week} : {week.mileage}</div>
                  )}
                  </div>

                {/* <button className={styles.btn} id={styles.btn2} onClick={() => googleSignOut()}>
                  Sign Out of Google Sheets
                </button> */}
              </div>
            </div>
          </div>

        )}

        {/* Logged in : Options */}
        {session && (
            <div className={styles.btnContainer}>
              <div className={styles.btnContent}>      
                <p className={styles.description}>Signed in through Strava as {session.user.toString()}</p>

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