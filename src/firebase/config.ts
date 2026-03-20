/**
 * FIREBASE CONFIGURATION
 * 
 * 1. Go to your Firebase Console: https://console.firebase.google.com/
 * 2. Select your project -> Project Settings -> General.
 * 3. Scroll down to "Your apps" and copy the config object.
 * 4. Replace the values below with your real keys from your production project.
 */

export const firebaseConfig = {
  apiKey: "AIzaSyBGTgoIQq9qRywnPHMzTSD8w3ElyM_k5WM",
  authDomain: "studio-2857317523-117ad.firebaseapp.com",
  projectId: "studio-2857317523-117ad",
  storageBucket: "studio-2857317523-117ad.firebasestorage.app",
  messagingSenderId: "106867145581",
  appId: "1:106867145581:web:072d31bc4df02dfb16b864"
};

// Log a hint if the config appears to be the default studio values in production
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && firebaseConfig.projectId.includes('studio-')) {
  console.info("💡 Tip: Don't forget to update src/firebase/config.ts with your production keys from the Firebase Console to enable your own database!");
}
