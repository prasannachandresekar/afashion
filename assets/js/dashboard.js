document.addEventListener('DOMContentLoaded', () => {
    // 1. Sidebar Toggle Logic (Mobile)
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const openBtn = document.getElementById('openSidebar');
    const closeBtn = document.getElementById('closeSidebar');

    function toggleSidebar() {
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
    }

    if (openBtn) openBtn.addEventListener('click', toggleSidebar);
    if (closeBtn) closeBtn.addEventListener('click', toggleSidebar);
    if (overlay) overlay.addEventListener('click', toggleSidebar);

    // Date placeholder
    const currentDateEl = document.getElementById('currentDate');
    if (currentDateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateEl.innerText = new Date().toLocaleDateString('en-US', options);
    }

    // 2. Admin Dark Mode Theme Toggle
    // (Using a separate key 'aveline-admin-theme' to not override front-end variables)
    const themeBtn = document.getElementById('adminThemeToggle');
    const body = document.body;
    let isAdminDark = localStorage.getItem('aveline-admin-theme') === 'dark';

    function setAdminTheme(isDark) {
        const darkIcon = themeBtn.querySelector('.dark-icon');
        const lightIcon = themeBtn.querySelector('.light-icon');

        if (isDark) {
            body.classList.add('admin-dark-mode');
            if (darkIcon) darkIcon.style.display = 'none';
            if (lightIcon) lightIcon.style.display = 'block';
        } else {
            body.classList.remove('admin-dark-mode');
            if (darkIcon) darkIcon.style.display = 'block';
            if (lightIcon) lightIcon.style.display = 'none';
        }
    }

    // Initialize theme based on saved preference
    if (themeBtn) {
        setAdminTheme(isAdminDark);

        themeBtn.addEventListener('click', () => {
            isAdminDark = !isAdminDark;
            setAdminTheme(isAdminDark);
            localStorage.setItem('aveline-admin-theme', isAdminDark ? 'dark' : 'light');
        });
    }

    // 3. Load Orders and Calculate Statistics dynamically from localStorage
    const ordersString = localStorage.getItem('orders');
    let orders = [];
    try {
        if (ordersString) {
            orders = JSON.parse(ordersString);
        }
    } catch (e) {
        console.error("Error parsing orders from local storage:", e);
    }

    // Fallback if bad format
    if (!Array.isArray(orders)) orders = [];

    // Calculate totals based on simulated checkouts
    const totalOrders = orders.length;
    let totalRevenue = 0;

    orders.forEach(order => {
        totalRevenue += parseFloat(order.total) || 0;
    });

    // Update the DOM Statistics numbers smoothly
    const statOrdersEl = document.getElementById('statOrders');
    const statRevenueEl = document.getElementById('statRevenue');

    if (statOrdersEl) statOrdersEl.innerText = totalOrders;
    if (statRevenueEl) statRevenueEl.innerText = '$' + totalRevenue.toFixed(2);
    // Customers & Messages count are set to static HTML defaults (124 & 8)

    // 4. Populate Dynamic Orders Table
    const ordersTableBody = document.getElementById('ordersTableBody');
    if (ordersTableBody) {
        if (orders.length === 0) {
            ordersTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">No orders yet. Run a simulated checkout from the front-end to see data here.</td>
                </tr>
            `;
        } else {
            // Reverse array to show newest orders first
            const displayOrders = [...orders].reverse();
            let html = '';

            displayOrders.forEach((order, index) => {
                // Generate a reliable pseudo-ID using timestamp logic or index
                const d = new Date(order.date);
                const orderId = `ORD-${!isNaN(d.getTime()) ? d.getTime().toString().slice(-5) : '00000'}${index}`;

                // Format the exact date beautifully
                const dateStr = !isNaN(d.getTime()) ? d.toLocaleDateString('en-US') + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Unknown Date';

                // Calculate item quantity sum reliably
                let itemCount = 0;
                if (Array.isArray(order.items)) {
                    itemCount = order.items.reduce((sum, item) => sum + (item.qty || 1), 0);
                }

                const totalStr = '$' + (parseFloat(order.total) || 0).toFixed(2);

                html += `
                    <tr>
                        <td class="fw-medium text-primary">#${orderId}</td>
                        <td class="text-muted"><i class="bi bi-clock me-1 small"></i> ${dateStr}</td>
                        <td>${itemCount} items</td>
                        <td class="fw-bold">${totalStr}</td>
                        <td><span class="badge bg-primary text-white bg-opacity-75 rounded-pill fw-normal px-2">Processing</span></td>
                    </tr>
                `;
            });
            ordersTableBody.innerHTML = html;
        }
    }
});
