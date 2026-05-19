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

    // ======================================================================
// NEW DYNAMIC RAZORPAY PIPELINE INTEGRATION (Replace your old submit block with this)
// ======================================================================
if (checkoutForm) {
    checkoutForm.onsubmit = async (e) => {
        e.preventDefault();

        // 1. Form se customer ki details collect karna
        const customerDetails = {
            name: document.getElementById('fullName').value,
            phone: document.getElementById('phoneNumber').value,
            address: document.getElementById('address').value,
            pincode: document.getElementById('pincode').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value
        };

        const placeOrderBtn = document.getElementById('placeOrderBtn');
        placeOrderBtn.innerText = "Generating Payment Token...";
        placeOrderBtn.disabled = true;

        try {
            // STEP A: Apne Termux Node Server (Port 5000) se Razorpay Order ID maangna
            const orderRes = await fetch('https://fa5ca81dd9cc9e.lhr.life/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cartItems: cart }) // 'cart' variable aapke getCartFromStorage() se aa raha hai
            });

            const orderData = await orderRes.json();

            if (!orderData.success) {
                alert("Order Creation Engine Rejected: " + orderData.message);
                placeOrderBtn.innerText = "Confirm & Place Order";
                placeOrderBtn.disabled = false;
                return;
            }

            // STEP B: Razorpay ka official responsive checkout overlay screen open karna
            const paymentOptions = {
                "key": orderData.keyId, // Server se automatic aapki test/live key utha lega
                "amount": orderData.amount,
                "currency": orderData.currency,
                "name": "Chibi Store Inc.",
                "description": "Secure Anime Merchandise Transaction",
                "image": "https://img.icons8.com/color/96/anime.png", 
                "order_id": orderData.razorpayOrderId, 
                
                // Jab user successfully payment kar dega, tab ye function chalega:
                "handler": async function (response) {
                    placeOrderBtn.innerText = "Verifying Payment Integrity...";
                    
                    // STEP C: Payment ki verification details wapas Termux server ko bhejna database me log karne ke liye
                    const verifyRes = await fetch('https://fa5ca81dd9cc9e.lhr.life/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            customerDetails,
                            cartItems: cart,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature
                        })
                    });

                    const verifyData = await verifyRes.json();

                    if (verifyData.success) {
                        alert(`🎉 Payment Successful!\nOrder Document ID: ${verifyData.orderId}`);
                        localStorage.removeItem('animeCart'); // Cart clear karna order ke baad
                        window.location.href = "index.html";  // Home page par bhej dena
                    } else {
                        alert("Database Order Logging Failed: " + verifyData.message);
                        placeOrderBtn.innerText = "Confirm & Place Order";
                        placeOrderBtn.disabled = false;
                    }
                },
                "prefill": {
                    "name": customerDetails.name,
                    "contact": customerDetails.phone
                },
                "theme": {
                    "color": "#007bff" // Aapki website ka matching blue brand accent color
                },
                "modal": {
                    "ondismiss": function() {
                        // Agar user bina payment kiye popup close kar de
                        placeOrderBtn.innerText = "Confirm & Place Order";
                        placeOrderBtn.disabled = false;
                    }
                }
            };

            const rzpUI = new Razorpay(paymentOptions);
            rzpUI.open(); // Boom! Razorpay Screen Pop-up ho jayegi

        } catch (err) {
            console.error("Pipeline failure: ", err);
            alert("Backend Communication Offline! Make sure your Termux Node Engine is active on port 5000.");
            placeOrderBtn.innerText = "Confirm & Place Order";
            placeOrderBtn.disabled = false;
        }
    };
}


    loadCheckoutSummary();
});
