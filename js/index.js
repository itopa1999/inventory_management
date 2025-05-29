

async function fetchData() {
    try {
        const response = await fetch(`${BASE_URL}/dashboard/`, {
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

function displayData(data)
{
    console.log(data)
    document.getElementById('total-items').innerHTML = data.total_items || 0;
    document.getElementById('total-pendings').innerHTML = data.pending_requests || 0;
    document.getElementById('total-approves').innerHTML = data.approved_requests || 0;

    renderRecentItems(data.inventories || []);
}

function renderRecentItems(items) {
    const container = document.getElementById('recent-items-container');
    container.innerHTML = ''; 

    if (items.length === 0) {
    container.innerHTML = `
        <div class="text-center text-muted py-4">
            No items available.
        </div>
    `;
    } else {
        container.innerHTML = ''; // clear previous content
        items.forEach(item => {
            const iconClass = getCategoryIcon(item.category);
            const timeAgo = getTimeAgo(item.created_at);
            const itemHTML = `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <i class="fas ${iconClass} me-3 fs-5"></i>
                        <div>
                            <h6 class="mb-0">${item.name}</h6>
                            <small class="text-muted">${item.category} - Qty: ${item.quantity}</small>
                        </div>
                    </div>
                    <small class="text-muted">${timeAgo}</small>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', itemHTML);
        });
    }
}

function getCategoryIcon(category) {
    const lower = category.toLowerCase();
    if (lower.includes('electronic')) return 'fa-box text-primary';
    if (lower.includes('furniture')) return 'fa-chair text-success';
    if (lower.includes('printer')) return 'fa-print text-warning';
    if (lower.includes('keyboard')) return 'fa-keyboard text-info';
    if (lower.includes('construction')) return 'fa-tools text-danger';
    return 'fa-cube text-secondary';  // Default icon
}

function getTimeAgo(created_at) {
    const createdDate = new Date(created_at);
    const now = new Date();
    const diffMs = now - createdDate;

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Added ${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `Added ${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `Added ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Added just now';
}



window.addEventListener('load', fetchData);