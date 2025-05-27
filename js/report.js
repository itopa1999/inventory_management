


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