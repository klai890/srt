import styles from '../styles/Mileage.module.css'
import Layout from '../components/Layout';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, NextRouter } from 'next/router'
import React from 'react'
import jwt from 'jsonwebtoken';
import cookieCutter from 'cookie-cutter'
import {CSVLink, CSVDownload} from 'react-csv';
import { formatData, headers } from '../lib/strava/api/mileage-csv';
import parsePath from '../utils/parsePath';

// TODO: 
// * Define signOut()
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
  const [session, setSession] = useState<boolean>(false);

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
      var params = {'client_id': '946470171720-3stkt8fdsuho3lrduc4834t8lk0tp2et.apps.googleusercontent.com',
                    'redirect_uri': 'http://localhost:3000/sheets',
                    'response_type': 'token',
                    'scope':'https://www.googleapis.com/auth/userinfo.profile',
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

    const params = parsePath(path);

    console.log('<----------------------- PARAMS ------------------------->');
    console.log(params);
    
    
    // 2. Use params to create a JWT token
    
    // Make FETCH request to get a JWT token
    if (params != null){
      const access_token = params.access_token;
      const token_type = params.token_type;
      const expires_in = params.expires_in;
      const scope = params.scope;

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          // Make sure backend knows we're sending JSON data!!
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({access_token, token_type, expires_in, scope})
      }).then(t => t.json())

      const token = res.token;
      console.log("<--------------------------------- TOKEN ----------------------------------->");
      console.log(token);
      

      if (token) {
        const json = jwt.decode(token) as {[key:string]: string}
  
        // Set Cookies
        cookieCutter.set(SHEETS_COOKIE, token)
        console.log(json);
      }

      // const jwtToken : string = jwt.sign({
      //   'access_token': access_token,
      //   'token_type': token_type,
      //   'expires_in': expires_in,
      //   'scope': scope
      // }, KEY)

      // console.log("<------------------------------ JWT TOKEN ---------------------->")
      // console.log(jwtToken);
    }

    // 3. Store JWT token in Local Storage as a cookie
    console.log("<------------------ GET SHEETS COOKIE ------------------>");
    console.log(cookieCutter.get(SHEETS_COOKIE))

  }

  /**
   * Checks to see if the cookie is valid.
   */
  function isValidCookie(): boolean {
    if (cookieCutter.get(SHEETS_COOKIE)) return true;
    return false;
  }

  /**
   * Signs out
   */
  function signOut() {
    // Remove cookie
  }

  /**
   * The function equivalent on componentOnMount
   * Store JWT token in session, setSession
   */
  useEffect(() => {
    console.log('<------------------ USE EFFECT --------------------->')
    storeTokens();

    // Verify Cookies.
    var isValid = isValidCookie();
    setSession(isValid);
  })

  return (
    <Layout>
      
      <div className={styles.pageHeader}>
        <h1 className={styles.h2}>Strava, I want a mileage log!</h1>
        <p> Track runs on Strava to automatically update a mileage log on Google Sheets! </p>
      </div>

      <h1>Logged In: {session + ""}</h1>

        <div className={styles.btnContainer}>
          <div className={styles.btnContent}>

        {/* Logged in : Options */}
        {session && (
          <>
                <p className={styles.description}>Signed in through Google Sheets as</p>

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
                      alt="Connect with Strava"
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