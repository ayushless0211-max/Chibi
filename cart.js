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
    
    if (cart.length === 0) {
        cartItemsList.innerHTML = `<p style="padding: 40px; text-align: left; font-family: sans-serif; color: #64748b; font-size: 16px; width: 100%;">Your cart is empty! </p>`;
        if (totalOriginalPrice) totalOriginalPrice.innerText = "₹0";
        if (finalCartTotal) finalCartTotal.innerText = "₹0";
        return;
    }

    cartItemsList.innerHTML = "";
    let overallTotal = 0;

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
