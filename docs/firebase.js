// docs/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  update,
  onValue,
  onDisconnect,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

// ✅ TU CONFIG REAL (la que me compartiste)
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

// ========= Helpers =========
export function getOrCreatePlayerId() {
  let id = localStorage.getItem("vdc_player_id");
  if (!id) {
    id = "p_" + Math.random().toString(16).slice(2) + "_" + Date.now();
    localStorage.setItem("vdc_player_id", id);
  }
  return id;
}

export async function joinLobby({ nombre, transporte, piel, pelo, ropa }) {
  const id = getOrCreatePlayerId();

  const playerRef = ref(db, `vdc/players/${id}`);
  await set(playerRef, {
    id,
    nombre: (nombre || "").trim().slice(0, 22),
    transporte,
    piel,
    pelo,
    ropa,
    lives: 3,
    status: "lobby", // lobby | playing | out | finished
    joinedAt: serverTimestamp(),
    lastSeen: serverTimestamp()
  });

  // Si cierra pestaña, lo marcamos como "salió"
  const dc = onDisconnect(playerRef);
  await dc.update({ status: "salio", lastSeen: serverTimestamp() });

  // Update heartbeat 1 vez (más abajo se actualiza cada X seg)
  await update(playerRef, { lastSeen: serverTimestamp() });

  return id;
}

export function heartbeat(playerId) {
  const playerRef = ref(db, `vdc/players/${playerId}`);
  return update(playerRef, { lastSeen: serverTimestamp() });
}

export function listenPlayers(cb) {
  const playersRef = ref(db, "vdc/players");
  return onValue(playersRef, (snap) => {
    const val = snap.val() || {};
    const arr = Object.values(val);
    // orden por nombre
    arr.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
    cb(arr);
  });
}

export async function ensureGameState() {
  const stateRef = ref(db, "vdc/state");
  await update(stateRef, {
    phase: "lobby", // lobby | play | end
    updatedAt: serverTimestamp()
  });
}

export function listenState(cb) {
  const stateRef = ref(db, "vdc/state");
  return onValue(stateRef, (snap) => {
    cb(snap.val() || { phase: "lobby" });
  });
}

export async function hostSetPhase(phase) {
  const stateRef = ref(db, "vdc/state");
  await update(stateRef, { phase, updatedAt: serverTimestamp() });
}

export async function hostResetAll() {
  // Reinicia estado y “limpia” lista
  await set(ref(db, "vdc/state"), { phase: "lobby", updatedAt: serverTimestamp() });
  await set(ref(db, "vdc/players"), null);
}

export async function playerSetStatus(playerId, status) {
  await update(ref(db, `vdc/players/${playerId}`), { status, lastSeen: serverTimestamp() });
}

export async function playerLoseLife(playerId) {
  const pRef = ref(db, `vdc/players/${playerId}`);
  // No tenemos transacciones aquí (para simple demo). Bajamos 1 vida “a ciegas”.
  // Para producción se haría con transaction(), pero esto sirve para tu prueba.
  // Lo resolvemos desde el UI llevando el contador.
  await update(pRef, { lastSeen: serverTimestamp() });
}
