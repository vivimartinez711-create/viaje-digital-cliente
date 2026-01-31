import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  onDisconnect,
  update,
  runTransaction,
  get
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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ===== Refs =====
export const salonRef = () => ref(db, "salon");
export const playerRef = (id) => ref(db, `salon/${id}`);
export const controlRef = () => ref(db, "control");

// ===== Lobby / Presencia =====
export function entrarAlSalon({ nombre, transporte, piel, pelo, ropa, generoAuto, generoManual }) {
  const cleanName = (nombre || "Anon").trim();
  const id = cleanName.toLowerCase().replace(/\s+/g, "_");

  const data = {
    id,
    nombre: cleanName,
    transporte,
    piel,
    pelo,
    ropa,
    generoAuto: generoAuto || "auto",
    genero: generoManual || "auto",
    vidas: 5,
    score: 0,
    estado: "en_salon",
    nivel: "lobby",
    ultimo: { qid: "", correcto: null, at: 0 },
    updatedAt: Date.now()
  };

  const r = playerRef(id);
  set(r, data);

  onDisconnect(r).update({
    estado: "salio",
    updatedAt: Date.now()
  });

  return id;
}

export function escucharSalon(callback) {
  onValue(salonRef(), (snapshot) => {
    const jugadores = [];
    snapshot.forEach((child) => jugadores.push(child.val()));
    callback(jugadores);
  });
}

export function escucharControl(callback) {
  onValue(controlRef(), (snap) => {
    callback(snap.val() || {});
  });
}

// ===== Host Control =====
export async function hostSetControl(patch) {
  await update(controlRef(), { ...patch, updatedAt: Date.now() });
}

// ===== Juego: responder (atómico) =====
// Regla: incorrecto o timeout => -2 vidas. Correcto => +puntos.
export async function submitAnswer({ playerId, qid, selected, correct, points }) {
  const r = playerRef(playerId);

  await runTransaction(r, (p) => {
    if (!p) return p;

    // Si ya está fuera, no cambia
    if (p.vidas <= 0) return p;

    // Evitar doble respuesta por la misma pregunta
    if (p.ultimo?.qid === qid) return p;

    const now = Date.now();
    const isCorrect = !!correct;

    const deltaLives = isCorrect ? 0 : -2; // “mitad” jugable
    const newLives = Math.max(0, (Number(p.vidas) || 5) + deltaLives);

    const addScore = isCorrect ? Number(points || 100) : 0;
    const newScore = (Number(p.score) || 0) + addScore;

    p.vidas = newLives;
    p.score = newScore;
    p.ultimo = { qid, correcto: isCorrect, at: now, selected: selected ?? "" };
    p.updatedAt = now;

    if (newLives === 0) {
      p.estado = "eliminado";
    }

    return p;
  });
}

// ===== Utilidad: leer un jugador =====
export async function getPlayer(playerId) {
  const s = await get(playerRef(playerId));
  return s.val();
}
