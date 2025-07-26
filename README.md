# SafeTalk

This project is an Expo application. Firebase configuration values are loaded from environment variables so sensitive keys are not committed to the repository.

Create a `.env` file at the project root and provide the following variables:

```
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

These values will be injected into the Expo config and accessed in the app via `expo-constants`.

Run the app with `npm start` or the usual Expo commands once the environment variables are set.