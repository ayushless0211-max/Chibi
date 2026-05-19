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
const cartNavBtn = document.getElementById('cart-nav-btn');

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

if (openBtn) openBtn.addEventListener('click', openNavMenu);
if (closeBtn) closeBtn.addEventListener('click', closeNavMenu);
if (backdrop) backdrop.addEventListener('click', closeNavMenu);

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

    querySnapshot.forEach((doc) => {
      const productData = doc.data();
      const cardDiv = document.createElement("div");
      cardDiv.className = "card";

      // SURAKSHA CHECK: Numeric conversion ensure karne ke liye taaki Load failed error na aaye
      const numericPrice = productData.price ? productData.price.toString() : "₹999";

      cardDiv.innerHTML = `
        <a href="product-detail.html?id=${productData.id || ''}&cat=${collectionName}" class="card-link-wrapper">
          <img src="${productData.img || ''}" alt="${productData.title || 'Anime Model'}">
          <p class="description">${productData.title || 'Untitled Product'}</p>
        </a>
        <button class="addToCart" data-id="${productData.id || ''}" data-price="${numericPrice}">Add to cart</button>
      `;

      targetGrid.appendChild(cardDiv);
    });

    attachCartButtonListeners();
    removeGridPreloader(preloaderId);

  } catch (error) {
    console.error(`Database connection failure for ${collectionName}: `, error);
    targetGrid.innerHTML = `<p style='padding: 20px; color: red;'>Failed to load data. Check browser console.</p>`;
    removeGridPreloader(preloaderId);
  }
}

function removeGridPreloader(preloaderId) {
  const gridLoader = document.getElementById(preloaderId);
  if (gridLoader) {
    gridLoader.style.opacity = '0'; 
    setTimeout(() => {
      gridLoader.remove(); 
    }, 300);
  }
}

// FIXED: Is function ko ab dynamic collection detection ke saath stable kiya gaya hai
function attachCartButtonListeners() {
  const cartButtons = document.querySelectorAll('.addToCart');
  cartButtons.forEach(button => {
    button.onclick = (event) => {
      event.preventDefault(); 
      
      const productId = button.getAttribute('data-id');
      const productPrice = button.getAttribute('data-price') || "₹999"; 
      
      const card = button.closest('.card');
      if (!card) return;

      const titleEl = card.querySelector('.description');
      const imgEl = card.querySelector('img');

      const title = titleEl ? titleEl.innerText : "Anime Model";
      const img = imgEl ? imgEl.src : "";
      
      // FIXED LOGIC: Pata lagayein ki item kis section ka hai taaki image dynamic redirect sahi chale
      const isNaruto = card.closest('#narutoProductGrid') !== null;
      const verifiedCollection = isNaruto ? "naruto-products" : "jjk-products";

      let cart = JSON.parse(localStorage.getItem('animeCart')) || [];
      const existingProduct = cart.find(item => item.id === productId);

      if (existingProduct) {
          existingProduct.quantity += 1;
      } else {
          cart.push({ 
              id: productId, 
              title: title, 
              img: img, 
              price: productPrice, 
              quantity: 1,
              category: verifiedCollection
          });
      }

      localStorage.setItem('animeCart', JSON.stringify(cart));
      alert("Item added to cart successfully! 🎉");
    };
  });
}

// 7. Firebase Authentication Logic
onAuthStateChanged(auth, (user) => {
    if (!authBtn) return; 

    if (user) {
        authBtn.innerText = "Logout";
        authBtn.href = "#"; 
        
        if (cartNavBtn) {
            cartNavBtn.href = "cart.html"; 
            cartNavBtn.onclick = null; 
        }

        authBtn.onclick = (e) => {
            e.preventDefault(); 
            signOut(auth).then(() => {
                alert("Logged out successfully!");
                window.location.reload(); 
            }).catch((error) => console.error("Logout error: ", error));
        };
    } else {
        authBtn.innerText = "Login";
        authBtn.href = "login.html"; 
        authBtn.onclick = null; 

        if (cartNavBtn) {
            cartNavBtn.href = "login.html";
        }
    }
});

// ==================== EXECUTION CALLS ====================
loadAnimeProducts("jjk-products", jjkGrid, "jjkGridPreloader");
loadAnimeProducts("naruto-products", narutoGrid, "narutoGridPreloader");
