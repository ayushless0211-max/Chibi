// Firebase v12 SDK imports directly using your exact version urls
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// ✅ Your exact Firebase web configuration loaded safely
const firebaseConfig = {
    apiKey: "AIzaSyCQLFU68k4uFoY8W25vw_QXr_NqITNFccM",
    authDomain: "fir-store-7a2d5.firebaseapp.com",
    projectId: "fir-store-7a2d5",
    storageBucket: "fir-store-7a2d5.firebasestorage.app",
    messagingSenderId: "426927884345",
    appId: "1:426927884345:web:a2e7dcfb81c9715860e5e8",
    measurementId: "G-3MCLPEPJLD"
};

// Initialize app frameworks
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Document Elements mapping
const userNameDisplay = document.getElementById('user-display-name');
const userEmailDisplay = document.getElementById('user-display-email');
const ordersContainer = document.getElementById('orders-container');
const logoutBtn = document.getElementById('logout-btn');
// profile.js ke top par baki elements ke sath ise bhi jod do
const profileBody = document.getElementById('profile-body');

// Edit Profile Elements mapping
const editProfileForm = document.getElementById('edit-profile-form');
const updateNameInput = document.getElementById('update-name');
const updateStatus = document.getElementById('update-status');

// 1. Session Tracker (Gets triggered automatically when page loads)
// 1. Updated Secure Session Tracker change 1 by p
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User logged in hai! Ab screen content set karo
        userNameDisplay.textContent = user.displayName || "Anime Fan";
        userEmailDisplay.textContent = user.email;
        
        if (user.displayName) {
            updateNameInput.value = user.displayName;
        }
        
        // ⚡ SECURE FIX: Jab user verified ho jaye, tabhi page ko show karo
        if (profileBody) {
            profileBody.style.display = "block";
        }
        
        // Firestore se orders lekar aao
        fetchUserOrders(user.uid);
    } else {
        // ⚡ SECURE FIX: Agar logged out hai, toh bina layout dikhaye turant bhagao
        window.location.replace("index.html"); 
        // Note: replace() use karne se user 'back' button daba kar firse profile par nahi aa payega
    }
});

// 2. Database orders fetch engine
async function fetchUserOrders(userId) {
    try {
        const ordersRef = collection(db, "orders");
        
        // 🛠️ FIX: orderBy hata diya taaki Index Error na aaye aur orders turant fetch hon
        const q = query(ordersRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        ordersContainer.innerHTML = "";

        if (querySnapshot.empty) {
            ordersContainer.innerHTML = `
                <p class="empty-text">
                    <i class="fa-solid fa-basket-shopping"></i> You haven't placed any orders yet. Start shopping!
                </p>`;
            return;
        }

        // Sabhi orders ko ek array me store karenge taaki JS se sort kar sakein
        let allOrders = [];
        querySnapshot.forEach((doc) => {
            allOrders.push({ id: doc.id, ...doc.data() });
        });

        // ⚡ Client-Side Sorting: Naye orders ko bina error ke upar dikhane ke liye
        allOrders.sort((a, b) => {
            const dateA = a.createdAt ? a.createdAt.seconds : 0;
            const dateB = b.createdAt ? b.createdAt.seconds : 0;
            return dateB - dateA;
        });

        // Render sorted orders layout
        allOrders.forEach((orderData) => {
            const orderDate = orderData.createdAt ? new Date(orderData.createdAt.seconds * 1000).toLocaleDateString() : "Recent";
            
            if (orderData.items && Array.isArray(orderData.items)) {
                orderData.items.forEach(item => {
                    const orderHtml = `
                        <div class="order-block">
                            <div class="order-meta-header">
                                <div>ORDER PLACED: <strong>${orderDate}</strong></div>
                                <div>TOTAL: <strong>₹${orderData.totalAmount || item.price}</strong></div>
                                <div>ORDER ID: #<span>${orderData.id.substring(0,8).toUpperCase()}</span></div>
                            </div>
                            <div class="order-items-wrapper">
                                <div class="order-item-row">
                                    <img src="${item.image || 'https://via.placeholder.com/60'}" alt="product">
                                    <div class="order-item-details">
                                        <h4>${item.title || item.name}</h4>
                                        <p class="user-welcome" style="margin: 2px 0; font-size: 13px;">Quantity: ${item.quantity || 1}</p>
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
            }
        });

    } catch (error) {
        console.error("Orders collection read error: ", error);
        ordersContainer.innerHTML = `
            <p class="empty-text" style="color: #dc3545;">
                <i class="fa-solid fa-triangle-exclamation"></i> Failed to load orders. Please refresh.
            </p>`;
    }
}

// 3. Edit Profile Form Submission Engine (Save Changes)
editProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newName = updateNameInput.value.trim();
    const currentUser = auth.currentUser;

    if (!newName) {
        updateStatus.style.color = "#dc3545";
        updateStatus.textContent = "Name cannot be empty!";
        return;
    }

    if (currentUser) {
        try {
            updateStatus.style.color = "#007bff";
            updateStatus.textContent = "Saving changes...";

            // Firebase Auth me Profile update logic execute karo
            await updateProfile(currentUser, {
                displayName: newName
            });

            // UI Refresh setup
            userNameDisplay.textContent = newName;
            updateStatus.style.color = "#03543f";
            updateStatus.textContent = "Profile updated successfully! 🎉";

        } catch (error) {
            console.error("Profile update error:", error);
            updateStatus.style.color = "#dc3545";
            updateStatus.textContent = "Error: " + error.message;
        }
    }
});

// 4. User termination action (Logout session end)
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        alert("Logout break error: " + error.message);
    });
});
