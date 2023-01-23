// import { google } from 'googleapis';
import { redirect } from 'next/dist/server/api-utils';
import Link from 'next/link';


function getGoogleUrl(){
  const scopes = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

  const options = {
    redirect_uri: process.env.GAPI_REDIRECT_URL,
    client_id: process.env.GAPI_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: scopes.join(" ")
  }

  const qs = new URLSearchParams(options);
  const googleUrl = `${rootUrl}?${qs.toString()}`;

  return googleUrl;
}

export async function getServerSideProps(context) {

//  const authUrl = getUrl();

  // fetch(authUrl, {
  //   method: 'GET'
  // })
  //   .then(res => {
  //     console.log('MADE IT TO THE THENS!!')
  //     if (res.ok) {
  //       console.log('SUCCESS')
  //       return res;
  //     }
  //     else {
  //       console.log('NOT SUCCESSFUL')
  //     }
  //   })
  //   .then( data => console.log(data) )
  //   .catch ( error => console.log('ERROR: ' + error))
  
  // const sheets = google.sheets({ version: 'v4', auth });

  // const response = await sheets.spreadsheets.values.get({
  //   spreadsheetId: process.env.SHEET_ID,
  //   range: 'Sheet1!A2:A4',
  // });

  // const posts = response.data.values.flat();
  // console.log(posts);

  // Create a Spreadsheet

  // const resource = {
  //   properties: {
  //     title: 'Test Spreadsheet!',
  //   }
  // }

  // try {
  //   const spreadsheet = await sheets.spreadsheets.create({
  //     resource,
  //     fields: 'spreadsheetId',
  //   });

  //   console.log(`Spreadsheet ID: ${spreadsheet.data.spreadsheetId}`);
  //   console.log(spreadsheet);

  // } catch (err) {
  //   // TODO (developer) - Handle exception
  //   console.log('ERROR: ')
  //   console.log(error)
  // }
  


  return {
    props: {
      posts: ['post 1', 'post 2'],
    },
  };
}



/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function Post({ posts }) {

  return (
    <article>
      <h1>Posts</h1>
      <ul>
        {posts.map((v, i) => (
          <li key={v}>
            <Link href={`posts/${i + 2}`}>
              {v}
            </Link>
          </li>
        ))}
      </ul>

      <a href={getGoogleUrl()}>Login to Google</a>
    </article>
  );
}

// import styles from '../styles/Mileage.module.css'
// import Layout from '../components/Layout';
// import Image from 'next/image';
// import Script from 'next/Script';

// import { useSession, signIn, signOut } from "next-auth/react"
// import {CSVLink, CSVDownload} from 'react-csv';
// import { getToken } from "next-auth/jwt"
// import { formatData, headers } from '../lib/strava/api/mileage-csv';
// import { authOptions } from './api/auth/[...nextauth].js'
// import { unstable_getServerSession } from "next-auth/next"


// // https://stackoverflow.com/questions/65752932/internal-api-fetch-with-getserversideprops-next-js
// export async function getServerSideProps(context){
//   const session = await unstable_getServerSession(context.req, context.res, authOptions)
//   console.log('THIS IS THE SESSION');
//   console.log(session);

//   const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

//   const stravaResponse = await getStravaData();
//   const sheetsResponse = await getSheetsData();

//   async function getStravaData() {

//   }

//   async function getSheetsData() {
//   }

//   return { props: {csvData: null} }
// }


// /** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
// export default function Mileage({ csvData }) {

//   const { data: session } = useSession();
//   const gsheets_loggedin = false;

//   return (
//     <Layout>
//       <div className={styles.pageHeader}>
//         <h1 className={styles.h2}>Strava, I want a mileage log!</h1>
//         <p> Track runs on Strava to automatically update a mileage log on Google Sheets! </p>
//       </div>

//         {/* Image Gallery – Beautiful Advertising Screenshots */}
//         <div className={styles.gallery}>

//           <div className={styles.card}>
//             <Image
//               src="/shoe.svg"
//               alt="Gallery Image"
//               width={100}
//               height={100}
//               priority
//             />
//           </div>
//           <div className={styles.card}>
//             <Image
//               src="/shoe.svg"
//               alt="Gallery Image"
//               width={100}
//               height={100}
//               priority
//             />
//           </div>
//           <div className={styles.card}>
//             <Image
//               src="/shoe.svg"
//               alt="Gallery Image"
//               width={100}
//               height={100}
//               priority
//             />
//           </div>
//           <div className={styles.card}>
//             <Image
//               src="/shoe.svg"
//               alt="Gallery Image"
//               width={100}
//               height={100}
//               priority
//             />
//           </div>
//         </div>

//         <div className={styles.btnContainer}>
//           <div className={styles.btnContent}>

//         {/* Logged in : Options */}
//         {session && (
//           <>
//                 <p className={styles.description}>Signed in through Strava as {session.user}</p>

//                 <div className={styles.btnGrid}>

