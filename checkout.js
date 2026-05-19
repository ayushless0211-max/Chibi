document.addEventListener('DOMContentLoaded', () => {
    const checkoutItemsList = document.getElementById('checkoutItemsList');
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutTotal = document.getElementById('checkoutTotal');
    const checkoutForm = document.getElementById('checkoutForm');

    function loadCheckoutSummary() {
        const cart = JSON.parse(localStorage.getItem('animeCart')) || [];
        
        if (cart.length === 0) {
            alert("Your cart is empty! Redirecting to shop...");
            window.location.href = "index.html";
            return;
        }

        checkoutItemsList.innerHTML = "";
        let overallTotal = 0;

        cart.forEach(item => {
            const numericPrice = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
            overallTotal += (numericPrice * item.quantity);

            const row = document.createElement('div');
            row.className = 'checkout-item';
            row.innerHTML = `
                <img src="${item.img}" alt="${item.title}">
                <div class="item-info">
                    <div class="item-title">${item.title}</div>
                    <div class="item-meta">Qty: ${item.quantity} &bull; ${item.price}</div>
                </div>
                <div style="font-weight:600; font-size:14px;">区域 ₹${numericPrice * item.quantity}</div>
            `;
            checkoutItemsList.appendChild(row);
        });

        checkoutSubtotal.innerText = `₹${overallTotal}`;
        checkoutTotal.innerText = `₹${overallTotal}`;
    }

    if (checkoutForm) {
        checkoutForm.onsubmit = (e) => {
            e.preventDefault();
            alert("🎉 Thank you! Your Order has been placed successfully via Cash on Delivery!");
            localStorage.removeItem('animeCart'); // Order confirmation ke baad cart clear
            window.location.href = "index.html";
        };
    }

    loadCheckoutSummary();
});
