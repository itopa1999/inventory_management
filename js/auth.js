
document.addEventListener("DOMContentLoaded", function () {
    const BASE_URL = "http://127.0.0.1:8000/backend/api";
    document.querySelector(".login-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const password = formData.get("password");

    if (password.length < 8) {
        showAlert("info","ℹ️ Password must be at least 8 characters long.");
        return;
    }

    const loginButton = document.getElementById("loginBtn");
    const loginSpinner = document.getElementById("loginSpinner");

    loginButton.disabled = true;
    loginSpinner.classList.remove("d-none");

    try {
        const response = await fetch(`${BASE_URL}/login/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(Object.fromEntries(formData.entries()))
        });

        loginButton.disabled = false;
        loginSpinner.classList.add("d-none");

        const data = await response.json();

        if (!response.ok) {
            showAlert('error','❌ '+ data.error || "❌ Something went wrong! Please try again.");
            return;
        }
        localStorage.setItem("token", data.access);
        document.querySelector(".login-form").reset();

        window.location.href = "index.html";

    } catch (error) {
        showAlert('error', "❌ Server is not responding. Please try again later.");
    } finally {
        loginButton.disabled = false;
        loginSpinner.classList.add("d-none");
    }

});


});



function showAlert(type, message) {
    const alertBox = document.getElementById("customAlert");
    const alertContent = document.getElementById("alertContent");
    const alertProgress = document.getElementById("alertProgress");

    alertContent.textContent = message;

    // Apply type-based color
    let bgColor;
    switch (type) {
        case 'success':
            bgColor = 'var(--success)';
            break;
        case 'info':
            bgColor = 'var(--info)';
            break;
        case 'error':
            bgColor = 'var(--error)';
            break;
        default:
            bgColor = '#ccc';
    }

    alertProgress.style.background = bgColor;

    // Show alert
    alertBox.classList.add("active");

    // Auto-close after 6 seconds
    setTimeout(closeAlert, 6000);
}

function closeAlert() {
    document.getElementById("customAlert").classList.remove("active");
}