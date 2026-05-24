// 📦 1. Firebase Modules Import & Config Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// 🎨 STORE.JS CARD GRID LAYOUT ENGINE (100% FAIL-SAFE)
function createProductCardHTML(product, collectionName) {
    if (!product || typeof product !== 'object') return '';

    // Images Array Handling
    let currentImg = '';
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        currentImg = product.images[0];
    } else if (product.image || product.img) {
        currentImg = product.image || product.img;
    } else {
        currentImg = 'https://via.placeholder.com/150'; 
    }

    // Title & Description Mapping
    let currentTitle = 'Anime Product';
    if (product.description && typeof product.description === 'string') {
        currentTitle = product.description.length > 35 ? product.description.substring(0, 35) + '...' : product.description;
    } else if (product.title) {
        currentTitle = product.title;
    } else if (product.name) {
        currentTitle = product.name;
    }
    
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
    // DOM ko dynamic fetch karte hain function ke andar hi
    const container = document.getElementById("trendingProductsContainer");
    if (!container) {
        console.error("❌ Error: HTML me 'trendingProductsContainer' nahi mila!");
        return;
    }

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
            console.warn(`⚠️ Collection [${colName}] skip ho gayi:`, err.message);
        }
    }

    if (allProducts.length === 0) {
        container.innerHTML = `<p class="loading-placeholder">No products found in Firestore collections.</p>`;
        return;
    }

    try {
        const randomProducts = shuffleArray(allProducts);
        let finalHTML = "";
        
        for (let i = 0; i < randomProducts.length; i++) {
            const cardHTML = createProductCardHTML(randomProducts[i], randomProducts[i].originCollection);
            if (cardHTML) finalHTML += cardHTML;
        }
        
        // Final screen push
        container.innerHTML = finalHTML;
        console.log("✅ Trending products successfully loaded!");
        
    } catch (error) {
        console.error("🔴 Loop rendering inside container crashed:", error);
    }
}

// --- BAAKI SAARE DATA ENGINES (RECENT, BANNER, NEWS) ---

async function loadDynamicBanners() {
    const track = document.getElementById("carouselTrack");
    const dotsContainer = document.getElementById("carouselDots");
    if (!track) return;

    try {
        const querySnapshot = await getDocs(collection(db, "carousel_banners"));
        let bannerHTML = "";
        let dotsHTML = "";
        let count = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            bannerHTML += `
                <div class="carousel-slide ${count === 0 ? 'active' : ''}">
                    <img src="${data.image}" alt="Banner ${count + 1}">
                    <div class="banner-overlay-text">${data.title || 'Epic Update! ✨'}</div>
                </div>
            `;
            dotsHTML += `<span class="dot ${count === 0 ? 'active' : ''}"></span>`;
            count++;
        });

        if (count > 0) {
            track.innerHTML = bannerHTML;
            if (dotsContainer) dotsContainer.innerHTML = dotsHTML;
        }
    } catch (error) {
        console.error("Banners error: ", error);
    }
}

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
                    try {
                        const checkDoc = await getDoc(doc(db, col, targetId));
                        if (checkDoc.exists()) { targetCat = col; break; }
                    } catch(e){}
                }
            }

            if (targetCat) {
                try {
                    const docSnap = await getDoc(doc(db, targetCat, targetId));
                    if (docSnap.exists()) {
                        htmlContent += createProductCardHTML({ id: docSnap.id, ...docSnap.data() }, targetCat);
                    }
                } catch (e) {}
            }
        }
        container.innerHTML = htmlContent || `<p class="loading-placeholder">No recent items found.</p>`;
    } catch (error) {
        console.error("Recent viewed error: ", error);
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

// 🏗️ INITIALIZATION CONTROL HUB (Ensures DOM is 100% ready)
async function initStore() {
    // Sabse pehle dynamic products aur banners load karo
    await loadDynamicBanners();
    await loadTrendingProducts();
    await loadRecentlyViewed();
    await loadLiveAnimeNews();

    // Side Menu Controls
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

// STRICT EVENT RUNNER
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStore);
} else {
    initStore();
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

    if (match) {
        match.quantity += 1;
    } else {
        cart.push({
            id: productId, title: title, img: img, price: productPrice, category: productCategory, quantity: 1
        });
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
        authBtn.onclick = (e) => { 
            e.preventDefault(); 
            signOut(auth).then(() => window.location.reload()); 
        };
    } else {
        authBtn.innerText = "Login"; 
        authBtn.href = "login.html"; 
        authBtn.onclick = null;
        if (cartNavBtn) cartNavBtn.href = "login.html";
    }
});
