import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getDatabase, ref, set, update, onValue, push, remove, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

// ✅ TU CONFIG (la que me pegaste)
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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Rutas en RTDB
const HOST_PATH = "viajeDigital/host";
const LOBBY_PATH = "viajeDigital/lobby";
const EVENTS_PATH = "viajeDigital/events";

// ---------------- HOST ----------------
export async function hostEnsureDefaults() {
  const r = ref(db, HOST_PATH);
  // set por defecto SOLO si no existe: lo hacemos con update suave
  await update(r, {
    fase: "lobby",
    start: false,
    updatedAt: serverTimestamp()
  });
}

export function hostListen(cb) {
  onValue(ref(db, HOST_PATH), (snap) => cb(snap.val()), (err) => console.error("hostListen", err));
}

export async function hostStartGame() {
  await update(ref(db, HOST_PATH), {
    fase: "juego",
    start: true,
    updatedAt: serverTimestamp()
  });
}

export async function hostBackToLobby() {
  await update(ref(db, HOST_PATH), {
    fase: "lobby",
    start: false,
    updatedAt: serverTimestamp()
  });
}

export async function hostResetAll() {
  await remove(ref(db, LOBBY_PATH));
  await remove(ref(db, EVENTS_PATH));
  await set(ref(db, HOST_PATH), {
    fase: "lobby",
    start: false,
    updatedAt: serverTimestamp()
  });
}

// --------------- LOBBY (alumnos) ---------------
export async function lobbyJoin(player) {
  const id = player.id;
  if (!id) throw new Error("player.id requerido");

  await set(ref(db, `${LOBBY_PATH}/${id}`), {
    ...player,
    status: "activo",
    joinedAt: Date.now(),
    lastSeen: Date.now()
  });
}

export async function lobbyPing(id) {
  if (!id) return;
  await update(ref(db, `${LOBBY_PATH}/${id}`), { lastSeen: Date.now(), status: "activo" });
}

export async function lobbyLeave(id) {
  if (!id) return;
  await update(ref(db, `${LOBBY_PATH}/${id}`), { status: "salio", lastSeen: Date.now() });
}

export function lobbyListen(cb) {
  onValue(ref(db, LOBBY_PATH), (snap) => cb(snap.val()), (err) => console.error("lobbyListen", err));
}

// --------------- EVENTOS ---------------
export async function pushEvent(texto) {
  const r = push(ref(db, EVENTS_PATH));
  await set(r, { texto, ts: Date.now() });
}

export function eventsListen(cb) {
  onValue(ref(db, EVENTS_PATH), (snap) => cb(snap.val()), (err) => console.error("eventsListen", err));
}

