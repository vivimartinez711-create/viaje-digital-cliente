import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  update,
  push,
  onValue,
  remove,
  onDisconnect,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// ✅ TU CONFIG (u07059)
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

const PATH = {
  session: "session",
  players: "players",
  events: "events",
  answers: "answers",
};

export {
  db,
  ref,
  set,
  update,
  push,
  onValue,
  remove,
  onDisconnect,
  serverTimestamp
};

export function listenSession(cb) {
  return onValue(ref(db, PATH.session), (snap) => cb(snap.val() || {}));
}

export function setSession(data) {
  // data ej: { phase:"lobby", startedAt: serverTimestamp() }
  return update(ref(db, PATH.session), data);
}

export function setPhase(phase) {
  return update(ref(db, PATH.session), { phase, updatedAt: serverTimestamp() });
}

export function joinLobby(playerId, playerData) {
  // playerData ej: { name, vidas, personaje, piel, pelo, camisa, transporte }
  const playerRef = ref(db, ${PATH.players}/${playerId});
  // si cierran pestaña: lo borra (opcional pero recomendado)
  onDisconnect(playerRef).remove();
  return set(playerRef, {
    ...playerData,
    online: true,
    updatedAt: serverTimestamp()
  });
}

export function updatePlayer(playerId, patch) {
  return update(ref(db, ${PATH.players}/${playerId}), {
    ...patch,
    updatedAt: serverTimestamp()
  });
}

export function leaveLobby(playerId) {
  return remove(ref(db, ${PATH.players}/${playerId}));
}

export function listenPlayers(cb) {
  return onValue(ref(db, PATH.players), (snap) => cb(snap.val() || {}));
}

export function addEvent(text) {
  const evRef = push(ref(db, PATH.events));
  return set(evRef, {
    text,
    at: serverTimestamp()
  });
}

export function listenEvents(cb) {
  return onValue(ref(db, PATH.events), (snap) => {
    const data = snap.val() || {};
    // convierte a array ordenado por inserción
    const list = Object.entries(data).map(([id, v]) => ({ id, ...v }));
    cb(list);
  });
}

export function submitAnswer(playerId, payload) {
  // payload ej: { qId, answer, correct, points }
  const ansRef = push(ref(db, ${PATH.answers}/${playerId}));
  return set(ansRef, { ...payload, at: serverTimestamp() });
}

export async function hostResetAll() {
  // Limpia todo para iniciar de cero
  await set(ref(db, PATH.session), {
    phase: "lobby",
    updatedAt: serverTimestamp()
  });
  await remove(ref(db, PATH.players));
  await remove(ref(db, PATH.events));
  await remove(ref(db, PATH.answers));
}
