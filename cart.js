import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const cartItemsList = document.getElementById('cartItemsList');
const totalOriginalPrice = document.getElementById('totalOriginalPrice');
const finalCartTotal = document.getElementById('finalCartTotal');

// 1. LOCAL STORAGE SE CART ITEMS NIKALNA
function getCartFromStorage() {
    return JSON.parse(localStorage.getItem('animeCart')) || [];
}

function saveCartToStorage(cart) {
    localStorage.setItem('animeCart', JSON.stringify(cart));
}

// 2. MAIN DISPLAY RENDERER
function renderCartUI() {
    const cart = getCartFromStorage();
    
    if (!cartItemsList) return;
    
    if (cart.length === 0) {
        cartItemsList.innerHTML = `<p style="padding: 20px; font-family: sans-serif; color: #64748b;">Your cart is empty! Quick, go grab some chibis! 🛒</p>`;
        totalOriginalPrice.innerText = "₹0";
        finalCartTotal.innerText = "₹0";
        return;
    }

    cartItemsList.innerHTML = "";
    let overallTotal = 0;

    cart.forEach((item, index) => {
        // Price string se '₹' sign hata kar number me badalna calculation ke liye
        const numericPrice = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
        const itemTotal = numericPrice * item.quantity;
        overallTotal += itemTotal;

        const itemRow = document.createElement('div');
        itemRow.className = 'cart-item';
        itemRow.innerHTML = `
            <div class="cart-item-img">
                <img src="${item.img}" alt="${item.title}">
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.title}</h4>
                <p class="cart-item-price">${item.price}</p>
                <div class="quantity-control">
                    <button class="qty-btn minus-qty" data-index="${index}">&minus;</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn plus-qty" data-index="${index}">&plus;</button>
                </div>
            </div>
            <button class="remove-item-btn" data-index="${index}"><i class="fa-solid fa-trash-can"></i></button>
        `;
        cartItemsList.appendChild(itemRow);
    });

    totalOriginalPrice.innerText = `₹${overallTotal}`;
    finalCartTotal.innerText = `₹${overallTotal}`;

    setupEventListeners();
}

// 3. QUANTITY AUR DELETE BUTTONS KA LOGIC
function setupEventListeners() {
    const cart = getCartFromStorage();

    // Plus Quantity Button
    document.querySelectorAll('.plus-qty').forEach(btn => {
        btn.onclick = () => {
            const index = btn.getAttribute('data-index');
            cart[index].quantity += 1;
            saveCartToStorage(cart);
            renderCartUI();
        };
    });

    // Minus Quantity Button
    document.querySelectorAll('.minus-qty').forEach(btn => {
        btn.onclick = () => {
            const index = btn.getAttribute('data-index');
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
                saveCartToStorage(cart);
                renderCartUI();
            }
        };
    });

    // Delete Button
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.onclick = () => {
            const index = btn.getAttribute('data-index');
            cart.splice(index, 1); // Array se item delete kiya
            saveCartToStorage(cart);
            renderCartUI();
        };
    });
}

// Page load hote hi chalega
renderCartUI();
