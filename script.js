// 1. Firebase ki required cheezein import karein (Hamesha top par)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


// 2. Aapka Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyCQLFU68k4uFoY8W25vw_QXr_NqITNFccM",
  authDomain: "fir-store-7a2d5.firebaseapp.com",
  projectId: "fir-store-7a2d5",
  storageBucket: "fir-store-7a2d5.firebasestorage.app",
  messagingSenderId: "426927884345",
  appId: "1:426927884345:web:a2e7dcfb81c9715860e5e8"
};

// 3. Firebase ko initialize karein
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// 4. Grabbing HTML DOM Elements
const openBtn = document.getElementById('menuOpenBtn');
const closeBtn = document.getElementById('menuCloseBtn');
const sideMenu = document.getElementById('sideMenu');
const backdrop = document.getElementById('menuBackdrop');
const authBtn = document.getElementById('login-btn'); 
// Purane buttons ke niche is line ko daal dein
const cartNavBtn = document.getElementById('cart-nav-btn');


// FIXED: Purane single productGrid ki jagah dono alag grids ko grab kiya
const jjkGrid = document.getElementById('jjkProductGrid');
const narutoGrid = document.getElementById('narutoProductGrid');


// 5. Navigation Menu Functions
function openNavMenu() {
  sideMenu.classList.add('is-active');
  backdrop.classList.add('is-active');
  document.body.style.overflow = 'hidden'; 
}

function closeNavMenu() {
  sideMenu.classList.remove('is-active');
  backdrop.classList.remove('is-active');
  document.body.style.overflow = ''; 
}

// Global Event Listeners for Menu
if (openBtn) openBtn.addEventListener('click', openNavMenu);
if (closeBtn) closeBtn.addEventListener('click', closeNavMenu);
if (backdrop) backdrop.addEventListener('click', closeNavMenu);


// 6. Asynchronous function to handle database mapping loops
// FIXED: Yeh ek generic (reusable) function ban gaya hai jo dono categories ko handle karega
// 6. Asynchronous function to handle database mapping loops
async function loadAnimeProducts(collectionName, targetGrid, preloaderId) {
  if (!targetGrid) return; 

  try {
    const querySnapshot = await getDocs(collection(db, collectionName));

    if (querySnapshot.empty) {
      targetGrid.innerHTML = "<p style='padding:20px;'>No products found in this category.</p>";
      removeGridPreloader(preloaderId);
      return;
    }

    // Saare products ko loop karke target grid ke andar append karein
    querySnapshot.forEach((doc) => {
      const productData = doc.data();
      const cardDiv = document.createElement("div");
      cardDiv.className = "card";

      // Screenshot verification ke mutabik fields mapping check ki gayi hai
      // href ke andar humne id ke saath &cat=${collectionName} bhi jodh diya hai
cardDiv.innerHTML = `
  <a href="product-detail.html?id=${productData.id || ''}&cat=${collectionName}" class="card-link-wrapper">
    <img src="${productData.img || ''}" alt="${productData.title || 'Anime Model'}">
    <p class="description">${productData.title || 'Untitled Product'}</p>
  </a>
  <button class="addToCart" data-id="${productData.id || ''}">Add to cart</button>
`;


      targetGrid.appendChild(cardDiv);
    });

    // Cart buttons listener load karein
    attachCartButtonListeners();
    
    // Smooth parda hatao
    removeGridPreloader(preloaderId);

  } catch (error) {
    console.error(`Database connection failure for ${collectionName}: `, error);
    targetGrid.innerHTML = `<p style='padding: 20px; color: red;'>Failed to load data. Check browser console.</p>`;
    removeGridPreloader(preloaderId);
  }
}

// Grid Preloader ko smooth fade-out karne ka reusable function
function removeGridPreloader(preloaderId) {
  const gridLoader = document.getElementById(preloaderId);
  if (gridLoader) {
    gridLoader.style.opacity = '0'; // Pehle fade out transition hoga
    setTimeout(() => {
      gridLoader.remove(); // 300ms ke baad DOM se complete remove
    }, 300);
  }
}

function attachCartButtonListeners() {
  const cartButtons = document.querySelectorAll('.addToCart');
  cartButtons.forEach(button => {
    button.onclick = (event) => {
      event.preventDefault(); 
      const productId = button.getAttribute('data-id');
      alert(`Item (${productId}) added to cart successfully!`);
    };
  });
}


// 7. Firebase Authentication Logic
//new
onAuthStateChanged(auth, (user) => {
    if (!authBtn) return; 

    if (user) {
        // 1. Agar user logged in hai, toh logout button dikhao
        authBtn.innerText = "Logout";
        authBtn.href = "#"; 
        
        // 2. NAYA STEP: Cart icon par click karne par user direct 'cart.html' par jayega
        if (cartNavBtn) {
            cartNavBtn.href = "cart.html"; 
            cartNavBtn.onclick = null; // Purana koi handler ho toh clear karein
        }

        authBtn.onclick = (e) => {
            e.preventDefault(); 
            signOut(auth).then(() => {
                alert("Logged out successfully!");
                window.location.reload(); 
            }).catch((error) => console.error("Logout error: ", error));
        };
    } else {
        // 3. Agar user login nahi hai, toh login button dikhao
        authBtn.innerText = "Login";
        authBtn.href = "login.html"; 
        authBtn.onclick = null; 

        // 4. NAYA STEP: Agar user bina login ke cart par click karega, toh wo 'login.html' par bhej diya jayega
        if (cartNavBtn) {
            cartNavBtn.href = "login.html";
        }
    }
});



// ==================== EXECUTION CALLS ====================
// Dono categories ko parallel me unke respective preloader IDs ke sath trigger kiya
loadAnimeProducts("jjk-products", jjkGrid, "jjkGridPreloader");
loadAnimeProducts("naruto-products", narutoGrid, "narutoGridPreloader");
