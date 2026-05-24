import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCQLFU68k4uFoY8W25vw_QXr_NqITNFccM",
    authDomain: "fir-store-7a2d5.firebaseapp.com",
    projectId: "fir-store-7a2d5",
    storageBucket: "fir-store-7a2d5.firebasestorage.app",
    messagingSenderId: "426927884345",
    appId: "1:426927884345:web:a2e7dcfb81c9715860e5e8",
    measurementId: "G-3MCLPEPJLD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const registeredCollections = ["jjk-products", "naruto-products", "demonslayer-products"]; 

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[array[j]]] = [array[array[j]], array[i]];
    }
    return array;
}

// 🎨 HIGH-RES CARD RENDERING LAYOUT ENGINE
function createProductCardHTML(product, collectionName) {
    if (!product) return '';

    // Array handles array structure natively
    let currentImg = '';
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        currentImg = product.images[0];
    } else {
        currentImg = product.image || product.img || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500'; 
    }

    const currentTitle = product.description || product.title || product.name || 'Anime Figure Premium';
    const priceStr = product.price ? product.price.toString() : "1299";
    const cleanId = product.id ? product.id.toString().trim() : 'anime-item';
    
    return `
        <div class="card">
            <a href="product-detail.html?id=${encodeURIComponent(cleanId)}&cat=${encodeURIComponent(collectionName)}" class="card-link-wrapper">
                <img src="${currentImg}" alt="${currentTitle}">
                <p class="description">${currentTitle}</p>
            </a>
            <button class="addToCart" 
                    data-id="${cleanId}" 
                    data-price="${priceStr}" 
                    data-category="${collectionName}">
                <i class="fa-solid fa-cart-shopping"></i>Add to cart
            </button>
        </div>
    `;
}

// 🎯 TRENDING DEPLOYMENT HUB WITH BACKUP DATA
async function loadTrendingProducts() {
    const container = document.getElementById("trendingProductsContainer");
    if (!container) return;

    let allProducts = [];

    for (const colName of registeredCollections) {
        try {
            const querySnapshot = await getDocs(collection(db, colName));
            querySnapshot.forEach((doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    allProducts.push({
                        id: doc.id.toString().trim(),
                        ...data,
                        originCollection: colName
                    });
                }
            });
        } catch (err) {
            console.log(`Skip collection: ${colName}`);
        }
    }

    // 🚨 EMERGENCY BACKUP: Agar Firebase lock hai ya response empty hai, toh automatic display chalu rakho
    if (allProducts.length === 0) {
        console.warn("⚠️ Firebase returned 0 docs. Launching backup display engine.");
        allProducts = [
            {
                id: "giyu-1",
                description: "Demon Slayer Tomioka Giyu Chibi Figure",
                images: ["https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500"],
                price: "1499",
                originCollection: "demonslayer-products"
            },
            {
                id: "gojo-1",
                description: "Jujutsu Kaisen Satoru Gojo Hollow Purple Edition",
                images: ["https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500"],
                price: "1899",
                originCollection: "jjk-products"
            }
        ];
    }

    const randomProducts = shuffleArray(allProducts);
    container.innerHTML = randomProducts.map(prod => 
        createProductCardHTML(prod, prod.originCollection)
    ).join('');
}

// ⏰ RECENTLY VIEWED
async function loadRecentlyViewed() {
    const container = document.getElementById("recentProductsContainer");
    if (!container) return;
    container.innerHTML = `<p class="loading-placeholder">No recent history tracked on this device yet.</p>`;
}

// NEWS FLASH
async function loadLiveAnimeNews() {
    const newsTrack = document.getElementById("newsTrack");
    if (!newsTrack) return;
    newsTrack.innerHTML = `<div class="news-item">🔥 New Anime Chibi Merch drop coming this Friday! Stay tuned!</div>`;
}

// HUB SYNC
async function init() {
    await loadTrendingProducts();
    await loadRecentlyViewed();
    await loadLiveAnimeNews();

    // Side Menu Mobile Controls
    const sideMenu = document.getElementById("sideMenu");
    const menuBackdrop = document.getElementById("menuBackdrop");
    const menuOpenBtn = document.getElementById("menuOpenBtn");
    const menuCloseBtn = document.getElementById("menuCloseBtn");

    if (menuOpenBtn && sideMenu && menuBackdrop) {
        menuOpenBtn.onclick = () => {
            sideMenu.classList.add("is-active");
            menuBackdrop.classList.add("is-active");
        };
    }
    if (menuCloseBtn && sideMenu && menuBackdrop) {
        const closeMenu = () => {
            sideMenu.classList.remove("is-active");
            menuBackdrop.classList.remove("is-active");
        };
        menuCloseBtn.onclick = closeMenu;
        menuBackdrop.onclick = closeMenu;
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

// CART ADD INTERACTION
document.addEventListener('click', (e) => {
    const button = e.target.closest('.addToCart');
    if (!button) return;
    
    e.preventDefault();
    const productId = button.getAttribute('data-id');
    const productPrice = button.getAttribute('data-price');
    const productCategory = button.getAttribute('data-category'); 
    
    const card = button.closest('.card');
    const titleEl = card ? card.querySelector('.description') : null;
    const title = titleEl ? titleEl.innerText : "Anime Model";
    const img = card ? card.querySelector('img').src : "";

    let cart = JSON.parse(localStorage.getItem('animeCart')) || [];
    const match = cart.find(item => item.id === productId);

    if (match) { match.quantity += 1; } 
    else {
        cart.push({ id: productId, title: title, img: img, price: productPrice, category: productCategory, quantity: 1 });
    }
    localStorage.setItem('animeCart', JSON.stringify(cart));
    alert(`🎉 Added '${title}' to cart!`);
});
