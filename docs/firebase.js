// /docs/firebase.js  ✅ (ESM)
// Firebase v10 modular via CDN (sirve en GitHub Pages)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  onDisconnect,
  serverTimestamp,
  remove,
  update
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

// ✅ Tu config REAL (la que me pegaste)
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
export const db = getDatabase(app);

// RUTAS DB
const rPhase = ref(db, "control/phase");         // "lobby" | "game" | "end"
const rPlayers = ref(db, "lobby/players");       // lista jugadores
const rEvents = ref(db, "events/last");          // texto último evento

// Helpers
const uid = () => "p_" + Math.random().toString(36).slice(2) + Date.now().toString(36);

// ✅ Unirse al lobby
export async function joinLobby({ name, personaje, transporte, piel, pelo, blusa }) {
  const playerId = uid();
  const meRef = ref(db, `lobby/players/${playerId}`);

  await set(meRef, {
    name,
    personaje,
    transporte,
    piel,
    pelo,
    blusa,
    lives: 5,
    joinedAt: serverTimestamp()
  });

  // ✅ si se cierra pestaña, se borra solo
  onDisconnect(meRef).remove();

  return { playerId };
}

// ✅ Escuchar lobby (lista + conteo)
export function listenLobby(callback) {
  return onValue(rPlayers, (snap) => {
    const val = snap.val() || {};
    const arr = Object.entries(val).map(([id, p]) => ({ id, ...p }));
    callback(arr);
  });
}

// ✅ Escuchar fase
export function listenPhase(callback) {
  return onValue(rPhase, (snap) => {
    callback(snap.val() || "lobby");
  });
}

// ✅ Host: mandar a Lobby
export async function hostToLobby() {
  await set(rPhase, "lobby");
  await set(rEvents, "📣 La Licda mandó a todos al Lobby");
}

// ✅ Host: iniciar juego
export async function hostStart() {
  await set(rPhase, "game");
  await set(rEvents, "🎮 ¡Inició el juego! Entren a jugar");
}

// ✅ Host: reset total (borra players y vuelve a lobby)
export async function hostResetAll() {
  await remove(rPlayers);
  await set(rPhase, "lobby");
  await set(rEvents, "🔁 Reset realizado (se limpió el lobby)");
}

// ✅ Eventos
export function listenEvents(callback) {
  return onValue(rEvents, (snap) => callback(snap.val() || "Aún no hay eventos..."));
}
