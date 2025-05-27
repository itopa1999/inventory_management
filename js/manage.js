
async function fetchData() {
    try {
        const response = await fetch(`${BASE_URL}/inventories/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
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

        const row = `
            <tr 
                data-id="${item.id}" 
                data-name="${item.name}" 
                data-quantity="${item.quantity}" 
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
                <td>
                    <span class="badge ${conditionBadge}">${item.condition}</span>
                </td>
                <td>${item.location}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-2 edit-btn">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
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
let currentItemId = null;

// Bind all edit and delete buttons after rendering
function attachActionEvents() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('tr');
            document.getElementById('itemId').value = row.dataset.id;
            document.getElementById('itemName').value = row.dataset.name;
            document.getElementById('quantity').value = row.dataset.quantity;
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
}

// Add Inventory Button
document.getElementById('addInventoryBtn').addEventListener('click', () => {
    document.getElementById('inventoryForm').reset();
    document.getElementById('itemId').value = '';
    document.getElementById('modalTitle').textContent = 'Add New Inventory';
    document.getElementById('submitText').textContent = 'Add Inventory';
    inventoryModal.show();
});

// Delete Confirm Button
document.getElementById('confirmDelete').addEventListener('click', () => {
    if (currentItemId) {
        console.log('Deleting item:', currentItemId);
        // TODO: Add actual delete logic here
        deleteModal.hide();
    }
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