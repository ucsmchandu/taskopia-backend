const admin = require('firebase-admin')
// const serviceAccount=require('../../serviceAccount.json')
try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log("firebase connected")
} catch (err) {
    console.log(err)
}

module.exports = admin;