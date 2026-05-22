// 🌐 1. Dynamic Injection of Global Preloader Container Instantly 
(function createGlobalLoader() {
    const globalLoader = document.createElement('div');
    globalLoader.id = 'globalStoreLoader';
    
    // Pure inline layout structure style safely handled inside JS blocks
    globalLoader.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #ffffff; z-index: 99999; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 15px; transition: opacity 0.3s ease, visibility 0.3s ease;";
    
    globalLoader.innerHTML = `
        <img style="width: 200px; height: 200px; object-fit: cover;" src="giphy.gif" alt="loading image"/>
        <p style="font-family: sans-serif; color: #475569; font-size: 18px; font-weight: 500; margin: 0;">
            Loading your dream store...
        </p>
    `;
    
    document.body.insertBefore(globalLoader, document.body.firstChild);
})();

document.addEventListener("DOMContentLoaded", () => {
    
    // 🍔 Sidebar Sidebar Drawer Interactivity
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

    // ⚔️ Dynamic Image Carousel System
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

    function handleNext() {
        currentSlideIndex++;
        showSlide(currentSlideIndex);
    }

    function handlePrev() {
        currentSlideIndex--;
        showSlide(currentSlideIndex);
    }

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener("click", () => {
            handleNext();
            resetTimer();
        });
        prevBtn.addEventListener("click", () => {
            handlePrev();
            resetTimer();
        });
    }

    dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
            currentSlideIndex = idx;
            showSlide(currentSlideIndex);
            resetTimer();
        });
    });

    function startTimer() {
        carouselInterval = setInterval(handleNext, 4000);
    }

    function resetTimer() {
        clearInterval(carouselInterval);
        startTimer();
    }

    if(slides.length > 0) {
        startTimer();
    }
});

// ⚡ 2. Fade Out Global Preloader safely when full content finishes retrieval updates
window.addEventListener("load", () => {
    const loader = document.getElementById('globalStoreLoader');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        setTimeout(() => {
            loader.remove();
        }, 300);
    }
});
