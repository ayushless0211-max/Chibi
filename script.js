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

// 🌐 AUTOMATED COLLECTION ROUTER (Future proof setup inspired from store.js)
const registeredCollections = ["jjk-products", "naruto-products", "demonslayer-products"]; 

// 🌐 Dynamic Instant Preloader Container
(function createGlobalLoader() {
    const globalLoader = document.createElement('div');
    globalLoader.id = 'globalStoreLoader';
    globalLoader.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #ffffff; z-index: 99999; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 15px; transition: opacity 0.3s ease, visibility 0.3s ease;";
    globalLoader.innerHTML = `
        <img style="width: 200px; height: 200px; object-fit: cover;" src="giphy.gif" alt="loading image"/>
        <p style="font-family: sans-serif; color: #475569; font-size: 18px; font-weight: 500; margin: 0;">
            Loading your dream store...
        </p>
    `;
    document.body.insertBefore(globalLoader, document.body.firstChild);
})();

// Helper: Shuffle Array Algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[array[j]]] = [array[array[j]], array[i]];
    }
    return array;
}

// 🎨 STORE.JS CARD GRID LAYOUT ENGINE (Synced Keys & Structure)
function createProductCardHTML(product, collectionName) {
    const currentImg = product.img || product.image || '';
    const currentTitle = product.title || product.name || 'Untitled Product';
    const priceStr = product.price ? product.price.toString() : "999";
    
    return `
        <div class="card">
            <a href="product-detail.html?id=${product.id || ''}&cat=${collectionName}" class="card-link-wrapper">
                <img src="${currentImg}" alt="${currentTitle}">
                <p class="description">${currentTitle}</p>
            </a>
            <button class="addToCart" 
                    data-id="${product.id || ''}" 
                    data-price="${priceStr}" 
                    data-category="${collectionName}">
                <i class="fa-solid fa-cart-shopping"></i>Add to cart
            </button>
        </div>
    `;
}

// --- 📥 GLOBAL FIREBASE DATA FETCH ENGINES ---

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
        console.error("Banners load karne me error: ", error);
    }
}

// 🎯 MULTI-COLLECTION AUTOMATED TRENDING DROP LOGIC
async function loadTrendingProducts() {
    const container = document.getElementById("trendingProductsContainer");
    if (!container) return;

    try {
        let allProducts = [];

        // Saare dynamic collections se parallelly items load karo
        const fetchPromises = registeredCollections.map(async (colName) => {
            try {
                const querySnapshot = await getDocs(collection(db, colName));
                querySnapshot.forEach((doc) => {
                    allProducts.push({ id: doc.id, originCollection: colName, ...doc.data() });
                });
            } catch (err) {
                console.warn(`Collection ${colName} load nahi ho payi, skipping...`, err);
            }
        });

        await Promise.all(fetchPromises);

        if (allProducts.length === 0) {
            container.innerHTML = `<p class="loading-placeholder">No active items found in anime databases.</p>`;
            return;
        }

        // Mix contents taaki harr refresh par alag anime models trending me aayein
        const randomProducts = shuffleArray(allProducts);
        const homepageDisplayList = randomProducts.slice(0, 6);
        
        container.innerHTML = homepageDisplayList.map(prod => 
            createProductCardHTML(prod, prod.originCollection)
        ).join('');
        
    } catch (error) {
        console.error("Error pooling multi-collection drops: ", error);
        alert("Firestore Fetch Interrupted: " + error.message);
        container.innerHTML = `<p class="loading-placeholder" style="color: red;">Failed to load hot drops.</p>`;
    }
}

