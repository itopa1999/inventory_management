let is_admin = false;
let is_user = false;

const token = localStorage.getItem('token');

if (token === null) {
    window.location.href = "auth.html";
}

const BASE_URL = "https://lucky1999.pythonanywhere.com/backend/api";

const navContainer = document.getElementById("navContainer");
const panelTitle = document.getElementById('panel-title');

const adminNav = `
    <a class="nav-link" href="index.html"><i class="fas fa-dashboard me-2"></i>Dashboard</a>
    <a class="nav-link" href="manage.html"><i class="fas fa-boxes me-2"></i>Manage Inventory</a>
    <a class="nav-link" href="request.html"><i class="fas fa-clipboard-check me-2"></i>Manage Requests</a>
    <a class="nav-link" href="reports.html"><i class="fas fa-chart-bar me-2"></i>Generate Reports</a>
    <a class="nav-link" href="notifications.html"><i class="fas fa-bell me-2"></i>Notifications</a>
    <a class="nav-link" href="users.html"><i class="fas fa-users me-2"></i>Manage Users</a>
    <a class="nav-link" href="#!changePassword"><i class="fas fa-key me-2"></i>Change Password</a>
    <a class="nav-link" id="logoutUser" style="color:rgba(194, 12, 12, 0.95);" href="#"><i class="fas fa-sign-out-alt me-2"></i>Logout</a>
`;

const staffNav = `
    <a class="nav-link" href="index.html"><i class="fas fa-dashboard me-2"></i>Dashboard</a>
    <a class="nav-link" href="manage.html"><i class="fas fa-boxes me-2"></i>Manage Inventory</a>
    <a class="nav-link" href="request.html"><i class="fas fa-clipboard-check me-2"></i>Manage Requests</a>
    <a class="nav-link" href="reports.html"><i class="fas fa-chart-bar me-2"></i>Generate Reports</a>
    <a class="nav-link" href="notifications.html"><i class="fas fa-bell me-2"></i>Notifications</a>
    <a class="nav-link" href="#!changePassword"><i class="fas fa-key me-2"></i>Change Password</a>
    <a class="nav-link" id="logoutUser" style="color:rgba(194, 12, 12, 0.95);" href="#"><i class="fas fa-sign-out-alt me-2"></i>Logout</a>
`;

async function fetchUserProfile() {
    try {
        const response = await fetch(`${BASE_URL}/me/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert('error', '❌ ' + (data.error || "❌ Something went wrong! Please try again."));
            return;
        }

        document.getElementById('usernameDisplay').textContent = data.username || 'Unknown User';
        document.getElementById('userProfilePic').src = data.profile_picture || 'default-avatar.png';

        is_admin = data.is_admin;
        is_user = data.is_user;


        if (is_admin) {
            navContainer.innerHTML = adminNav;
            panelTitle.textContent = 'Admin Panel';
        } else if (is_user) {
            navContainer.innerHTML = staffNav;
            panelTitle.textContent = 'User Panel';
        } else {
            navContainer.innerHTML = staffNav;
            panelTitle.textContent = 'Anonymous User';
        }

        // Attach logout listener after nav is rendered
        const logoutBtn = document.getElementById('logoutUser');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                localStorage.removeItem('token');
                showAlert("success", "✅ Logout successful!");
                setTimeout(() => {
                    window.location.href = "auth.html";
                }, 2000);
            });
        }

        // Highlight current nav link
        highlightCurrentNavLink();

    } catch (error) {
        console.error('Error fetching user profile:', error);
        showAlert('error', "❌ Server is not responding. Please try again later.");
    }
}

function showAlert(type, message) {
    const alertBox = document.getElementById("customAlert");
    const alertContent = document.getElementById("alertContent");
    const alertProgress = document.getElementById("alertProgress");

    alertContent.textContent = message;

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

    alertBox.classList.add("active");
    setTimeout(closeAlert, 6000);
}

function closeAlert() {
    document.getElementById("customAlert").classList.remove("active");
}

function highlightCurrentNavLink() {
    const currentPath = window.location.pathname.split("/").pop();
    const links = document.querySelectorAll(".nav-link");

    links.forEach(link => {
        const href = link.getAttribute("href");
        if (href && href === currentPath) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

document.querySelector('.sidebar-overlay').addEventListener('click', toggleSidebar);


// Add this once, for example, after your navContainer is loaded or in your main.js init function

const modalHtml = `
<div class="modal fade" id="changePasswordModal" tabindex="-1" aria-labelledby="changePasswordLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <form id="changePasswordForm">
        <div class="modal-header">
          <h5 class="modal-title" id="changePasswordLabel">Change Password</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="currentPassword" class="form-label">Current Password</label>
            <input type="password" class="form-control" id="currentPassword" name="currentPassword" required>
          </div>
          <div class="mb-3">
            <label for="newPassword" class="form-label">New Password</label>
            <input type="password" class="form-control" id="newPassword" name="newPassword" required>
          </div>
          <div class="mb-3">
            <label for="confirmPassword" class="form-label">Confirm New Password</label>
            <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" required>
          </div>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-primary w-100">Change Password</button>
        </div>
      </form>
    </div>
  </div>
</div>
`;

// Append modal to body
document.body.insertAdjacentHTML('beforeend', modalHtml);


document.addEventListener('click', function(e) {
    if (e.target.closest('a[href="#!changePassword"]') && e.target.textContent.includes('Change Password')) {
        e.preventDefault();

        // Bootstrap 5 modal instance
        const modalEl = document.getElementById('changePasswordModal');
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
});

document.getElementById('changePasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const currentPassword = this.currentPassword.value.trim();
    const newPassword = this.newPassword.value.trim();
    const confirmPassword = this.confirmPassword.value.trim();

    if (newPassword !== confirmPassword) {
        alert("New passwords do not match!");
        return;
    }


    // For demo, just close modal and show alert
    const modalEl = document.getElementById('changePasswordModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    fetch(`${BASE_URL}/change-password/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            password: currentPassword,
            password1: newPassword,
            password2: confirmPassword
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message) {
            showAlert('success', '✅ ' + data.message);
            const modalEl = document.getElementById('changePasswordModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
            // Optionally clear form fields
            this.reset();
        } else if (data.error) {
            showAlert('error', '❌ ' + data.error);
        } else {
             showAlert('error', '❌ An unexpected error occurred.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Failed to change password. Please try again.");
         showAlert('error', '❌ Failed to change password. Please try again.');
    });
});


// ✅ Call on load
window.addEventListener('load', fetchUserProfile);
