
const is_admin = localStorage.getItem('is_admin');
const is_staff = localStorage.getItem('is_staff');

const BASE_URL = "http://127.0.0.1:8000/backend/api";

const navContainer = document.getElementById("navContainer");

const adminNav = `
    <a class="nav-link" href="admin_index.html"><i class="fas fa-dashboard me-2"></i>Dashboard</a>
    <a class="nav-link" href="manage.html"><i class="fas fa-boxes me-2"></i>Manage Inventory</a>
    <a class="nav-link" href="request.html"><i class="fas fa-clipboard-check me-2"></i>Manage Requests</a>
    <a class="nav-link" href="reports.html"><i class="fas fa-chart-bar me-2"></i>Generate Reports</a>
    <a class="nav-link" href="notifications.html"><i class="fas fa-bell me-2"></i>Notifications</a>
    <a class="nav-link" href="users.html"><i class="fas fa-users me-2"></i>Manage Users</a>
    <a class="nav-link id="logoutUser" style="color:rgba(194, 12, 12, 0.95);" text-danger" href="#"><i class="fas fa-sign-out-alt me-2"></i>Logout</a>
`;

const staffNav = `
    <a class="nav-link" href="index.html"><i class="fas fa-dashboard me-2"></i>Dashboard</a>
    <a class="nav-link" href="manage.html"><i class="fas fa-boxes me-2"></i>Manage Inventory</a>
    <a class="nav-link" href="#"><i class="fas fa-clipboard-check me-2"></i>Approve/Reject Requests</a>
    <a class="nav-link" href="#"><i class="fas fa-chart-bar me-2"></i>Generate Reports</a>
    <a class="nav-link" href="#"><i class="fas fa-bell me-2"></i>Notifications</a>
    <a class="nav-link text-danger" href="#"><i class="fas fa-sign-out-alt me-2"></i>Logout</a>

`;

if (is_admin) {
  navContainer.innerHTML = adminNav;
} else if (is_staff) {
  navContainer.innerHTML = staffNav;
} else {
  navContainer.innerHTML = adminNav;
  // window.location.href = "auth.html";
}


document.addEventListener("DOMContentLoaded", function () {
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
  });


document.getElementById('logoutUser').addEventListener('click', function() {
    RemoveAccessFromLocalStorage()
    showAlert("success","✅ Logout successful! ")
    setTimeout(() => {
        window.location.href = "auth.html";
    }, 2000);
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



function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Close sidebar when clicking outside on mobile
document.querySelector('.sidebar-overlay').addEventListener('click', toggleSidebar);