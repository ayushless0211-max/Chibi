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
