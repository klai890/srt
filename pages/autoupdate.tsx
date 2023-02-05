import React from 'react'
import Layout from '../components/Layout'
import styles from '../styles/Mileage.module.css'

function AutoUpdate() {
  return (
    <Layout>
        <div className={styles.pageHeader}>
        <h1 className={styles.h2}>Google Sheets Auto-Update – Coming Soon!</h1>
        <p> Auto-update a Google Sheet mileage log with each post to Strava! </p>
        </div>
    </Layout>
  )
}

export default AutoUpdate