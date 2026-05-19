document.addEventListener('DOMContentLoaded', () => {
    const checkoutItemsList = document.getElementById('checkoutItemsList');
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutTotal = document.getElementById('checkoutTotal');
    const checkoutForm = document.getElementById('checkoutForm');

    // Cart data ko globally access karne ke liye function se baahar nikaal liya
    function getCartFromStorage() {
        return JSON.parse(localStorage.getItem('animeCart')) || [];
    }

    function loadCheckoutSummary() {
        const cart = getCartFromStorage();
        
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
                <div style="font-weight:600; font-size:14px;">₹${numericPrice * item.quantity}</div>
            `;
            checkoutItemsList.appendChild(row);
        });

        checkoutSubtotal.innerText = `₹${overallTotal}`;
        checkoutTotal.innerText = `₹${overallTotal}`;
    }

    // ======================================================================
    // FIXED DYNAMIC RAZORPAY PIPELINE INTEGRATION
    // ======================================================================
    if (checkoutForm) {
        checkoutForm.onsubmit = async (e) => {
            e.preventDefault();

            // Cart data fetch kiya taaki 'cart' variable undefined na rahe
            const cart = getCartFromStorage();
            if (cart.length === 0) {
                alert("Cart is empty!");
                return;
            }

            // Form se customer ki details collect karna
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
                // STEP A: Sahi Tunnel Route par hit karna (`/api/create-payment-order`)
                const orderRes = await fetch('https://9dbf6cfdbd4839.lhr.life/api/create-payment-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cartItems: cart })
                });

                const orderData = await orderRes.json();

                if (!orderData.success) {
                    alert("Order Creation Engine Rejected: " + orderData.message);
                    placeOrderBtn.innerText = "Confirm & Place Order";
                    placeOrderBtn.disabled = false;
                    return;
                }

                // STEP B: Razorpay ka dynamic widget configuration
                const paymentOptions = {
                    "key": orderData.keyId, 
                    "amount": orderData.amount,
                    "currency": orderData.currency,
                    "name": "Chibi Store Inc.",
                    "description": "Secure Anime Merchandise Transaction",
                    "image": "https://img.icons8.com/color/96/anime.png", 
                    "order_id": orderData.razorpayOrderId, 
                    
                    "handler": async function (response) {
                        placeOrderBtn.innerText = "Verifying Payment Integrity...";
                        
                        // STEP C: Verification data ke liye sahi endpoint route (`/api/verify-payment`)
                        const verifyRes = await fetch('https://9dbf6cfdbd4839.lhr.life/api/verify-payment', {
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
                            localStorage.removeItem('animeCart'); 
                            window.location.href = "index.html";  
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
                        "color": "#007bff"
                    },
                    "modal": {
                        "ondismiss": function() {
                            placeOrderBtn.innerText = "Confirm & Place Order";
                            placeOrderBtn.disabled = false;
                        }
                    }
                };

                const rzpUI = new Razorpay(paymentOptions);
                rzpUI.open(); 

            } catch (err) {
                console.error("Pipeline failure: ", err);
                alert("Backend Communication Offline! Make sure your Termux Node Engine is active on port 5000 and SSH tunnel is open.");
                placeOrderBtn.innerText = "Confirm & Place Order";
                placeOrderBtn.disabled = false;
            }
        };
    }

    loadCheckoutSummary();
});
