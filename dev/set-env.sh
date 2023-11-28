#!/bin/bash

# Set environment variables
ENVIRONMENT=${ENVIRONMENT:-dev}
FIREBASE_API_KEY=${FIREBASE_API_KEY}
AUTH_DOMAIN=${AUTH_DOMAIN}
PROJECT_ID=${PROJECT_ID}
STORAGE_BUCKET=${STORAGE_BUCKET}
MESSAGING_SENDER_ID=${MESSAGING_SENDER_ID}
APP_ID=${APP_ID}
MEASUREMENT_ID=${MEASUREMENT_ID}
DATABASE_URL=${DATABASE_URL}

# Determine if the environment is production
if [ "$ENVIRONMENT" = "prod" ]; then
    IS_PROD=true
else
    IS_PROD=false
fi

# Ensure environments directory exists
if [ ! -d "../src/environments" ]; then
  mkdir -p ../src/environments
fi

# File path
TARGET_PATH=../src/environments/environment.ts

echo "Current Directory: $(pwd)"

# Create the file with environment variables
echo "export const environment = {" > $TARGET_PATH
echo "  production: $IS_PROD," >> $TARGET_PATH
echo "  firebase: {" >> $TARGET_PATH
echo "    apiKey: \"$FIREBASE_API_KEY\"," >> $TARGET_PATH
echo "    authDomain: \"$AUTH_DOMAIN\"," >> $TARGET_PATH
echo "    projectId: \"$PROJECT_ID\"," >> $TARGET_PATH
echo "    storageBucket: \"$STORAGE_BUCKET\"," >> $TARGET_PATH
echo "    messagingSenderId: \"$MESSAGING_SENDER_ID\"," >> $TARGET_PATH
echo "    appId: \"$APP_ID\"," >> $TARGET_PATH
echo "    measurementId: \"$MEASUREMENT_ID\"," >> $TARGET_PATH
echo "    databaseURL: \"$DATABASE_URL\"" >> $TARGET_PATH
echo "  }" >> $TARGET_PATH
echo "};" >> $TARGET_PATH

# Output the result
echo "Output generated at $TARGET_PATH"
