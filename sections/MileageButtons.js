import { useSession, signIn, signOut } from "next-auth/react";
import styles from "../styles/sections/MileageButtons.module.css";
import Image from "next/image";
import Link from "next/link";
import { headers } from "../lib/strava/api/mileage-csv";
import { CSVLink, CSVDownload } from "react-csv";

export default function MileageButtons({ csvData }) {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <div className={styles.btnContainer}>
          <div className={styles.btnContent}>
            <p className={styles.description}>
              Signed in through Strava as {session.user.name}
            </p>
            <p> CSV DATA: </p>
            <p> {csvData}</p>
            <div className={styles.btnGrid}>
              <button className={styles.btn} id={styles.btn1}>
                {csvData && (
                  <CSVLink data={csvData} headers={headers}>
                    Export CSV
                  </CSVLink>
                )}

                {/* <Link href="/api/csv">Export CSV</Link> */}
                {/* <CSVLink data={csvData} headers={headers}> Export CSV </CSVLink> */}
              </button>

              <button className={styles.btn} id={styles.btn2}>
                {" "}
                {/*onClick={() => signIn()} className={styles.stravaBtn}> */}
                Connect to Google Sheets
              </button>

              <button
                className={styles.btn}
                id={styles.btn2}
                onClick={() => signOut()}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className={styles.btnContainer}>
        <div className={styles.btnContent}>
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
        </div>
      </div>
    </>
  );
}
