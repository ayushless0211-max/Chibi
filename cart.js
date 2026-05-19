const cartItemsList = document.getElementById('cartItemsList');
const totalOriginalPrice = document.getElementById('totalOriginalPrice');
const finalCartTotal = document.getElementById('finalCartTotal');

function getCartFromStorage() {
    return JSON.parse(localStorage.getItem('animeCart')) || [];
}

function saveCartToStorage(cart) {
    localStorage.setItem('animeCart', JSON.stringify(cart));
}

function renderCartUI() {
    const cart = getCartFromStorage();
    
    if (!cartItemsList) return;
    
    // cart.js ke renderCartUI() me khali cart wale block ko isse replace karein
if (cart.length === 0) {
    // 1. Left panel me badiya bada empty state ka design inject karein
    cartItemsList.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; font-family: sans-serif; width: 100%;">
            <div style="font-size: 50px; margin-bottom: 15px;">🛒</div>
            <h3 style="color: #1e293b; margin-bottom: 8px;">Your Cart is Empty</h3>
            <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">Quick, go grab some awesome chibis!</p>
            <a href="index.html" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Continue Shopping</a>
        </div>
    `;

// FIXED LOGIC: Left section ko temporary full width (100%) dein taaki text pure screen ke center me aaye
    if (cartItemsList) {
        cartItemsList.style.width = '100%';
        cartItemsList.style.display = 'block';
        cartItemsList.style.paddingRight = '0';
    }
    
    // 2. NAYA LOGIC: Right side wale summary panel ko chupao taaki fuzool lamba space na bane
    // cart.js me cartItemsList.innerHTML = ""; ke theek niche wale is block ko check karein
const summarySection = document.querySelector('.cart-summary-section');
const cartWrapper = document.querySelector('.cart-wrapper');

// FIXED LOGIC: Agar products hain, toh hidden section ko screen size ke mutabik wapas dikhao
if (cart.length > 0) {
    if (window.innerWidth >= 768) {
        if (summarySection) summarySection.style.display = 'table-cell';
        if (cartWrapper) cartWrapper.style.display = 'table';
    } else {
        if (summarySection) summarySection.style.display = 'block';
        if (cartWrapper) cartWrapper.style.display = 'block';
    }
}

    // Grid columns ko collapse karke full width karo taaki text center dikhe
    const cartWrapper = document.querySelector('.cart-wrapper');
    if (cartWrapper) {
        cartWrapper.style.display = 'block';
    }

    if (totalOriginalPrice) totalOriginalPrice.innerText = "₹0";
    if (finalCartTotal) finalCartTotal.innerText = "₹0";
    return;
}

    cartItemsList.innerHTML = "";
    let overallTotal = 0;

    // cart.js me cartItemsList.innerHTML = ""; ke theek niche ye jodh do taaki item hone par box dikhe
const summarySection = document.querySelector('.cart-summary-section');
const cartWrapper = document.querySelector('.cart-wrapper');

if (window.innerWidth >= 768) {
    if (summarySection) summarySection.style.display = 'table-cell';
    if (cartWrapper) cartWrapper.style.display = 'table';
} else {
    if (summarySection) summarySection.style.display = 'block';
    if (cartWrapper) cartWrapper.style.display = 'block';
}

    cart.forEach((item, index) => {
        const numericPrice = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
        overallTotal += (numericPrice * item.quantity);

        const itemRow = document.createElement('div');
        itemRow.className = 'cart-item';
        // cart.js ke renderCartUI ke andar itemRow.innerHTML ko isse replace karein:
itemRow.innerHTML = `
    <div class="cart-item-img">
        <a href="product-detail.html?id=${item.id || ''}&cat=${item.category || 'jjk-products'}">
            <img src="${item.img}" alt="${item.title}" style="cursor: pointer;">
        </a>
    </div>
    <div class="cart-item-details">
        <h4 class="cart-item-title">
            <a href="product-detail.html?id=${item.id || ''}&cat=${item.category || 'jjk-products'}" style="text-decoration: none; color: inherit;">
                ${item.title}
            </a>
        </h4>
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

    if (totalOriginalPrice) totalOriginalPrice.innerText = `₹${overallTotal}`;
    if (finalCartTotal) finalCartTotal.innerText = `₹${overallTotal}`;

    setupEventListeners();
}

function setupEventListeners() {
    let cart = getCartFromStorage();

    document.querySelectorAll('.plus-qty').forEach(btn => {
        btn.onclick = () => {
            const index = btn.getAttribute('data-index');
            cart[index].quantity += 1;
            saveCartToStorage(cart);
            renderCartUI();
        };
    });

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

    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.onclick = () => {
            const index = btn.getAttribute('data-index');
            cart.splice(index, 1);
            saveCartToStorage(cart);
            renderCartUI();
        };
    });
}

renderCartUI();
