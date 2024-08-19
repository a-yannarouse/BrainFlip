// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBRAQl3AJjFrcjMrPqJVApjoC3FQB1v0OA",
  authDomain: "brain-flip-c0c92.firebaseapp.com",
  projectId: "brain-flip-c0c92",
  storageBucket: "brain-flip-c0c92.appspot.com",
  messagingSenderId: "369740210833",
  appId: "1:369740210833:web:6ff9fe86da5c386cdcd530",
  measurementId: "G-3F64VTG3EJ"
};
let analytics;
// Initialize Firebase
if (typeof window !== 'undefined' && !getApps().length) {
  if (process.env.NODE_ENV === 'production') {
    analytics = getAnalytics(app);
  }
}
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };