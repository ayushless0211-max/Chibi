import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
// Version thik kiya (10.8.0)
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Aapka Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyCQLFU68k4uFoY8W25vw_QXr_NqITNFccM",
  authDomain: "fir-store-7a2d5.firebaseapp.com",
  projectId: "fir-store-7a2d5",
  storageBucket: "fir-store-7a2d5.firebasestorage.app",
  messagingSenderId: "426927884345",
  appId: "1:426927884345:web:a2e7dcfb81c9715860e5e8"
};

// Firebase ko initialize karein
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // <--- Yeh missing tha, ab add kar diya hai

const submit = document.getElementById('submit');

if (submit) {
  submit.addEventListener('click', function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value; // <--- Yahan .value lagaya
    
    alert("Creating...");

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up successfully
        const user = userCredential.user;
        alert("Account Successfully Ban Gaya!");
        window.location.href ="index.html";
      }) // <--- Yahan se semicolon (;) hata diya hai taaki catch sahi se chale
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
      });
  });
}
