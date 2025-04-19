# Firebase Setup for Netlify Deployment

## 1. Firebase Configuration

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select your existing project
3. Navigate to Project Settings (gear icon)
4. Under "Your apps", add a web app if you haven't already
5. Copy the Firebase configuration values

## 2. Firestore Database Setup

1. In the Firebase Console, go to Firestore Database
2. Create a database if you haven't already (start in test mode for development)
3. Create a collection named "entries"

## 3. Firestore Security Rules

Update your Firestore security rules to allow read/write access from your Netlify domain:

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /entries/{entryId} {
      allow read, write: if true;  // For testing only
      
      // For production, use this instead:
      // allow read, write: if request.auth != null || 
      //   request.origin.matches('https://your-netlify-domain.netlify.app') ||
      //   request.origin.matches('https://your-custom-domain.com');
    }
  }
}
\`\`\`

## 4. Netlify Environment Variables

1. Go to your Netlify dashboard
2. Select your site
3. Go to Site settings > Build & deploy > Environment
4. Add the following environment variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Fill in each with the corresponding value from your Firebase configuration.

## 5. Netlify Build Settings

1. In your Netlify dashboard, go to Site settings > Build & deploy > Continuous Deployment
2. Make sure the build command is set to `npm run build`
3. The publish directory should be `.next`
4. Add the Netlify Next.js plugin if it's not already added

## Troubleshooting

If you're still having issues:

1. Check the browser console for errors
2. Verify that all environment variables are set correctly
3. Make sure your Firestore security rules allow access from your Netlify domain
4. Try clearing your browser cache or using incognito mode
5. Check the Netlify deploy logs for any build errors
