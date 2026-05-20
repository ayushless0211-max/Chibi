import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const userNameDisplay = document.getElementById('user-display-name');
const userEmailDisplay = document.getElementById('user-display-email');
const ordersContainer = document.getElementById('orders-container');
const logoutBtn = document.getElementById('logout-btn');

onAuthStateChanged(auth, (user) => {
    if (user) {
        userNameDisplay.textContent = user.displayName || "Anime Fan";
        userEmailDisplay.textContent = user.email;
        fetchUserOrders(user.uid);
    } else {
        window.location.href = "index.html";
    }
});

async function fetchUserOrders(userId) {
    try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        ordersContainer.innerHTML = "";

        if (querySnapshot.empty) {
            ordersContainer.innerHTML = `<p class="empty-text"><i class="fa-solid fa-basket-shopping"></i> You haven't placed any orders yet. Start shopping!</p>`;
            return;
        }

        querySnapshot.forEach((doc) => {
            const orderData = doc.data();
            const orderDate = orderData.createdAt ? new Date(orderData.createdAt.seconds * 1000).toLocaleDateString() : "Recent";
            
            orderData.items.forEach(item => {
                const orderHtml = `
                    <div class="order-block">
                        <div class="order-meta-header">
                            <div>ORDER PLACED: <strong>${orderDate}</strong></div>
                            <div>TOTAL: <strong>₹${orderData.totalAmount || item.price}</strong></div>
                            <div>ORDER ID: #<span>${doc.id.substring(0,8).toUpperCase()}</span></div>
                        </div>
                        <div class="order-items-wrapper">
                            <div class="order-item-row">
                                <img src="${item.image || 'https://via.placeholder.com/60'}" alt="product">
                                <div class="order-item-details">
                                    <h4>${item.title || item.name}</h4>
                                    <p class="user-welcome" style="margin: 2px 0;">Quantity: ${item.quantity || 1}</p>
                                    <span class="order-status-badge">
                                        <i class="fa-solid fa-truck-fast"></i> Processing Delivery
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                ordersContainer.insertAdjacentHTML('beforeend', orderHtml);
            });
        });

    } catch (error) {
        console.error("Orders load failed: ", error);
        ordersContainer.innerHTML = `<p class="empty-text" style="color: #dc3545;"><i class="fa-solid fa-triangle-exclamation"></i> Failed to load orders. Please refresh.</p>`;
    }
}

logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        alert("Logout failed: " + error.message);
    });
});
