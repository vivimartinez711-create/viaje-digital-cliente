import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  update,
  serverTimestamp,
  onDisconnect
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD5Rx36FYLIi3nw09exLZrg3yU241DQ5gI",
  authDomain: "u07059.firebaseapp.com",
  databaseURL: "https://u07059-default-rtdb.firebaseio.com",
  projectId: "u07059",
  storageBucket: "u07059.firebasestorage.app",
  messagingSenderId: "155102720783",
  appId: "1:155102720783:web:30d81bcf84398d4316047a"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export { ref, set, onValue, update, serverTimestamp, onDisconnect };
