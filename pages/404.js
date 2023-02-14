import Layout from "../components/Layout"

// pages/404.js
export default function Custom404() {
    return (
        <Layout>
            <div style={{
                'height': '100vh',
                'border': '1px solid black',
                'display': 'flex',
                'justifyContent': 'center',
                'alignItems': 'center',
                'textAlign': 'center'
            }}>
            {/* <div style={{'text-align': 'center'}}> */}
                <div>
                    <h1>404 - Page Not Found!</h1>
                    <p>Sorry for the inconvenience!</p>
                </div>
            </div>
        </Layout>
    )
}