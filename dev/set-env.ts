require('dotenv').config();
const fs = require('fs');

const environment = process.env["ENVIRONMENT"] || 'dev';
const isProd = environment === 'prod';

const targetPath = '../src/environments/environment.ts';

const envConfigFile = `
export const environment = {
  production: ${isProd},
  firebase: {
    apiKey: "${process.env["FIREBASE_API_KEY"]}",
    authDomain: "${process.env["AUTH_DOMAIN"]}",
    projectId: "${process.env["PROJECT_ID"]}",
    storageBucket: "${process.env["STORAGE_BUCKET"]}",
    messagingSenderId: "${process.env["MESSAGING_SENDER_ID"]}",
    appId: "${process.env["APP_ID"]}",
    measurementId: "${process.env["MEASUREMENT_ID"]}",
    databaseURL: "${process.env["DATABASE_URL"]}"
  }
};
`;

fs.writeFileSync(targetPath, envConfigFile, 'utf8');

console.log(`Output generated at ${targetPath}`);
