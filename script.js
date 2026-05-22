document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll(".carousel-slide");
    const dots = document.querySelectorAll(".carousel-dots .dot");
    const prevBtn = document.getElementById("prevBanner");
    const nextBtn = document.getElementById("nextBanner");
    
    let currentSlideIndex = 0;
    let carouselInterval;

    function showSlide(index) {
        // Reset current active states
        slides.forEach(slide => slide.classList.remove("active"));
        dots.forEach(dot => dot.classList.remove("active"));
        
        // Loop controls boundary check
        if (index >= slides.length) currentSlideIndex = 0;
        if (index < 0) currentSlideIndex = slides.length - 1;
        
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

    // Click Events mapping
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

    // Dot indicators configuration
    dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
            currentSlideIndex = idx;
            showSlide(currentSlideIndex);
            resetTimer();
        });
    });

    // Auto running rotation engine
    function startTimer() {
        carouselInterval = setInterval(handleNext, 4000); // Har 4 second me slide change hogi
    }

    function resetTimer() {
        clearInterval(carouselInterval);
        startTimer();
    }

    // Initialize
    if(slides.length > 0) {
        startTimer();
    }
});

window.addEventListener("load", () => {
    const preloader = document.getElementById("anime-preloader");
    if (preloader) {
        // thoda sa minimal buffer timeout (300ms) taaki animation sudden break na ho
        setTimeout(() => {
            preloader.classList.add("fade-out");
        }, 300);
    }
});

// 🌐 1. DOM/Script load hote hi Global Preloader ko Inline Styles ke sath create karo
(function createGlobalLoader() {
    const globalLoader = document.createElement('div');
    globalLoader.id = 'globalStoreLoader';
    
    // Pure inline CSS bina kisi external stylesheet ke
    globalLoader.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #ffffff; z-index: 99999; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 15px; transition: opacity 0.3s ease, visibility 0.3s ease;";
    
    // HTML Elements inject karo (Giphy + Text)
    globalLoader.innerHTML = `
        <img style="width: 200px; height: 200px; object-fit: cover;" src="giphy.gif" alt="loading image"/>
        <p style="font-family: sans-serif; color: #475569; font-size: 18px; font-weight: 500; margin: 0;">
            Loading your dream store...
        </p>
    `;
    
    // Body me sabse upar daal do
    document.body.insertBefore(globalLoader, document.body.firstChild);
})();

// ⚡ 2. Jab window (saari images, banners, HTML) poori tarah load ho jaye, tab loader mitao
window.addEventListener("load", () => {
    const loader = document.getElementById('globalStoreLoader');
    if (loader) {
        loader.style.opacity = '0'; // Dheere se fade out hoga
        loader.style.visibility = 'hidden';
        
        // 300ms ke baad DOM se permanently delete kar do
        setTimeout(() => {
            loader.remove();
        }, 300);
    }
});
