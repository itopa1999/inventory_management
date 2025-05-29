

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

        displayData(data)

    } catch (error) {
        console.error('Error fetching user profile:', error);
        showAlert('error', "❌ Server is not responding. Please try again later.");
    }
}
function displayData(data) {
    console.log(data);
    document.getElementById('total-orders').innerHTML = data.total_orders || 0;
    document.getElementById('total-approves').innerHTML = data.status_counts.approved || 0;
    document.getElementById('total-rejected').innerHTML = data.status_counts.rejected || 0;
    document.getElementById('total-pending').innerHTML = data.status_counts.pending || 0;
    document.getElementById('total-returned').innerHTML = data.status_counts.returned || 0;

    const statuses = ['pending', 'approved', 'rejected', 'returned'];

    // Clear all tbody content first
    statuses.forEach(id => {
        document.querySelector(`#${id} tbody`).innerHTML = '';
    });

    function formatDate(dateStr) {
        if (!dateStr) return '';
        return new Date(dateStr).toISOString().split('T')[0];
    }

    // Prepare containers for rows per status
    const rowsByStatus = {
        pending: '',
        approved: '',
        rejected: '',
        returned: ''
    };

    data.orders.forEach(order => {
        const { id, requester, inventory, quantity, order_date, returning_date, returned_date, status } = order;
        let rowHTML = '';

        let actionButtonsApprove = '';
        let actionButtonsReturn = '';

        if (is_admin) {
            actionButtonsApprove = `
                <button class="btn btn-sm btn-success me-2 update-status" data-id="${id}" data-status="approved">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="btn btn-sm btn-danger update-status" data-id="${id}" data-status="rejected">
                    <i class="fas fa-times"></i> Reject
                </button>
            `;
            actionButtonsReturn = `
                <button class="btn btn-sm text-white btn-info me-2 update-status" data-id="${id}" data-status="returned">
                    <i class="fas fa-undo"></i> Returned
                </button>
            `;
        }

        if (status === 'pending') {
            rowHTML = `
                <tr>
                    <td>${requester}</td>
                    <td>${inventory}</td>
                    <td>${quantity}</td>
                    <td>${formatDate(order_date)}</td>
                    <td>${formatDate(returning_date)}</td>
                    <td>${actionButtonsApprove}</td>
                </tr>
            `;
        } else if (status === 'approved') {
            rowHTML = `
                <tr>
                    <td>${requester}</td>
                    <td>${inventory}</td>
                    <td>${quantity}</td>
                    <td><span class="badge bg-success">Approved</span></td>
                    <td>${actionButtonsReturn}</td>
                </tr>
            `;
        } else if (status === 'rejected') {
            rowHTML = `
                <tr>
                    <td>${requester}</td>
                    <td>${inventory}</td>
                    <td>${quantity}</td>
                    <td><span class="badge bg-danger">Rejected</span></td>
                </tr>
            `;
        } else if (status === 'returned') {
            rowHTML = `
                <tr>
                    <td>${requester}</td>
                    <td>${inventory}</td>
                    <td>${quantity}</td>
                    <td>${returned_date ? formatDate(returned_date) : 'N/A'}</td>
                    <td><span class="badge bg-info">Returned</span></td>
                </tr>
            `;
        }

        rowsByStatus[status] += rowHTML;
    });

    // Insert rows or "No orders" message if empty
    statuses.forEach(status => {
        const tbody = document.querySelector(`#${status} tbody`);
        if (rowsByStatus[status]) {
            tbody.innerHTML = rowsByStatus[status];
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-3">
                        No ${status} orders found.
                    </td>
                </tr>
            `;
        }
    });
}



document.addEventListener('click', function (e) {
    if (e.target.closest('.update-status')) {
        const button = e.target.closest('.update-status');
        const orderId = button.dataset.id;
        const newStatus = button.dataset.status;
        updateOrderStatus(orderId, newStatus);
    }
});


async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`${BASE_URL}/orders/${orderId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert('error', '❌ ' + (data.error || "Failed to update status."));
            return;
        }

        showAlert('success', '✅ Order status updated successfully!');
        fetchData();  // Refresh the UI

    } catch (error) {
        console.error('Update error:', error);
        showAlert('error', "❌ Server error. Please try again later.");
    }
}



window.addEventListener('load', fetchData);