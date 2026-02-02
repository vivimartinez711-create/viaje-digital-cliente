// documentos/firebase.js  (sin imports, GitHub Pages compatible)
(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyD5Rx36FYLIi3nw09exLZrg3yU241DQ5gI",
    authDomain: "u07059.firebaseapp.com",
    databaseURL: "https://u07059-default-rtdb.firebaseio.com",
    projectId: "u07059",
    storageBucket: "u07059.firebasestorage.app",
    messagingSenderId: "155102720783",
    appId: "1:155102720783:web:30d81bcf84398d4316047a"
  };

  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  window.DB = firebase.database();
})();
