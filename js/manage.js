
async function fetchData() {
    try {
        const response = await fetch(`${BASE_URL}/inventories/`, {
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

        displayData(data.results)

    } catch (error) {
        console.error('Error fetching user profile:', error);
        showAlert('error', "❌ Server is not responding. Please try again later.");
    }
}

function displayData(data)
{
    console.log(data)
    const tbody = document.querySelector('#inventoryTable tbody');
    tbody.innerHTML = ''; // Clear previous rows

    data.forEach(item => {
        const iconClass = getCategoryIcon(item.category);
        const conditionBadge = getConditionBadge(item.condition);
        
        let actionButtons = '';
        const addBtn = document.getElementById('addInventoryBtn');
        if (is_admin) {
            actionButtons = `
                <button class="btn btn-sm btn-outline-primary me-2 edit-btn">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            `;
        } else if (is_user) {
            addBtn.style.display = 'none';
            actionButtons = `
                <button class="btn btn-sm btn-outline-success request-btn">
                    <i class="fas fa-hand-paper"></i> Request
                </button>
            `;
        }

        const row = `
            <tr 
                data-id="${item.id}" 
                data-name="${item.name}" 
                data-quantity="${item.quantity}" 
                data-category="${item.category}" 
                data-condition="${item.condition}" 
                data-location="${item.location}"
            >
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas ${iconClass} me-3"></i>
                        <span>${item.name}</span>
                    </div>
                </td>
                <td>${item.quantity}</td>
                <td>${item.category}</td>
                <td>
                    <span class="badge ${conditionBadge}">${item.condition}</span>
                </td>
                <td>${item.location}</td>
                <td>
                    ${actionButtons}
                </td>
            </tr>
            `;


        tbody.insertAdjacentHTML('beforeend', row);
    });

    attachActionEvents();
}

function getCategoryIcon(category) {
    const cat = category.toLowerCase();
    if (cat.includes('laptop')) return 'fa-laptop text-primary';
    if (cat.includes('chair') || cat.includes('furniture')) return 'fa-chair text-success';
    if (cat.includes('printer')) return 'fa-print text-warning';
    if (cat.includes('keyboard')) return 'fa-keyboard text-info';
    if (cat.includes('construction')) return 'fa-tools text-danger';
    return 'fa-cube text-secondary'; // Default icon
}

function getConditionBadge(condition) {
    const c = condition.toLowerCase();
    if (c === 'good') return 'bg-success';
    if (c === 'damaged') return 'bg-warning text-dark';
    if (c === 'bad') return 'bg-danger';
    return 'bg-secondary'; // Default badge
}

const inventoryModal = new bootstrap.Modal('#inventoryModal');
const deleteModal = new bootstrap.Modal('#deleteModal');
const requestModal = new bootstrap.Modal('#requestModal');


let currentItemId = null;
let currentInventory = null;

// Bind all edit and delete buttons after rendering
function attachActionEvents() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('tr');
            document.getElementById('itemId').value = row.dataset.id;
            document.getElementById('itemName').value = row.dataset.name;
            document.getElementById('quantity').value = row.dataset.quantity;
            document.getElementById('category').value = row.dataset.category;
            document.getElementById('condition').value = row.dataset.condition;
            document.getElementById('location').value = row.dataset.location;

            document.getElementById('modalTitle').textContent = 'Edit Inventory';
            document.getElementById('submitText').textContent = 'Update Inventory';
            inventoryModal.show();
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('tr');
            currentItemId = row.dataset.id;
            deleteModal.show();
        });
    });

    document.querySelectorAll('.request-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('tr');
            currentInventory = {
                id: row.dataset.id,
                name: row.dataset.name,
                quantity: parseInt(row.dataset.quantity),
            };
            document.getElementById('requestItemName').textContent ='Request for ' +  currentInventory.name;
            document.getElementById('requestedQuantity').value = '';
            requestModal.show();
        });
    });
}

// Add/Edit
document.getElementById('inventoryForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const id = document.getElementById('itemId').value;
    const name = document.getElementById('itemName').value;
    const quantity = document.getElementById('quantity').value;
    const category = document.getElementById('category').value;
    const condition = document.getElementById('condition').value;
    const location = document.getElementById('location').value;

    const payload = { name, quantity, condition, location, category };
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${BASE_URL}/inventories/${id}/` : `${BASE_URL}/inventories/`;

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            inventoryModal.hide();
            fetchData();
            showAlert('success', id ? '✅ Inventory updated!' : '✅ Inventory added!');
        } else {
            const data = await response.json();
            showAlert('error', data.error || "❌ Failed to save inventory.");
        }
    } catch (error) {
        showAlert('error', "❌ Server error while saving inventory.");
    }
});

// Delete
document.getElementById('confirmDelete').addEventListener('click', async () => {
    try {
        const response = await fetch(`${BASE_URL}/inventories/${currentItemId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            deleteModal.hide();
            fetchData();
            showAlert('success', '✅ Inventory deleted!');
        } else {
            showAlert('error', '❌ Failed to delete inventory.');
        }
    } catch (error) {
        showAlert('error', "❌ Server error while deleting inventory.");
    }
});

// Request Submit
document.getElementById('requestForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const requestedQty = parseInt(document.getElementById('requestedQuantity').value);
    const returningDateInput = document.getElementById('returning_date').value;
    const date = new Date(returningDateInput);
    const formattedReturningDate = date.toISOString();

    if (requestedQty > currentInventory.quantity) {
        showAlert('error', '❌ Requested quantity exceeds available quantity!');
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/inventories/${currentInventory.id}/request/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                returning_date: formattedReturningDate,
                quantity: requestedQty
            })
        });

        if (response.ok) {
            requestModal.hide();
            showAlert('success', '✅ Request submitted successfully!');
        } else {
            const data = await response.json();
            showAlert('error', data.error || "❌ Request failed.");
        }
    } catch (error) {
        showAlert('error', "❌ Server error while submitting request.");
    }
});

document.getElementById('addInventoryBtn').addEventListener('click', () => {
    document.getElementById('inventoryForm').reset();
    document.getElementById('itemId').value = '';
    document.getElementById('modalTitle').textContent = 'Add New Inventory';
    document.getElementById('submitText').textContent = 'Add Inventory';
    inventoryModal.show();
});

document.getElementById("searchInput").addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const rows = document.querySelectorAll("#inventoryTable tbody tr");

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(searchTerm) ? "" : "none";
    });
});

window.addEventListener('load', fetchData);