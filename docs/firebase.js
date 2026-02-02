import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getDatabase, ref, set, update, push, remove, onValue, onDisconnect, serverTimestamp, get
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

// ✅ TU CONFIG REAL (la que me pegaste)
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

// Carpeta base en tu RTDB
const ROOT = "viajeDigital";
const PATH = {
  host: `${ROOT}/host`,
  lobby: `${ROOT}/lobby`,
  players: `${ROOT}/players`,
  leaderboard: `${ROOT}/leaderboard`,
  events: `${ROOT}/events`
};

function nowId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function clean(s, max=40){
  return (s ?? "").toString().trim().slice(0, max);
}

// ---------- HOST STATE ----------
export async function hostInit() {
  // crea defaults si no hay
  const r = ref(db, PATH.host);
  const snap = await get(r);
  if (!snap.exists()) {
    await set(r, {
      phase: "lobby",      // lobby | juego | fin
      startedAt: null,
      updatedAt: serverTimestamp()
    });
  }
}

export function hostListen(cb){
  return onValue(ref(db, PATH.host), s => cb(s.val() || {}));
}

export async function hostToLobby(){
  await update(ref(db, PATH.host), {
    phase: "lobby",
    startedAt: null,
    updatedAt: serverTimestamp()
  });
  await pushEvent("↩ La Licda regresó a Lobby.");
}

export async function hostStart(){
  await update(ref(db, PATH.host), {
    phase: "juego",
    startedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  await pushEvent("🚀 ¡Inició el juego! Todos a responder.");
}

export async function hostFinish(){
  await update(ref(db, PATH.host), {
    phase: "fin",
    updatedAt: serverTimestamp()
  });
  await pushEvent("🏁 El juego terminó.");
}

export async function hostResetAll(){
  await remove(ref(db, PATH.lobby));
  await remove(ref(db, PATH.players));
  await remove(ref(db, PATH.leaderboard));
  await remove(ref(db, PATH.events));
  await hostToLobby();
  await pushEvent("🧨 Reset total realizado.");
}

// ---------- EVENTS ----------
export async function pushEvent(texto){
  const t = clean(texto, 120);
  if(!t) return;
  await push(ref(db, PATH.events), { texto: t, at: serverTimestamp() });
}
export function eventsListen(cb){
  return onValue(ref(db, PATH.events), s => cb(s.val() || null));
}

// ---------- LOBBY / PLAYER ----------
export async function joinLobby(payload){
  const id = payload?.id || nowId();
  const nombre = clean(payload?.nombre, 30);
  if(!nombre) throw new Error("Nombre requerido");

  const base = {
    id,
    nombre,
    personaje: clean(payload?.personaje, 40),
    transporte: clean(payload?.transporte, 30),
    piel: clean(payload?.piel, 20),
    pelo: clean(payload?.pelo, 20),
    ropa: clean(payload?.ropa, 20),
    status: "online",
    joinedAt: serverTimestamp(),
    lastSeen: serverTimestamp()
  };

  // lobby visible
  await set(ref(db, `${PATH.lobby}/${id}`), base);

  // player state para juego
  await set(ref(db, `${PATH.players}/${id}`), {
    id,
    nombre,
    hearts: 5,
    score: 0,
    qIndex: 0,
    finished: false,
    updatedAt: serverTimestamp()
  });

  // auto “salida” cuando cierra la pestaña
  onDisconnect(ref(db, `${PATH.lobby}/${id}`)).update({
    status: "offline",
    lastSeen: serverTimestamp()
  });

  return id;
}

export async function pingLobby(id){
  if(!id) return;
  await update(ref(db, `${PATH.lobby}/${id}`), { lastSeen: serverTimestamp(), status: "online" });
}

export function lobbyListen(cb){
  return onValue(ref(db, PATH.lobby), s => cb(s.val() || null));
}

export function playersListen(cb){
  return onValue(ref(db, PATH.players), s => cb(s.val() || null));
}

export async function updatePlayer(id, patch){
  if(!id) return;
  await update(ref(db, `${PATH.players}/${id}`), { ...patch, updatedAt: serverTimestamp() });
}

export function leaderboardListen(cb){
  return onValue(ref(db, PATH.leaderboard), s => cb(s.val() || null));
}

export async function submitLeaderboard(id, nombre, score){
  const key = id || nowId();
  await set(ref(db, `${PATH.leaderboard}/${key}`), {
    id: key,
    nombre: clean(nombre, 30),
    score: Number(score || 0),
    at: serverTimestamp()
  });
}
