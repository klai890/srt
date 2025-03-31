import React from 'react'
import Layout from '../components/Layout'
import styles from '../styles/Mileage.module.css'

function MileagePlot() {
  return (
    <Layout>
        <div className={styles.pageHeader}>
        <h1 className={styles.h2}>Mileage Plot</h1>
        <p> Track weekly mileage over the last 3 months! </p>
        </div>

        {/* Retrieve data */}

        {/* Plot data */}
    </Layout>
  )
}

export default MileagePlot;