


// Initialize modal for user management
const userModal = new bootstrap.Modal('#userModal');

// Handle form submission
document.getElementById('userForm').addEventListener('submit', function(e) {
    e.preventDefault();
    // Add user to table
    userModal.hide();
});

// Responsive table handling
function adjustTable() {
    const headings = document.querySelectorAll('thead th');
    document.querySelectorAll('tbody tr').forEach(row => {
        Array.from(row.children).forEach((td, index) => {
            td.setAttribute('data-label', headings[index].innerText);
        });
    });
}

window.addEventListener('resize', adjustTable);
adjustTable();