// ⏰ RECENTLY VIEWED WITH MULTI-COLLECTION RECOVERY PIPELINE
async function loadRecentlyViewed() {
    const container = document.getElementById("recentProductsContainer");
    if (!container) return;

    // Isme items array format me hone chahiye jisme {id, cat} dono ho
    const recentItems = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    if (recentItems.length === 0) {
        container.innerHTML = `<p class="loading-placeholder">Items you checked out recently will appear here.</p>`;
        return;
    }

    try {
        let htmlContent = "";
        
        // Loop through each product ID tracking reference
        for (let item of recentItems) {
            // Backward compatibility checks (Id directly string ho ya object format)
            const targetId = typeof item === 'object' ? item.id : item;
            let targetCat = typeof item === 'object' ? item.cat : null;

            if (!targetId) continue;

            // Agar store pehle ka binary id dump save kiya tha, toh hum auto collection search chalayenge
            if (!targetCat) {
                for (const col of registeredCollections) {
                    const checkDoc = await getDoc(doc(db, col, targetId));
                    if (checkDoc.exists()) {
                        targetCat = col;
                        break;
                    }
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
        console.error("Error restoring recent views: ", error);
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
                newsHTML += `
                    <div class="news-item" onclick="window.open('${item.link}', '_blank')" style="cursor: pointer;">
                        🔥 ${item.title}
                    </div>
                `;
            });

            if(latestNews.length >= 2) {
                newsHTML += `
                    <div class="news-item" onclick="window.open('${latestNews[0].link}', '_blank')" style="cursor: pointer;">
                        🔥 ${latestNews[0].title}
                    </div>
                `;
                newsHTML += `
                    <div class="news-item" onclick="window.open('${latestNews[1].link}', '_blank')" style="cursor: pointer;">
                        🔥 ${latestNews[1].title}
                    </div>
                `;
            }
            newsTrack.innerHTML = newsHTML;
        } else {
            newsTrack.innerHTML = `<div class="news-item">Failed to parse updates. Check back later!</div>`;
        }
    } catch (error) {
        console.error("ANN news error: ", error);
        newsTrack.innerHTML = `<div class="news-item">Unable to sync live news flash.</div>`;
    }
}

// 🏗️ DOM Event Handler Sync Hub
document.addEventListener("DOMContentLoaded", async () => {
    await loadDynamicBanners();
    await loadTrendingProducts();
    await loadRecentlyViewed();
    await loadLiveAnimeNews();

    const loader = document.getElementById('globalStoreLoader');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        setTimeout(() => loader.remove(), 300);
    }

    const sideMenu = document.getElementById("sideMenu");
    const menuBackdrop = document.getElementById("menuBackdrop");
    const menuOpenBtn = document.getElementById("menuOpenBtn");
    const menuCloseBtn = document.getElementById("menuCloseBtn");

    if (menuOpenBtn && sideMenu && menuBackdrop) {
        menuOpenBtn.addEventListener("click", () => {
            sideMenu.classList.add("is-active");
            menuBackdrop.classList.add("is-active");
        });
    }

    if (menuCloseBtn && sideMenu && menuBackdrop) {
        const closeMenu = () => {
            sideMenu.classList.remove("is-active");
            menuBackdrop.classList.remove("is-active");
        };
        menuCloseBtn.addEventListener("click", closeMenu);
        menuBackdrop.addEventListener("click", closeMenu);
    }

    let currentSlideIndex = 0;
    let carouselInterval;

    function initCarousel() {
        const slides = document.querySelectorAll(".carousel-slide");
        const dots = document.querySelectorAll(".carousel-dots .dot");
        const prevBtn = document.getElementById("prevBanner");
        const nextBtn = document.getElementById("nextBanner");

        if(slides.length === 0) return;

        function showSlide(index) {
            const activeSlides = document.querySelectorAll(".carousel-slide");
            const activeDots = document.querySelectorAll(".carousel-dots .dot");
            
            if(activeSlides.length === 0) return;
            activeSlides.forEach(slide => slide.classList.remove("active"));
            if(activeDots) activeDots.forEach(dot => dot.classList.remove("active"));
            
            if (index >= activeSlides.length) currentSlideIndex = 0;
            else if (index < 0) currentSlideIndex = activeSlides.length - 1;
            else currentSlideIndex = index;
            
            activeSlides[currentSlideIndex].classList.add("active");
            if(activeDots[currentSlideIndex]) activeDots[currentSlideIndex].classList.add("active");
        }

        function handleNext() { currentSlideIndex++; showSlide(currentSlideIndex); }
        function handlePrev() { currentSlideIndex--; showSlide(currentSlideIndex); }

        if (nextBtn && prevBtn) {
            nextBtn.onclick = () => { handleNext(); resetTimer(); };
            prevBtn.onclick = () => { handlePrev(); resetTimer(); };
        }

        dots.forEach((dot, idx) => {
            dot.onclick = () => {
                currentSlideIndex = idx;
                showSlide(currentSlideIndex);
                resetTimer();
            };
        });

        function startTimer() { carouselInterval = setInterval(handleNext, 4000); }
        function resetTimer() { clearInterval(carouselInterval); startTimer(); }

        startTimer();
    }

    setTimeout(initCarousel, 500);
});

// 🛒 3. MASTER INTERACTION LISTENER (Add to Cart Engine)
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
            id: productId,
            title: title,
            img: img,
            price: productPrice,
            category: productCategory,
            quantity: 1
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
