

async function fetchData() {
    try {
        const response = await fetch(`${BASE_URL}/orders/`, {
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
        displayData(data.orders)

    } catch (error) {
        console.error('Error fetching user profile:', error);
        showAlert('error', "❌ Server is not responding. Please try again later.");
    }
}

function displayData(data)
{
    
    const tbody = document.querySelector('#inventoryTable tbody');
    tbody.innerHTML = '';
    const filteredData = data.filter(item => item.status === 'approved' || item.status === 'returned');
    if (filteredData.length === 0) {
        // Show centered message in the table body spanning all columns
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    No request items available.
                </td>
            </tr>
        `;
        return; // No need to continue
    }
    filteredData.forEach(item => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td><div class="d-flex align-items-center"><i class="fas fa-box me-3 text-primary"></i> ${item.inventory}</div></td>
            <td>${item.requester}</td>
            <td>${item.quantity}</td>
            <td>${formatDate(item.ordered_date)}</td>
            <td>${item.returning_date ? formatDate(item.returning_date) : '—'}</td>
            <td>${item.returned_date ? formatDate(item.returned_date) : '—'}</td>
            <td><span class="badge bg-${item.status === 'approved' ? 'success' : 'warning'}">${item.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-2" onclick="downloadItemReport(this)">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary" onclick="printItemReport(this)">
                    <i class="fas fa-print"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function formatDate(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#inventoryTable tbody tr');
    
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

// Print entire report
function printReport() {
    const printModal = new bootstrap.Modal('#printModal');
    const printContent = document.getElementById('printContent');
    
    // Create printable content
    printContent.innerHTML = `
        <h4 class="mb-4"><i class="fas fa-chart-bar me-2"></i>Inventory Report</h4>
        ${document.getElementById('inventoryTable').outerHTML}
        <div class="text-end mt-4">Generated: ${new Date().toLocaleDateString()}</div>
    `;
    
    printModal.show();
}

// Download single item report
function downloadItemReport(btn) {
    const row = btn.closest('tr');
    const itemName = row.cells[0].innerText;
    const csvContent = `Item Name,Category,Quantity,Condition,Location,Last Updated\n${Array.from(row.cells)
        .slice(0, 6).map(cell => cell.innerText).join(',')}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${itemName.replace(/ /g, '_')}_report.csv`;
    a.click();
}

// Print single item report
function printItemReport(btn) {
    const row = btn.closest('tr');
    const printContent = document.getElementById('printContent');
    
    printContent.innerHTML = `
        <h4 class="mb-4"><i class="fas fa-file-alt me-2"></i>Item Report</h4>
        <div class="row">
            ${Array.from(row.cells).map((cell, index) => `
                <div class="col-6 mb-3">
                    <strong>${document.querySelectorAll('th')[index].innerText}:</strong>
                    <span>${cell.innerText}</span>
                </div>
            `).join('')}
        </div>
        <div class="text-end mt-4">Generated: ${new Date().toLocaleDateString()}</div>
    `;
    
    new bootstrap.Modal('#printModal').show();
}

window.addEventListener('load', fetchData);