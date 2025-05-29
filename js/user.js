
async function fetchData() {
    try {
        const response = await fetch(`${BASE_URL}/users/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            window.location.href = "auth.html";
            localStorage.removeItem('token');
        }

        const data = await response.json();

        if (!response.ok) {
            showAlert('error', '❌ ' + (data.error || "❌ Something went wrong! Please try again."));
            return;
        }
        console.log(data)
        displayData(data.results)

    } catch (error) {
        console.error('Error fetching user profile:', error);
        showAlert('error', "❌ Server is not responding. Please try again later.");
    }
}

function displayData(data)
{
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";  // Clear existing rows
    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-muted py-4">
                    No users found.
                </td>
            </tr>
        `;
        return;
    }
    data.forEach(user => {
        const tr = document.createElement("tr");

        const role = user.is_admin ? "Admin" : "User";
        const statusText = user.is_active ? "Disable" : "Enable";
        const btnClass = user.is_active ? "btn-outline-danger" : "btn-outline-success";

        tr.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <img src="${user.profile_picture}" class="rounded-circle me-3" alt="User avatar" width="40" height="40">
                    <div>
                        <h6 class="mb-0">${user.username}</h6>
                    </div>
                </div>
            </td>
            <td>${role}</td>
            <td>
                <button class="btn btn-sm ${btnClass} me-2" onclick="toggleUser('${user.id}')">
                    <i class="fas fa-edit"></i> ${statusText}
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function toggleUser(id) {
    fetch(`${BASE_URL}/user/${id}/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
        showAlert('success', '✅ ' + (data.message || 'User status updated successfully!'));
        fetchData(); // Refresh the list
    })
    .catch(error => {
        console.error('Error toggling user:', error);
        showAlert('danger', '❌ Failed to update user status.');
    });
}



document.getElementById("userForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const form = e.target;
    const formData = {
        username: form.username.value,
    };

    fetch(`${BASE_URL}/register/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.message === "Account created") {
            showAlert('success', `✅ ${data.message}`);
            form.reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
            modal.hide();
            fetchData(); // Refresh user list
        } else {
            showAlert('error', '❌ Failed to create user.');
        }
    })
    .catch(error => {
        console.error('Error creating user:', error);
        showAlert('error', '❌ Server error.');
    });
});


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


window.addEventListener('load', fetchData);