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

// 🏗️ Dom Content Loaded Logic
document.addEventListener("DOMContentLoaded", async () => {
    
    // --- 📥 Firebase Data Loaders ---
    async function loadTrendingProducts() {
        const container = document.getElementById("trendingProductsContainer");
        if (!container) return;

        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            let allProducts = [];
            querySnapshot.forEach((doc) => {
                allProducts.push({ id: doc.id, ...doc.data() });
            });

            if (allProducts.length === 0) {
                container.innerHTML = `<p class="loading-placeholder">No products found in database.</p>`;
                return;
            }

            const randomProducts = shuffleArray(allProducts);
            container.innerHTML = randomProducts.map(prod => createProductCardHTML(prod)).join('');
            
        } catch (error) {
            console.error("Error loading trending products: ", error);
            container.innerHTML = `<p class="loading-placeholder" style="color: red;">Failed to load hot drops.</p>`;
        }
    }

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

    // Run Fetches
    await loadTrendingProducts();
    await loadRecentlyViewed();

    // Kill Preloader safely after async tasks finish
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

    // ⚔️ Banner Carousel Logic
    const slides = document.querySelectorAll(".carousel-slide");
    const dots = document.querySelectorAll(".carousel-dots .dot");
    const prevBtn = document.getElementById("prevBanner");
    const nextBtn = document.getElementById("nextBanner");
    
    let currentSlideIndex = 0;
    let carouselInterval;

    function showSlide(index) {
        if(slides.length === 0) return;
        slides.forEach(slide => slide.classList.remove("active"));
        dots.forEach(dot => dot.classList.remove("active"));
        
        if (index >= slides.length) currentSlideIndex = 0;
        else if (index < 0) currentSlideIndex = slides.length - 1;
        else currentSlideIndex = index;
        
        slides[currentSlideIndex].classList.add("active");
        dots[currentSlideIndex].classList.add("active");
    }

    function handleNext() { currentSlideIndex++; showSlide(currentSlideIndex); }
    function handlePrev() { currentSlideIndex--; showSlide(currentSlideIndex); }

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener("click", () => { handleNext(); resetTimer(); });
        prevBtn.addEventListener("click", () => { handlePrev(); resetTimer(); });
    }

    dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
            currentSlideIndex = idx;
            showSlide(currentSlideIndex);
            resetTimer();
        });
    });

    function startTimer() { carouselInterval = setInterval(handleNext, 4000); }
    function resetTimer() { clearInterval(carouselInterval); startTimer(); }

    if(slides.length > 0) { startTimer(); }
});
