



function markAllAsRead() {
    document.querySelectorAll('.unread').forEach(item => {
        item.classList.remove('unread');
    });
}

function handleApprove(btn) {
    const notification = btn.closest('.notification-item');
    notification.querySelector('.badge').remove();
    notification.innerHTML += '<span class="badge bg-success">Approved</span>';
    notification.classList.remove('unread');
}

function handleReject(btn) {
    const notification = btn.closest('.notification-item');
    notification.querySelector('.badge').remove();
    notification.innerHTML += '<span class="badge bg-danger">Rejected</span>';
    notification.classList.remove('unread');
}

function handleAcknowledge(btn) {
    const notification = btn.closest('.notification-item');
    notification.remove();
}

function loadMoreNotifications() {
    // Add your load more logic here
    console.log('Loading more notifications...');
}
