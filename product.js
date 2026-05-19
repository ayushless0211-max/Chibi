import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const urlParameters = new URLSearchParams(window.location.search);
const clickedProductId = urlParameters.get('id');
const clickedCategory = urlParameters.get('cat') || "jjk-products"; // AUTOMATIC FAILSAFE DETECTOR

const mainImgElement = document.getElementById('mainProductImg');
const thumbContainer = document.getElementById('thumbnailContainer');
const titleElement = document.getElementById('mainProductTitle');
const priceElement = document.getElementById('mainProductPrice');
const descElement = document.querySelector('.product-description');
const breadcrumbElement = document.querySelector('.breadcrumb');
const reviewsContainer = document.getElementById('reviewsContainer');
const reviewForm = document.getElementById('reviewForm');
const reviewCountElement = document.querySelector('.reviews-count');

// Dynamic Buttons Hooks
const addToCartBtn = document.getElementById('detailAddToCartBtn');
const buyNowBtn = document.getElementById('detailBuyNowBtn');

let globalProductReference = null; // Memory allocation block to store dynamic state

async function getProductDetailFromFirebase() {
  if (!clickedProductId) {
    if (titleElement) titleElement.innerText = "Error: Invalid Product Query String Parameter Reference.";
    removePreloader(); return;
  }

  try {
    const q = query(collection(db, clickedCategory), where("id", "==", clickedProductId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      if (titleElement) titleElement.innerText = "Product Not Found!";
      removePreloader(); return;
    }

    querySnapshot.forEach((doc) => { globalProductReference = doc.data(); });

    // Inject data
    titleElement.innerText = globalProductReference.title || "Premium Figure";
    priceElement.innerText = globalProductReference.price || "₹999";
    descElement.innerText = globalProductReference.description || "Authentic anime collectible merchandise crafted with fine attention to structural integrity.";
    
    if (breadcrumbElement) {
      breadcrumbElement.innerText = `Home > Shop > ${clickedCategory.replace("-products","").toUpperCase()}`;
    }
    
    // Process Images Layout safely
    if (globalProductReference.images && globalProductReference.images.length > 0) {
      mainImgElement.src = globalProductReference.images[0];
      thumbContainer.innerHTML = "";
      globalProductReference.images.forEach((imgSrc) => {
        const thumbImg = document.createElement('img');
        thumbImg.src = imgSrc;
        thumbImg.classList.add('thumb-pic');
        thumbImg.onclick = () => mainImgElement.src = imgSrc;
        thumbContainer.appendChild(thumbImg);
      });
    } else if (globalProductReference.img) {
      mainImgElement.src = globalProductReference.img;
    }

    await loadReviewsFromFirebase();
    removePreloader();
    setupDetailPurchasePipeline(); // Turn on interactive button bindings

  } catch (error) {
    console.error(error);
    removePreloader();
  }
}

// Connect Action Buttons to LocalStorage with Dynamic Metadata State Tracking
function setupDetailPurchasePipeline() {
    if(!globalProductReference) return;

    const executeCartPersistence = () => {
        let cart = JSON.parse(localStorage.getItem('animeCart')) || [];
        const match = cart.find(item => item.id === clickedProductId);

        if (match) {
            match.quantity += 1;
        } else {
            cart.push({
                id: clickedProductId,
                title: globalProductReference.title,
                img: mainImgElement.src,
                price: globalProductReference.price,
                category: clickedCategory, // INSTANT PASSED TRACKER BOUND
                quantity: 1
            });
        }
        localStorage.setItem('animeCart', JSON.stringify(cart));
    };

    if(addToCartBtn) {
        addToCartBtn.onclick = () => {
            executeCartPersistence();
            alert("Success: Dynamic item configuration saved to local secure cart! 🎉");
        };
    }

    if(buyNowBtn) {
        buyNowBtn.onclick = () => {
            executeCartPersistence();
            window.location.href = "cart.html"; // Dynamic redirect pattern matching
        };
    }
}

async function loadReviewsFromFirebase() {
  if (!reviewsContainer) return;
  try {
    const q = query(collection(db, "reviews"), where("productId", "==", clickedProductId));
    const snap = await getDocs(q);
    reviewsContainer.innerHTML = "";

    if (snap.empty) {
      reviewsContainer.innerHTML = "<p style='color:#94a3b8;'>No feedback found for this product series yet.</p>";
      if (reviewCountElement) reviewCountElement.innerText = "(0 reviews)";
      return;
    }

    let totalRating = 0, count = 0;
    snap.forEach((doc) => {
      const data = doc.data();
      totalRating += data.rating; count++;
      const stars = "★".repeat(data.rating) + "☆".repeat(5 - data.rating);
      const card = document.createElement('div');
      card.className = "review-card";
      card.innerHTML = `<div class="review-header"><span class="review-user">${data.name}</span><span class="review-stars">${stars}</span></div><p class="review-text">${data.comment}</p>`;
      reviewsContainer.appendChild(card);
    });

    if (reviewCountElement) reviewCountElement.innerText = `(${(totalRating / count).toFixed(1)} / ${count} reviews)`;
  } catch (err) { console.error(err); }
}

if (reviewForm) {
  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newReview = {
      productId: clickedProductId,
      name: document.getElementById('reviewerName').value,
      rating: parseInt(document.getElementById('reviewRating').value),
      comment: document.getElementById('reviewerComment').value,
      createdAt: new Date().toISOString()
    };
    try {
      await addDoc(collection(db, "reviews"), newReview);
      reviewForm.reset(); await loadReviewsFromFirebase();
    } catch (error) { console.error(error); }
  });
}

function removePreloader() {
  const loader = document.getElementById('pagePreloader');
  if (loader) { loader.style.opacity = '0'; setTimeout(() => loader.style.display = 'none', 300); }
}

getProductDetailFromFirebase();
