// 1. Firebase ki required cheezein import karein
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyCQLFU68k4uFoY8W25vw_QXr_NqITNFccM",
  authDomain: "fir-store-7a2d5.firebaseapp.com",
  projectId: "fir-store-7a2d5",
  storageBucket: "fir-store-7a2d5.firebasestorage.app",
  messagingSenderId: "426927884345",
  appId: "1:426927884345:web:a2e7dcfb81c9715860e5e8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 3. URL PARAMETERS & DOM HOOKS
// 3. URL PARAMETERS & DOM HOOKS
const urlParameters = new URLSearchParams(window.location.search);
const clickedProductId = urlParameters.get('id');
const clickedCategory = urlParameters.get('cat'); // <-- NAYI LINE: URL se category (collection name) nikaala

const mainImgElement = document.getElementById('mainProductImg');
const thumbContainer = document.getElementById('thumbnailContainer');
const titleElement = document.getElementById('mainProductTitle');
const priceElement = document.getElementById('mainProductPrice');
const descElement = document.querySelector('.product-description');
const breadcrumbElement = document.querySelector('.breadcrumb');

// Review Form Hooks
const reviewsContainer = document.getElementById('reviewsContainer');
const reviewForm = document.getElementById('reviewForm');
const reviewCountElement = document.querySelector('.reviews-count');

// 4. MAIN PRODUCT LOADER
// 4. MAIN PRODUCT LOADER
async function getProductDetailFromFirebase() {
  if (!clickedProductId) {
    if (titleElement) titleElement.innerText = "Product ID is missing in URL!";
    removePreloader();
    return;
  }

  // DYNAMIC COLLECTION SELECTION: 
  // Agar URL me category milti hai (jaise jjk-products ya naruto-products), toh use use karo.
  // Agar nahi milti (kisi purane link se aaya hai), toh backup ke liye 'jjk-products' use karo.
  const targetCollection = clickedCategory ? clickedCategory : "jjk-products";

  try {
    // FIXED: Ab humne fixed string ki jagah 'targetCollection' variable pass kar diya hai
    const productsRef = collection(db, targetCollection);
    const q = query(productsRef, where("id", "==", clickedProductId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      if (titleElement) titleElement.innerText = "Product Not Found!";
      removePreloader();
      return;
    }

    // ... Aapka baki ka poora data inject karne ka code aur reviews load karne ka code ekdum PEHLE JAISA hi rahega ...

    let productInfo = {};
    querySnapshot.forEach((doc) => {
        productInfo = doc.data();
    });

    // Inject Product Data
    if (titleElement) titleElement.innerText = productInfo.title || "No Title";
    if (priceElement) priceElement.innerText = productInfo.price || "No Price";
    if (descElement) descElement.innerText = productInfo.description || "No Description";
    
    if (breadcrumbElement && productInfo.category) {
      breadcrumbElement.innerText = `Home > Shop > ${productInfo.category}`;
    }
    
    if (productInfo.images && productInfo.images.length > 0) {
      mainImgElement.src = productInfo.images[0];
      thumbContainer.innerHTML = "";
      productInfo.images.forEach((imageSrc, index) => {
        const thumbImg = document.createElement('img');
        thumbImg.src = imageSrc;
        thumbImg.classList.add('thumb-pic');
        thumbImg.addEventListener('click', () => { mainImgElement.src = imageSrc; });
        thumbContainer.appendChild(thumbImg);
      });
    } else if (productInfo.img) {
      mainImgElement.src = productInfo.img;
    }

    // Product load hone ke baad uske reviews load hone ka INTEZAR karein
    await loadReviewsFromFirebase(); // <-- Added 'await' here

    // Jab sab kuch load ho jaye tab preloader ko smooth fade out karein
    removePreloader(); // <-- White screen successfully hatao

  } catch (error) {
    console.error("Error loading product: ", error);
    removePreloader(); // <-- Agar code fat jaye tab bhi white parda hatao taaki screen freeze na ho
  }
}

// 5. REVIEWS LOAD KARNE KA LOGIC (Aapke exact CSS ke hisaab se formatted)
async function loadReviewsFromFirebase() {
  if (!reviewsContainer) return;

  try {
    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, where("productId", "==", clickedProductId));
    const querySnapshot = await getDocs(q);

    reviewsContainer.innerHTML = ""; // Purana state saaf karein

    if (querySnapshot.empty) {
      reviewsContainer.innerHTML = "<p style='color:#94a3b8; font-size: 14px;'>No reviews yet. Be the first to review this product!</p>";
      if (reviewCountElement) reviewCountElement.innerText = "(0 reviews)";
      return;
    }

    let totalRating = 0;
    let count = 0;

    querySnapshot.forEach((doc) => {
      const reviewData = doc.data();
      totalRating += parseInt(reviewData.rating);
      count++;

      // Stars string generate karna
      const stars = "★".repeat(reviewData.rating) + "☆".repeat(5 - reviewData.rating);

      // Database timestamp se date format karna
      const reviewDateStr = reviewData.createdAt ? new Date(reviewData.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      }) : "Recently";

      // AAPKE CSS SE MATCHING CARD TEMPLATE
      const reviewCardDiv = document.createElement('div');
      reviewCardDiv.className = "review-card";
      
      reviewCardDiv.innerHTML = `
        <div class="review-header">
          <span class="review-user">${reviewData.name}</span>
          <span class="review-stars">${stars}</span>
        </div>
        <span class="review-date">${reviewDateStr}</span>
        <p class="review-text">${reviewData.comment}</p>
      `;
      reviewsContainer.appendChild(reviewCardDiv);
    });

    // Average rating update logic
    const avgRating = (totalRating / count).toFixed(1);
    if (reviewCountElement) {
      reviewCountElement.innerText = `(${avgRating} / ${count} reviews)`;
    }

  } catch (error) {
    console.error("Error loading reviews: ", error);
    reviewsContainer.innerHTML = "<p style='color: #ef4444;'>Failed to load reviews.</p>";
  }
}

// 6. NEW REVIEW SUBMIT FORM LISTENER
if (reviewForm) {
  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Page refresh hone se rokna

    const nameInput = document.getElementById('reviewerName').value;
    const ratingInput = document.getElementById('reviewRating').value;
    const commentInput = document.getElementById('reviewerComment').value;

    const newReview = {
      productId: clickedProductId,
      name: nameInput,
      rating: parseInt(ratingInput),
      comment: commentInput,
      createdAt: new Date().toISOString() // Sorting ke liye timestamp
    };

    try {
      // Firestore ke 'reviews' collection me data add karna
      await addDoc(collection(db, "reviews"), newReview);
      
      alert("Review submitted successfully!");
      reviewForm.reset(); // Form clear karna
      
      // List ko instantly refresh karna
      await loadReviewsFromFirebase();
      
    } catch (error) {
      console.error("Error submitting review: ", error);
      alert("Something went wrong. Try again!");
    }
  });
}

// Preloader ko smooth tarike se hatane ka function
function removePreloader() {
  const preloader = document.getElementById('pagePreloader');
  if (preloader) {
    preloader.style.opacity = '0'; // White screen ko dhundhla (fade out) karega
    setTimeout(() => {
      preloader.style.display = 'none'; // 300ms ke baad poori tarah gayab kar dega
    }, 300);
  }
}

// Run everything on startup
getProductDetailFromFirebase();
