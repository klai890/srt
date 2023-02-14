// pages/500.js
import Layout from "../components/Layout"

export default function Custom500() {
    return (
        <Layout>
            <div style={{
                'height': '100vh',
                'display': 'flex',
                'justifyContent': 'center',
                'alignItems': 'center',
                'textAlign': 'center'
            }}>
            {/* <div style={{'text-align': 'center'}}> */}
                <div>
                    <h1>500 - Server-side error occurred</h1>
                    <p>Sorry for the inconvenience!</p>
                </div>
            </div>
        </Layout>
    )
}