import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Guarda jugador en el "salón"
export function entrarAlSalon({ nombre, transporte, piel, pelo, ropa, vidas }) {
  const id = (nombre || "anon").trim().toLowerCase().replace(/\s+/g, "_");
  const jugadorRef = ref(db, `salon/${id}`);

  const data = {
    id,
    nombre,
    transporte,
    piel,
    pelo,
    ropa,
    vidas: Number(vidas ?? 5),
    estado: "en salon",
    updatedAt: Date.now()
  };

  set(jugadorRef, data);

  // si cierra pestaña / se desconecta
  onDisconnect(jugadorRef).set({
    ...data,
    estado: "salio",
    updatedAt: Date.now()
  });

  return id;
}

// Escucha lista del salón (en vivo)
export function escucharSalon(callback) {
  const salonRef = ref(db, "salon");
  onValue(salonRef, (snapshot) => {
    const jugadores = [];
    snapshot.forEach((child) => jugadores.push(child.val()));
    callback(jugadores);
  });
}

