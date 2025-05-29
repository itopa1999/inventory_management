


async function fetchData() {
    try {
        const response = await fetch(`${BASE_URL}/notifications/`, {
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
        displayData(data.notifications)

    } catch (error) {
        console.error('Error fetching user profile:', error);
        showAlert('error', "❌ Server is not responding. Please try again later.");
    }
}

function displayData(data)
{
    const listGroup = document.querySelector('.list-group');
    listGroup.innerHTML = '';

    data.forEach(notif => {
        const div = document.createElement('div');
        div.className = `list-group-item notification-item ${notif.is_read ? '' : 'unread'}`;
        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-start" onclick="markSingleAsRead(${notif.id}, this)">
                <div class="d-flex align-items-center" style="gap: 1rem;">
                    <div class="notification-icon bg-primary">
                        <i class="fas fa-clipboard-check text-white"></i>
                    </div>
                    <div>
                        <h6 class="mb-1">${notif.title}</h6>
                        <p class="mb-0 text-muted">${notif.message}</p>
                        <small class="text-muted">${new Date(notif.created_at).toLocaleString()}</small>
                    </div>
                </div>
            </div>
        `;
        listGroup.appendChild(div);
    });
}



async function markAllAsRead() {
    try {
        const response = await fetch(`${BASE_URL}/notifications/mark-all-read/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            document.querySelectorAll('.notification-item').forEach(item => {
                item.classList.remove('unread');
            });
            fetchData()
        }
    } catch (error) {
        console.error("Error marking all as read:", error);
        showAlert('error', "❌ Error marking all as read:")

    }
}


async function markSingleAsRead(notificationId, element) {
    try {
        const response = await fetch(`${BASE_URL}/notifications/${notificationId}/mark-read/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok && element.classList.contains('unread')) {
            element.classList.remove('unread');
            fetchData()
        }
    } catch (error) {
        console.error(`Error marking notification ${notificationId} as read`, error);
        showAlert('error', "❌ Error marking notification")
    }
}



window.addEventListener('load', fetchData);