import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQLFU68k4uFoY8W25vw_QXr_NqITNFccM",
  authDomain: "fir-store-7a2d5.firebaseapp.com",
  projectId: "fir-store-7a2d5",
  storageBucket: "fir-store-7a2d5.firebasestorage.app",
  messagingSenderId: "426927884345",
  appId: "1:426927884345:web:a2e7dcfb81c9715860e5e8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const openBtn = document.getElementById('menuOpenBtn');
const closeBtn = document.getElementById('menuCloseBtn');
const sideMenu = document.getElementById('sideMenu');
const backdrop = document.getElementById('menuBackdrop');
const authBtn = document.getElementById('login-btn'); 
const cartNavBtn = document.getElementById('cart-nav-btn');
const storefront = document.getElementById('dynamicStorefront');

// Hardcoded array ko automate karne ke liye aap yahan bas active categories list maintain kar sakte hain.
// Future proofing: Jab bhi firebase me naya list banao, uska naam bas is array me daal dena, baaki sab automatic hoga!
const registeredCollections = ["jjk-products", "naruto-products", "demonslayer-products"]; 

// Navigation Menu
if (openBtn) openBtn.addEventListener('click', () => { sideMenu.classList.add('is-active'); backdrop.classList.add('is-active'); });
if (closeBtn) closeBtn.addEventListener('click', () => { sideMenu.classList.remove('is-active'); backdrop.classList.remove('is-active'); });
if (backdrop) backdrop.addEventListener('click', () => { sideMenu.classList.remove('is-active'); backdrop.classList.remove('is-active'); });

// Format Display Name (e.g. "jjk-products" -> "Jujutsu Kaisen")
function formatCategoryHeading(slug) {
    if(slug === "jjk-products") return "Jujutsu Kaisen | Starting ₹999";
    if(slug === "naruto-products") return "Naruto | Starting ₹999";
    return slug.replace("-products", "").toUpperCase() + " | Special Edition";
}

// Render dynamic sections
async function buildAutomatedStorefront() {
    if (!storefront) return;

    for (const colName of registeredCollections) {
        // Create Section Header
        const headerCont = document.createElement('div');
        headerCont.className = 'h3-cont';
        headerCont.innerHTML = `<h3 class="h1">${formatCategoryHeading(colName)}</h3>`;
        storefront.appendChild(headerCont);

        // Create Grid Element
        const gridDiv = document.createElement('div');
        gridDiv.className = 'product';
        gridDiv.id = `${colName}-grid`;
        gridDiv.style.cssText = "position: relative; min-height: 265px; margin-bottom: 30px;";

        // Create Inline Grid Preloader
        const preloader = document.createElement('div');
        preloader.id = `${colName}-preloader`;
        preloader.style.cssText = "position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: #f8f9fa; z-index: 10; display: flex; justify-content: center; align-items: center; transition: opacity 0.3s ease;";
        preloader.innerHTML = `<p style="font-family: sans-serif; color: #475569; font-size: 14px; font-weight: 500;">Loading Products...</p>`;
        gridDiv.appendChild(preloader);
        
        storefront.appendChild(gridDiv);

        // Load Products into this dynamic grid
        await loadProductsToGrid(colName, gridDiv, preloader.id);
    }

    // Saare collections load hone ke baad global loader mitao
    const globalLoader = document.getElementById('globalStoreLoader');
    if (globalLoader) {
        globalLoader.style.opacity = '0';
        setTimeout(() => globalLoader.remove(), 300);
    }
}

async function loadProductsToGrid(collectionName, targetGrid, preloaderId) {
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const preloaderEl = document.getElementById(preloaderId);

        if (querySnapshot.empty) {
            targetGrid.innerHTML += "<p style='padding:20px;'>No items found in this section.</p>";
            if (preloaderEl) preloaderEl.remove();
            return;
        }

        querySnapshot.forEach((doc) => {
            const product = doc.data();
            const card = document.createElement("div");
            card.className = "card";

            const priceStr = product.price ? product.price.toString() : "₹999";
            
            // CRITICAL INJECTION: data-category block completely automates the tracking pipeline
            card.innerHTML = `
                <a href="product-detail.html?id=${product.id || ''}&cat=${collectionName}" class="card-link-wrapper">
                    <img src="${product.img || ''}" alt="${product.title || 'Model'}">
                    <p class="description">${product.title || 'Untitled Product'}</p>
                </a>
                <button class="addToCart" 
                        data-id="${product.id || ''}" 
                        data-price="${priceStr}" 
                        data-category="${collectionName}">
                    <i class="fa-solid fa-cart-shopping"></i>Add to cart
                </button>
            `;
            targetGrid.appendChild(card);
        });

        if (preloaderEl) {
            preloaderEl.style.opacity = '0';
            setTimeout(() => preloaderEl.remove(), 300);
        }

    } catch (err) {
        console.error(err);
        targetGrid.innerHTML += `<p style='padding: 20px; color: red;'>Database Sync Timeout.</p>`;
    }
}

// Master Event Listener for Global Interactions (No breakdown bugs)
document.addEventListener('click', (e) => {
    const button = e.target.closest('.addToCart');
    if (!button) return;
    
    e.preventDefault();
    
    const productId = button.getAttribute('data-id');
    const productPrice = button.getAttribute('data-price');
    const productCategory = button.getAttribute('data-category'); // AUTOMATIC VALUE
    
    const card = button.closest('.card');
    const title = card ? card.querySelector('.description').innerText : "Anime Model";
    const img = card ? card.querySelector('img').src : "";

    let cart = JSON.parse(localStorage.getItem('animeCart')) || [];
    const match = cart.find(item => item.id === productId);

    if (match) {
        match.quantity += 1;
    } else {
        cart.push({
            id: productId,
            title: title,
            img: img,
            price: productPrice,
            category: productCategory,
            quantity: 1
        });
    }

    localStorage.setItem('animeCart', JSON.stringify(cart));
    alert(`🎉 Added '${title}' from '${productCategory}' smoothly to cart!`);
});

// Authentication Status Watcher
onAuthStateChanged(auth, (user) => {
    if (!authBtn) return;
    if (user) {
        authBtn.innerText = "Logout"; authBtn.href = "#";
        if (cartNavBtn) cartNavBtn.href = "cart.html";
        authBtn.onclick = (e) => { e.preventDefault(); signOut(auth).then(() => window.location.reload()); };
    } else {
        authBtn.innerText = "Login"; authBtn.href = "login.html"; authBtn.onclick = null;
        if (cartNavBtn) cartNavBtn.href = "login.html";
    }
});

// Execute setup
buildAutomatedStorefront();
