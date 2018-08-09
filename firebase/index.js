var firebase = require("firebase");
var admin = require("firebase-admin");
var serviceAccount = require("../firebase-creds.json");

const config = {
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
};

firebase.initializeApp(config);

const database = firebase.database();

exports.firebase = firebase;
exports.database = database;
