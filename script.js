// 1. Firebase ki required cheezein import karein (Hamesha top par)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
// FIXED: Added missing "www." into the CDN URL address below
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
const productGrid = document.getElementById('productGrid');


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
// 6. Asynchronous function to handle database mapping loops
async function loadProductsFromDatabase() {
  if (!productGrid) return; 

  try {
    // FIXED: Ab hum innerHTML ko saaf nahi karenge, varna humara white preloader delete ho jayega!
    const querySnapshot = await getDocs(collection(db, "products"));

    if (querySnapshot.empty) {
      productGrid.innerHTML = "<p style='padding:20px;'>No products found in database.</p>";
      removeGridPreloader(); // Loader hatao agar data khali hai
      return;
    }

    // Saare products ko loop karke add karein (Yeh preloader ke peeche add hote rahenge)
    querySnapshot.forEach((doc) => {
      const productData = doc.data();
      const cardDiv = document.createElement("div");
      cardDiv.className = "card";

      cardDiv.innerHTML = `
        <a href="product-detail.html?id=${productData.id}" class="card-link-wrapper">
          <img src="${productData.img}" alt="${productData.description || 'Product Image'}">
          <p class="description">${productData.title}</p>
        </a>
        <button class="addToCart" data-id="${productData.id}">Add to cart</button>
      `;

      productGrid.appendChild(cardDiv);
    });

    attachCartButtonListeners();
    
    // SUCCESS: Saare cards append hone ke baad white screen parda hatao
    removeGridPreloader();

  } catch (error) {
    console.error("Database connection failure: ", error);
    productGrid.innerHTML = `<p style='padding: 20px; color: red;'>Failed to load product data catalog. Check browser console.</p>`;
    removeGridPreloader(); // Error aane par bhi loader hatao taaki screen freeze na dikhe
  }
}

// Grid Preloader ko smooth fade-out karne ka helper function
function removeGridPreloader() {
  const gridLoader = document.getElementById('gridPreloader');
  if (gridLoader) {
    gridLoader.style.opacity = '0'; // Pehle dhundhla karega
    setTimeout(() => {
      gridLoader.remove(); // 300ms ke baad DOM se poori tarah delete kar dega
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
onAuthStateChanged(auth, (user) => {
    if (!authBtn) return; 

    if (user) {
        authBtn.innerText = "Logout";
        authBtn.href = "#"; 
        
        authBtn.onclick = (e) => {
            e.preventDefault(); 
            
            signOut(auth).then(() => {
                alert("Logged out successfully!");
                window.location.reload(); 
            }).catch((error) => {
                console.error("Logout error: ", error);
            });
        };
    } else {
        authBtn.innerText = "Login";
        authBtn.href = "login.html"; 
        authBtn.onclick = null; 
    }
});

loadProductsFromDatabase();


import { addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"; // Yeh top par check kar lena

async function migrateCollection() {
  try {
      console.log("Migration shuru ho gayi hai...");
          
              // 1. Purane 'products' collection se saara data nikaalo
                  const oldSnapshot = await getDocs(collection(db, "products"));
                      
                          if (oldSnapshot.empty) {
                                console.log("Purane collection me koi data nahi mila!");
                                      return;
                                          }

                                              // 2. Ek-ek karke saare documents ko naye 'jjk-products' me daalo
                                                  const newCollectionRef = collection(db, "jjk-products");
                                                      
                                                          for (const docRef of oldSnapshot.docs) {
                                                                const data = docRef.data();
                                                                      await addDoc(newCollectionRef, data);
                                                                            console.log(`${data.title || 'Product'} ko jjk-products me copy kar diya.`);
                                                                                }

                                                                                    alert("Saara data 'jjk-products' me successfully copy ho gaya hai! Ab aap Firebase Console me jaakar purana 'products' collection manually delete kar sakte hain.");

                                                                                      } catch (error) {
                                                                                          console.error("Migration me error aaya: ", error);
                                                                                            }
                                                                                            }

                                                                                            // ISE RUN KARNE KE LIYE UNCOMMENT KAREIN (Page ek baar load hote hi ise wapas comment/delete kar dena)
                                                                                             migrateCollection();
