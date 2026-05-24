// 📦 1. Firebase Modules Import & Config Setup (Latest & Matching Versions)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ✅ Your Absolute Correct Verified Config
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

// 🌐 AUTOMATED COLLECTION ROUTER 
const registeredCollections = ["jjk-products", "naruto-products", "demonslayer-products"]; 

// Helper: Shuffle Array Algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[array[j]]] = [array[array[j]], array[i]];
    }
    return array;
}

// 🎨 STORE.JS CARD GRID LAYOUT ENGINE (FALLBACK SECURED)
function createProductCardHTML(product, collectionName) {
    if (!product || typeof product !== 'object') return '';

    // Images Array / String Handler
    let currentImg = '';
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        currentImg = product.images[0];
    } else {
        currentImg = product.image || product.img || 'https://via.placeholder.com/150'; 
    }

    // Title / Description Handler (Prefers description from your firestore screenshot)
    const currentTitle = product.description || product.title || product.name || 'Untitled Anime Chibi';
    const priceStr = product.price ? product.price.toString() : "999";
    const cleanId = product.id ? product.id.toString().trim() : '';
    
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

// 🎯 MULTI-COLLECTION AUTOMATED TRENDING DROP LOGIC
async function loadTrendingProducts() {
    const container = document.getElementById("trendingProductsContainer");
    if (!container) return;

    let allProducts = [];

    for (const colName of registeredCollections) {
        try {
            const querySnapshot = await getDocs(collection(db, colName));
            querySnapshot.forEach((doc) => {
                if (doc.exists()) {
                    const rawData = doc.data();
                    const cleanId = doc.id ? doc.id.toString().trim() : '';
                    
                    allProducts.push({
                        id: cleanId,
                        ...rawData,
                        originCollection: colName
                    });
                }
            });
        } catch (err) {
            console.warn(`⚠️ Collection ${colName} load nahi ho payi, skipping...`, err);
        }
    }

    if (allProducts.length === 0) {
        container.innerHTML = `<p class="loading-placeholder">No active items found. Please verify your Firebase Rules are set to true.</p>`;
        return;
    }

    try {
        const randomProducts = shuffleArray(allProducts);
        container.innerHTML = randomProducts.map(prod => 
            createProductCardHTML(prod, prod.originCollection)
        ).join('');
        
    } catch (error) {
        console.error("Rendering crash error: ", error);
        container.innerHTML = `<p class="loading-placeholder" style="color: red;">Failed to load hot drops.</p>`;
    }
}

// ⏰ RECENTLY VIEWED ENGINE
async function loadRecentlyViewed() {
    const container = document.getElementById("recentProductsContainer");
    if (!container) return;

    const recentItems = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    if (recentItems.length === 0) {
        container.innerHTML = `<p class="loading-placeholder">Items you checked out recently will appear here.</p>`;
        return;
    }

    try {
        let htmlContent = "";
        for (let item of recentItems) {
            let targetId = typeof item === 'object' && item !== null ? item.id : item;
            let targetCat = typeof item === 'object' && item !== null ? item.cat : null;

            if (!targetId) continue;

            if (!targetCat) {
                for (const col of registeredCollections) {
                    const checkDoc = await getDoc(doc(db, col, targetId));
                    if (checkDoc.exists()) { targetCat = col; break; }
                }
            }

            if (targetCat) {
                const docSnap = await getDoc(doc(db, targetCat, targetId));
                if (docSnap.exists()) {
                    htmlContent += createProductCardHTML({ id: docSnap.id, ...docSnap.data() }, targetCat);
                }
            }
        }
        container.innerHTML = htmlContent || `<p class="loading-placeholder">No recent items found.</p>`;
    } catch (error) {
        container.innerHTML = `<p class="loading-placeholder">Failed to pull recent history.</p>`;
    }
}

async function loadLiveAnimeNews() {
    const newsTrack = document.getElementById("newsTrack");
    if (!newsTrack) return;

    const annRssUrl = "https://www.animenewsnetwork.com/news/rss.xml";
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(annRssUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        const data = await response.json();

        if (data.status === 'ok' && data.items.length > 0) {
            let newsHTML = "";
            const latestNews = data.items.slice(0, 7);
            latestNews.forEach(item => {
                newsHTML += `<div class="news-item" onclick="window.open('${item.link}', '_blank')" style="cursor: pointer;">🔥 ${item.title}</div>`;
            });
            newsTrack.innerHTML = newsHTML;
        }
    } catch (error) {
        newsTrack.innerHTML = `<div class="news-item">Unable to sync live news flash.</div>`;
    }
}

// 🏗️ DOM Event Handler Sync Hub
async function init() {
    // Static HTML Banners ko touch nahi karenge, direct trending products load karenge
    await loadTrendingProducts();
    await loadRecentlyViewed();
    await loadLiveAnimeNews();

    // Side Menu
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

// 🛒 3. MASTER INTERACTION LISTENER
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
    alert(`🎉 Added '${title}' smoothly to cart!`);
});

// 🔐 4. AUTHENTICATION WATCHER
const authBtn = document.getElementById('login-btn'); 
const cartNavBtn = document.getElementById('cart-nav-btn');

onAuthStateChanged(auth, (user) => {
    if (!authBtn) return;
    if (user) {
        authBtn.innerText = "Logout"; 
        authBtn.href = "#";
        if (cartNavBtn) cartNavBtn.href = "cart.html";
        authBtn.onclick = (e) => { e.preventDefault(); signOut(auth).then(() => window.location.reload()); };
    } else {
        authBtn.innerText = "Login"; authBtn.href = "login.html"; authBtn.onclick = null;
        if (cartNavBtn) cartNavBtn.href = "login.html";
    }
});
