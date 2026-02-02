// docs/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getDatabase, ref, set, update, get, onValue, push, serverTimestamp, remove
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD5Rx36FYLIi3nw09exLZrg3yU241DQ5gI",
  authDomain: "u07059.firebaseapp.com",
  databaseURL: "https://u07059-default-rtdb.firebaseio.com",
  projectId: "u07059",
  storageBucket: "u07059.firebasestorage.app",
  messagingSenderId: "155102720783",
  appId: "1:155102720783:web:30d81bcf84398d4316047a",
  measurementId: "G-PK5WL6ZX0C"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export const dbRef = ref;
export const dbSet = set;
export const dbUpdate = update;
export const dbGet = get;
export const dbOnValue = onValue;
export const dbPush = push;
export const dbTs = serverTimestamp;
export const dbRemove = remove;

// Helpers
export function qs(name) {
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