//                     {csvData && (
//                         <CSVLink 
//                           data={csvData} 
//                           headers={headers}
//                           filename={"mileage.csv"}
//                           className={styles.btn}
//                         >
//                           Export Mileage as CSV
//                         </CSVLink>
//                     )}
                
                
//                 {/* GSheets logged in */}
//                 { gsheets_loggedin && (
//                   <>
//                     <button className={styles.btn} id={styles.btn2}> Export Mileage to Google Sheets </button>
//                     <div>
//                       <p className={styles.description}>
//                         Or if you want autoupdates, click the button below.
//                         This also creates a new sheet, but automatically updates it
//                         with new information from Strava.
//                       </p>                    
//                       <button className={styles.btn} id={styles.btn2}> Automatic Update Google Sheets </button>
//                     </div>
//                   </>
//                 )}

//                 {/* Gsheets not logged in */}
//                 { !gsheets_loggedin && (
//                 <>
//                   <button className={styles.btn} id={styles.btn2}>
//                     Connect to Google Sheets
//                   </button>
                  
//                 </>)}

//                 <button className={styles.btn} id={styles.btn2} onClick={() => signOut()}>
//                   Sign Out of Strava
//                 </button>
//               </div>
//           </>
//         )}



//         {/* Not logged in : Prompt */}
//         { !session && (
//             <>        
//                   <p className={styles.description}>
//                     Please authorize Strava to use the aforementioned services!
//                   </p>
        
//                   <button onClick={() => signIn()} className={styles.stravaBtn}>
//                     <Image
//                       src="/btn_strava_connectwith_orange.svg"
//                       alt="Connect with Strava"
//                       width={225}
//                       height={55}
//                     />
//                   </button>
//             </>
//         )}

//         </div>
//       </div>

//     </Layout>
//   )
// }


// {
//   "spreadsheetId": "1bYpwoHKZlTMvGQj0nipMWIcJ6jaeaNF52K8v8Q6kQ1w",
//   "properties": {
//     "title": "Untitled spreadsheet",
//     "locale": "en_US",
//     "autoRecalc": "ON_CHANGE",
//     "timeZone": "Etc/GMT",
//     "defaultFormat": {
//       "backgroundColor": {
//         "red": 1,
//         "green": 1,
//         "blue": 1
//       },
//       "padding": {
//         "top": 2,
//         "right": 3,
//         "bottom": 2,
//         "left": 3
//       },
//       "verticalAlignment": "BOTTOM",
//       "wrapStrategy": "OVERFLOW_CELL",
//       "textFormat": {
//         "foregroundColor": {},
//         "fontFamily": "arial,sans,sans-serif",
//         "fontSize": 10,
//         "bold": false,
//         "italic": false,
//         "strikethrough": false,
//         "underline": false,
//         "foregroundColorStyle": {
//           "rgbColor": {}
//         }
//       },
//       "backgroundColorStyle": {
//         "rgbColor": {
//           "red": 1,
//           "green": 1,
//           "blue": 1
//         }
//       }
//     },
//     "spreadsheetTheme": {
//       "primaryFontFamily": "Arial",
//       "themeColors": [
//         {
//           "colorType": "TEXT",
//           "color": {
//             "rgbColor": {}
//           }
//         },
//         {
//           "colorType": "BACKGROUND",
//           "color": {
//             "rgbColor": {
//               "red": 1,
//               "green": 1,
//               "blue": 1
//             }
//           }
//         },
//         {
//           "colorType": "ACCENT1",
//           "color": {
//             "rgbColor": {
//               "red": 0.25882354,
//               "green": 0.52156866,
//               "blue": 0.95686275
//             }
//           }
//         },
//         {
//           "colorType": "ACCENT2",
//           "color": {
//             "rgbColor": {
//               "red": 0.91764706,
//               "green": 0.2627451,
//               "blue": 0.20784314
//             }
//           }
//         },
//         {
//           "colorType": "ACCENT3",
//           "color": {
//             "rgbColor": {
//               "red": 0.9843137,
//               "green": 0.7372549,
//               "blue": 0.015686275
//             }
//           }
//         },
//         {
//           "colorType": "ACCENT4",
//           "color": {
//             "rgbColor": {
//               "red": 0.20392157,
//               "green": 0.65882355,
//               "blue": 0.3254902
//             }
//           }
//         },
//         {
//           "colorType": "ACCENT5",
//           "color": {
//             "rgbColor": {
//               "red": 1,
//               "green": 0.42745098,
//               "blue": 0.003921569
//             }
//           }
//         },
//         {
//           "colorType": "ACCENT6",
//           "color": {
//             "rgbColor": {
//               "red": 0.27450982,
//               "green": 0.7411765,
//               "blue": 0.7764706
//             }
//           }
//         },
//         {
//           "colorType": "LINK",
//           "color": {
//             "rgbColor": {
//               "red": 0.06666667,
//               "green": 0.33333334,
//               "blue": 0.8
//             }
//           }
//         }
//       ]
//     }
//   },
//   "sheets": [
//     {
//       "properties": {
//         "sheetId": 0,
//         "title": "Sheet1",
//         "index": 0,
//         "sheetType": "GRID",
//         "gridProperties": {
//           "rowCount": 1000,
//           "columnCount": 26
//         }
//       }
//     }
//   ],
//   "spreadsheetUrl": "https://docs.google.com/spreadsheets/d/1bYpwoHKZlTMvGQj0nipMWIcJ6jaeaNF52K8v8Q6kQ1w/edit"
// }