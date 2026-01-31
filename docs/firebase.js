import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue, onDisconnect } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD5Rx36FYLIi3nw09exLZrg3yU24IDQ5gI",
  authDomain: "u07059.firebaseapp.com",
  databaseURL: "https://u07059-default-rtdb.firebaseio.com",
  projectId: "u07059",
  storageBucket: "u07059.appspot.com",
  messagingSenderId: "155102720783",
  appId: "1:155102720783:web:30d81bcf84398d4316047a"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export function entrarAlSalon(nombre) {
  const id = nombre.toLowerCase().replace(/\s+/g, "_");
  const usuarioRef = ref(db, "salon/" + id);

  set(usuarioRef, { nombre, estado: "en clase", tiempo: Date.now() });

  onDisconnect(usuarioRef).set({ nombre, estado: "salió", tiempo: Date.now() });
}

export function escucharSalon(callback) {
  const salonRef = ref(db, "salon");
  onValue(salonRef, (snapshot) => {
    const lista = [];
    snapshot.forEach((child) => lista.push(child.val()));
    callback(lista);
  });
}

