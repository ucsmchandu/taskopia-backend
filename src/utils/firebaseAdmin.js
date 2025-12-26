const admin = require('firebase-admin')
// const serviceAccount=require('../../serviceAccount.json')
try {
    const decoded = Buffer
        .from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, "base64")
        .toString("utf8");
    const serviceAccount = JSON.parse(decoded)
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log("firebase connected")
} catch (err) {
    console.log(err)
}

module.exports = admin;