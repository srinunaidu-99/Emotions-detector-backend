// Helper for API Calls
const API_URL = "http://localhost:3000";

// ================= REGISTER LOGIC =================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();

        if (data.message === "Register success") {
            alert("✅ Account created successfully! Please login.");
            window.location.href = "login.html";
        } else {
            alert("❌ " + data.message);
        }
    });
}

// ================= LOGIN LOGIC =================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.token) {
            localStorage.setItem("token", data.token);
            alert("✅ Login Successful!");
            window.location.href = "dashboard.html"; // Ensure this file is in /frontend
        } else {
            alert("❌ " + data.message);
        }
    });
}

// ================= CAMERA LOGIC (DASHBOARD) =================
const video = document.getElementById('video');
if (video) {
    // Start camera automatically when on dashboard
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then(stream => {
            video.srcObject = stream;
            console.log("🎥 Camera Started");
        })
        .catch(err => {
            console.error("Camera Error:", err);
            alert("⚠️ Camera blocked. Please allow camera access in browser settings.");
        });

    // Handle Detection Button
    document.getElementById('btn').addEventListener('click', async () => {
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');
        const emotionText = document.getElementById('emotionText');

        emotionText.innerText = "Scanning Neural Map...";
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/png');

        try {
            const res = await fetch(`${API_URL}/detect-emotion`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: imageData })
            });
            const data = await res.json();
            emotionText.innerText = "Detected: " + (data.emotion || "Unknown");
        } catch (err) {
            emotionText.innerText = "AI Server Offline";
        }
    });
}