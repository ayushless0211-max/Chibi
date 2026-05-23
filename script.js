// 📦 1. Firebase Modules Import & Config Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
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
const db = getFirestore(app);

// 🌐 2. Dynamic Instant Preloader
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

// Shuffle Algorithm (Random Products Order Ke Liye)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[array[j]]] = [array[array[j]], array[i]];
    }
    return array;
}

// Card HTML Template Generator
function createProductCardHTML(product) {
    return `
        <div class="card product-card">
            <img src="${product.image || 'placeholder.png'}" alt="${product.name || 'Anime Item'}">
            <h4 style="font-size: 14px; margin: 8px 0 4px 0; color: #1e293b; text-align: left;">${product.name || 'No Title'}</h4>
            <p style="font-size: 13px; color: #007bff; font-weight: 700; margin: 0 0 8px 0; text-align: left;">₹${product.price || '0'}</p>
            <button class="addToCart" data-id="${product.id}">Add to Cart</button>
        </div>
    `;
}

// --- 📥 GLOBAL FIREBASE DATA FETCH ENGINES ---

// A. Dynamic Banner Engine (Firestore se)
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

// B. Trending Products Engine (Firestore se)
async function loadTrendingProducts() {
    const container = document.getElementById("trendinProductsContainer");
    if (!container) return;

    try {
        const querySnapshot = await getDocs(collection(db, "trending_products"));
        let allProducts = [];
        querySnapshot.forEach((doc) => {
            allProducts.push({ id: doc.id, ...doc.data() });
        });

        if (allProducts.length === 0) {
            container.innerHTML = `<p class="loading-placeholder">No products found in trending collection.</p>`;
            return;
        }

        const randomProducts = shuffleArray(allProducts);
        container.innerHTML = randomProducts.map(prod => createProductCardHTML(prod)).join('');
        
    } catch (error) {
        console.error("Error loading trending products: ", error);
        container.innerHTML = `<p class="loading-placeholder" style="color: red;">Failed to load hot drops.</p>`;
    }
}

// C. Recently Viewed Engine
async function loadRecentlyViewed() {
    const container = document.getElementById("recentProductsContainer");
    if (!container) return;

    const recentIDs = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    if (recentIDs.length === 0) {
        container.innerHTML = `<p class="loading-placeholder">Items you checked out recently will appear here.</p>`;
        return;
    }

    try {
        let htmlContent = "";
        for (let id of recentIDs) {
            // Note: We check inside standard 'products' list for detailed info
            const docRef = doc(db, "products", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                htmlContent += createProductCardHTML({ id: docSnap.id, ...docSnap.data() });
            }
        }
        container.innerHTML = htmlContent || `<p class="loading-placeholder">No recent items found.</p>`;
    } catch (error) {
        console.error("Error loading recent products: ", error);
    }
}

// D. Live ANN RSS Feed News Engine
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
        console.error("ANN news fetch karne me error aaya: ", error);
        newsTrack.innerHTML = `<div class="news-item">Unable to sync live news flash.</div>`;
    }
}

// 🏗️ DOM Event Handler Sync Hub
document.addEventListener("DOMContentLoaded", async () => {
    
    // Core data streams fire down concurrently 
    await loadDynamicBanners();
    await loadTrendingProducts();
    await loadRecentlyViewed();
    await loadLiveAnimeNews();

    // Kill Preloader safely after content rendering finishes
    const loader = document.getElementById('globalStoreLoader');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        setTimeout(() => loader.remove(), 300);
    }

    // 🍔 Menu Drawer Interactivity
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

    // ⚔️ Dynamic Carousel Slider Layout Engine
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

    // Delay initialization till DOM maps out injected assets
    setTimeout(initCarousel, 500);
});


