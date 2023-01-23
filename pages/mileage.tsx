import styles from '../styles/Mileage.module.css'
import Layout from '../components/Layout';
import Image from 'next/image';
import { useState } from 'react';
import jwt from 'jsonwebtoken';
import cookieCutter from 'cookie-cutter'

// import { useSession, signIn, signOut } from "next-auth/react"
import {CSVLink, CSVDownload} from 'react-csv';
// import { getToken } from "next-auth/jwt"
import { formatData, headers } from '../lib/strava/api/mileage-csv';
// import { authOptions } from './api/auth/[...nextauth].js'
// import { unstable_getServerSession } from "next-auth/next"
// import { authenticate } from '../lib/strava/api/Authorization.js'

// TODO: 
// * Define signIn()
// * Define signOut()


// https://stackoverflow.com/questions/65752932/internal-api-fetch-with-getserversideprops-next-js
export async function getServerSideProps({req, res}){
  // const session = await unstable_getServerSession(req, res, authOptions);
  // const token = await getToken({req: req, secret: process.env.NEXTAUTH_SECRET});
  

  // // console.log('TOKEN:')
  // // console.log(token);

  // if (token){

  //   // console.log("PASSED REFRESH TOKEN:")
  //   // console.log(session.refreshToken);

  //   const data = await formatData({
  //     userId: token.id, 
  //     accessToken: session.accessToken, 
  //     refreshToken: session.refreshToken
  //   });
    
  //   // console.log("SERVERSIDE PROPS DATA: ")
  //   // console.log(data);
    
  //   return {
  //     props: {
  //       csvData : data
  //     }
  //   }
  // }

  // else 
  return { 
    props: {
      csvData: null
    }
  }
}


/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function Mileage({ csvData }) {

  // const { data: session } = useSession();
  const session = false;

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [secret, setSecret] = useState<string>('');

  /**
   * Makes a POST request to /api/login
   */
  async function submitForm(){

    const clientId = process.env.STRAVA_ID;
    const redirect_url = 'http://localhost:3000/mileage'
    const scopes = 'activity:read,activity:read_all'
    const strava_url = 'https://www.strava.com/oauth/authorize'
    
    // // FETCH /api/login
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        // Make sure backend knows we're sending JSON data!!
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, password})
    }).then(t => t.json())
    
    const token = res.token;

    if (token) {
      const json = jwt.decode(token) as {[key:string]: string}

      // Set Cookies
      cookieCutter.set('strava-token', token)

      console.log(json);
      setMessage(`Welcome ${json.username} and you are ${json.admin ? 'an admin!' : 'not an admin!'}`)
      
      // FETCH /api/secrets
      const res = await fetch('/api/secrets', {
        method: 'POST',
        headers: {
          // Make sure backend knows we're sending JSON data!!
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({token})
      }).then(t => t.json())

      if (res.secretAdminCode) { 
        setSecret(res.secretAdminCode)
      } else {
        setSecret('Nothing available')
      }
    }

    else {
      setMessage('Something went wrong.')
    }
  }

  function signIn(){
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

  return (
    <Layout>
      <div className={styles.pageHeader}>
        <h1 className={styles.h2}>Strava, I want a mileage log!</h1>
        <p> Track runs on Strava to automatically update a mileage log on Google Sheets! </p>
      </div>

      <h1>{message}</h1>
      <h1>Secret: {secret}</h1>

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

                  <form>
                    <input type="text" name="username" defaultValue={username} onChange={e => setUsername(e.target.value)}/>
                    <br />
                    <input type="password" name="password" defaultValue={password} onChange={e => setPassword(e.target.value)}/>
                    <br />
                    <input type="button" value="Login" onClick={submitForm} />
                  </form>
        
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
