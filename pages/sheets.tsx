// import Metadata from '../components/Metadata';
// import { Inter } from '@next/font/google'
// import styles from '../styles/Settings.module.css'
// import Link from 'next/link';
// import Banner from '../components/Banner';
// import Layout from '../components/Layout';

// const inter = Inter({ subsets: ['latin'] })

// export default function Home() {
//   return (
//     <Layout>
//       <div className={styles.pageHeader}>
//         <h1 className={styles.h2}>Change default settings!</h1>
//         <p> Under construction! </p>
//       </div>    
//     </Layout>
//   )
// }
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
import type {GoogleUser, GoogleParams} from '../typings';

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
/**
 * The component!
 */
function Sheets() {

  const router =  useRouter();

  // Maybe instead of storing session as a boolean, store it as the
  // {access_token, token_type, expires_in, scope} format (make an interface)
  // So I can access it in the methods.
  const [session, setSession] = useState<boolean>(false);
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
  const signIn = () => {
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
    if (cookieCutter.get(SHEETS_COOKIE) && cookieCutter.get(SHEETS_COOKIE).length != 0) setSession(true);
  }

  /**
   * Signs out a user from Google
   */
  function signOut() {
    // Remove cookie
    cookieCutter.set(SHEETS_COOKIE, '');

    // Issue: After removed, we need to update!
    // Use a REACT hook to update!
    setSession(false);
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
    if (session && googleInfo == null) googleProfile();
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
        {session && googleInfo &&(
          <>
                <p className={styles.description}>Signed in through Google Sheets as {googleInfo.name}</p>

                <div className={styles.btnGrid}>

                    {/* {csvData && (
                        <CSVLink 
                          data={csvData} 
                          headers={headers}
                          filename={"mileage.csv"}
                          className={styles.btn}
                        >
                          Export Mileage as CSV
                        </CSVLink>
                    )} */}

                <button className={styles.btn} id={styles.btn2} onClick={() => signOut()}>
                  Sign Out of Google Sheets
                </button>
              </div>
          </>
        )}

        {/* Not logged in : Prompt */}
        { !session && (
            <>        
                  <p className={styles.description}>
                    Authorize Google to use the aforementioned services!
                  </p>
        
                  <button onClick={() => signIn()} className={styles.googleBtn}>
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

    </Layout>
  )
}

export default Sheets;


// https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props#getserversideprops-with-edge-api-routes

// getServerSideProps can be used with both Serverless and Edge Runtimes, and 
// you can set props in both. However, currently in Edge Runtime, you do not 
// have access to the response object. This means that you cannot — 
// for example — add cookies in getServerSideProps. To have access to the 
// response object, you should continue to use the Node.js runtime, which is 
// the default runtime.

// You can explicitly set the runtime on a per-page basis by modifying the config, for example:


// export const config = {
//   runtime: 'nodejs',
// }