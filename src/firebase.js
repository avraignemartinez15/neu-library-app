import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA8vBkgNRtHvrKBLUV_rVHshAJqtQ_s5lM",
  authDomain: "neu-library-visitor-c4916.firebaseapp.com",
  databaseURL: "https://neu-library-visitor-c4916-default-rtdb.firebaseio.com",
  projectId: "neu-library-visitor-c4916",
  storageBucket: "neu-library-visitor-c4916.firebasestorage.app",
  messagingSenderId: "405001259938",
  appId: "1:405001259938:web:c5798420819dd0810380fb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getDatabase(app);

// Test connection
get(ref(getDatabase(app), "colleges")).then(snap => {
  console.log("Firebase test - exists:", snap.exists());
  console.log("Firebase test - val:", snap.val());
}).catch(err => console.log("Firebase test error:", err));