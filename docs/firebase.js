import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  update,
  push,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  serverTimestamp,
  remove,
  get
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

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

// Init
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =====================
// Helpers / Paths
// =====================
const ROOT = "viaje_digital";         // carpeta base en tu RTDB
const lobbyPath = `${ROOT}/lobby`;    // alumnos conectados
const hostPath  = `${ROOT}/host`;     // control del host (fase, start, etc.)
const eventsPath = `${ROOT}/eventos`; // eventos para todos

function cleanName(s) {
  return (s || "").toString().trim().slice(0, 40);
}

function nowId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

// =====================
// LOBBY (alumnos)
// =====================

/**
 * Crea/actualiza un alumno como "conectado" en el lobby.
 * Devuelve: { id, refPath }
 */
export async function lobbyJoin(data) {
  const nombre = cleanName(data?.nombre);
  if (!nombre) throw new Error("Nombre requerido");

  const id = data?.id || nowId();
  const r = ref(db, `${lobbyPath}/${id}`);

  const payload = {
    nombre,
    personaje: data?.personaje || "",
    transporte: data?.transporte || "",
    piel: data?.piel || "",
    pelo: data?.pelo || "",
    ropa: data?.ropa || "",
    status: "online",
    joinedAt: serverTimestamp(),
    lastSeen: serverTimestamp()
  };

  await set(r, payload);
  return { id, refPath: `${lobbyPath}/${id}` };
}

/**
 * Marca actividad (para que no se vea como muerto)
 */
export async function lobbyPing(id) {
  if (!id) return;
  await update(ref(db, `${lobbyPath}/${id}`), {
    lastSeen: serverTimestamp(),
    status: "online"
  });
}

/**
 * Marca salida del alumno (no lo borra, solo status)
 */
export async function lobbyLeave(id) {
  if (!id) return;
  await update(ref(db, `${lobbyPath}/${id}`), {
    status: "salio",
    leftAt: serverTimestamp()
  });
}

/**
 * Escucha la lista completa del lobby.
 * callback recibe: (obj) donde obj = {id: {datos...}, ...} o null
 */
export function lobbyListen(callback) {
  const r = ref(db, lobbyPath);
  return onValue(r, (snap) => callback(snap.val()));
}

// =====================
// HOST CONTROL (fase / start / etc.)
// =====================

/**
 * Inicializa estado host si no existe.
 */
export async function hostEnsureDefaults() {
  const r = ref(db, hostPath);
  const snap = await get(r);
  if (!snap.exists()) {
    await set(r, {
      fase: "lobby",        // lobby | juego | fin
      start: false,
      pin: "2026",
      updatedAt: serverTimestamp()
    });
  }
}

/**
 * Lee estado del host en vivo.
 */
export function hostListen(callback) {
  const r = ref(db, hostPath);
  return onValue(r, (snap) => callback(snap.val()));
}

/**
 * Cambia la fase (ej: "lobby" o "juego")
 */
export async function hostSetFase(fase) {
  await update(ref(db, hostPath), {
    fase,
    updatedAt: serverTimestamp()
  });
}

/**
 * Inicia el juego (esto es lo que hace que los alumnos pasen a juego.html)
 */
export async function hostStartGame() {
  await update(ref(db, hostPath), {
    fase: "juego",
    start: true,
    startedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

/**
 * Regresa a lobby (para reiniciar)
 */
export async function hostBackToLobby() {
  await update(ref(db, hostPath), {
    fase: "lobby",
    start: false,
    updatedAt: serverTimestamp()
  });
}

/**
 * Resetea TODO (lobby + eventos + host a lobby)
 */
export async function hostResetAll() {
  // borra lista lobby y eventos
  await remove(ref(db, lobbyPath));
  await remove(ref(db, eventsPath));

  // reinicia host
  await set(ref(db, hostPath), {
    fase: "lobby",
    start: false,
    pin: "2026",
    updatedAt: serverTimestamp()
  });
}

// =====================
// EVENTOS (para todos)
// =====================

/**
 * Crea un evento visible para todos (ej: "La Licda inició el juego")
 */
export async function pushEvent(texto) {
  const t = (texto || "").toString().trim().slice(0, 120);
  if (!t) return;

  await push(ref(db, eventsPath), {
    texto: t,
    at: serverTimestamp()
  });
}

/**
 * Escucha eventos (últimos)
 */
export function eventsListen(callback) {
  return onValue(ref(db, eventsPath), (snap) => callback(snap.val()));
}

// Export db por si algún archivo lo necesita
export { db, ref };
