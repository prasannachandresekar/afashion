document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
    const body = document.body;

    // Check saved theme or default to light
    const savedTheme = localStorage.getItem('aveline-theme') || 'light';

    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            // update icons
            themeToggleBtns.forEach(btn => {
                const darkIcon = btn.querySelector('.dark-icon');
                const lightIcon = btn.querySelector('.light-icon');
                if (darkIcon) darkIcon.style.display = 'none';
                if (lightIcon) lightIcon.style.display = 'block';
            });
        } else {
            body.classList.remove('dark-mode');
            // update icons
            themeToggleBtns.forEach(btn => {
                const darkIcon = btn.querySelector('.dark-icon');
                const lightIcon = btn.querySelector('.light-icon');
                if (darkIcon) darkIcon.style.display = 'block';
                if (lightIcon) lightIcon.style.display = 'none';
            });
        }
    }

    // Initial run
    applyTheme(savedTheme);

    // Toggle theme
    themeToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isDark = body.classList.contains('dark-mode');
            const newTheme = isDark ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('aveline-theme', newTheme);
        });
    });

    // Back to top functionality
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- Cart Functionality ---

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    const simulateCheckoutBtns = document.querySelectorAll('.simulate-checkout-btn');
    const checkoutAlert = document.getElementById('checkoutAlert');
    const alertCloseBtn = document.querySelector('.alert-close-btn');

    if (alertCloseBtn && checkoutAlert) {
        alertCloseBtn.addEventListener('click', () => {
            checkoutAlert.classList.remove('show');
            setTimeout(() => checkoutAlert.classList.add('d-none'), 150);
        });
    }

    function renderCart() {
        const cartCounts = document.querySelectorAll('.cart-count');
        const cartItemsContainers = document.querySelectorAll('.cart-items-container');
        const cartTotalPrices = document.querySelectorAll('.cart-total-price');

        // Calculate total qty and price
        let totalQty = 0;
        let totalPrice = 0;

        cart.forEach(item => {
            totalQty += item.qty;
            totalPrice += item.price * item.qty;
        });

        // Update badges
        cartCounts.forEach(badge => {
            badge.textContent = totalQty;
        });

        // Update total prices
        cartTotalPrices.forEach(el => {
            el.textContent = '$' + totalPrice.toFixed(2);
        });

        // Map cart items html
        let html = '';
        if (cart.length === 0) {
            html = '<p class="text-center text-muted my-2">Your cart is empty.</p>';
        } else {
            cart.forEach(item => {
                html += `
                    <div class="d-flex align-items-center mb-3">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-img border rounded me-3" style="width: 50px; height: 50px; object-fit: cover;">
                        <div class="flex-grow-1">
                            <h6 class="mb-0 fs-6">${item.name}</h6>
                            <small class="text-muted">${item.qty} x $${item.price.toFixed(2)}</small>
                        </div>
                        <button class="btn btn-sm text-danger border-0 remove-item-btn" data-id="${item.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                `;
            });
        }

        // Render to all dropdowns
        cartItemsContainers.forEach(container => {
            container.innerHTML = html;
        });

        // Attach listeners to remove buttons
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                removeFromCart(id);
                // Keep dropdown open when removing
                e.stopPropagation();
            });
        });
    }

    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.qty += 1;
        } else {
            product.qty = 1;
            cart.push(product);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();

        // Optionally show feedback to user here
    }

    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }

    // Attach event listeners to Add to Cart buttons
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const product = {
                id: btn.getAttribute('data-id'),
                name: btn.getAttribute('data-name'),
                price: parseFloat(btn.getAttribute('data-price')),
                image: btn.getAttribute('data-img')
            };
            addToCart(product);
        });
    });

    // Handle initial render
    renderCart();

    // Checkout Behavior
    simulateCheckoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (cart.length === 0) return;

            // Save to orders
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.push({
                date: new Date().toISOString(),
                items: cart,
                total: cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
            });
            localStorage.setItem('orders', JSON.stringify(orders));

            // Clear cart
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();

            // Show alert
            if (checkoutAlert) {
                checkoutAlert.classList.remove('d-none');
                checkoutAlert.classList.add('show');

                // Close all dropdowns
                const dropdowns = document.querySelectorAll('.dropdown-menu.show');
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('show');
                });

                // Auto hide alert after 3 seconds
                setTimeout(() => {
                    checkoutAlert.classList.remove('show');
                    setTimeout(() => checkoutAlert.classList.add('d-none'), 150);
                }, 3000);
            }
        });
    });

    // --- Form Validation (Login & Register) ---
    const authForms = document.querySelectorAll('.auth-form');

    authForms.forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            let isValid = true;
            const inputs = form.querySelectorAll('input[required]');

            inputs.forEach(input => {
                // For checkboxes
                if (input.type === 'checkbox') {
                    if (!input.checked) {
                        isValid = false;
                        input.classList.add('is-invalid');
                    } else {
                        input.classList.remove('is-invalid');
                    }
                } else {
                    // For standard text/email/password inputs
                    if (!input.value.trim()) {
                        isValid = false;
                        input.classList.add('is-invalid');
                    } else {
                        input.classList.remove('is-invalid');
                    }
                }
            });

            // Password match validation for register
            const password = form.querySelector('#regPassword');
            const confirmPassword = form.querySelector('#regConfirmPassword');

            if (password && confirmPassword) {
                if (password.value !== confirmPassword.value && confirmPassword.value.trim() !== '') {
                    isValid = false;
                    confirmPassword.classList.add('is-invalid');
                    // Add small invalid feedback if not present
                    if (!confirmPassword.nextElementSibling || !confirmPassword.nextElementSibling.classList.contains('invalid-feedback')) {
                        const feedback = document.createElement('div');
                        feedback.classList.add('invalid-feedback');
                        feedback.innerText = 'Passwords do not match.';
                        confirmPassword.parentNode.insertBefore(feedback, confirmPassword.nextSibling);
                    }
                }
            }

            if (isValid) {
                // Show success alert
                const alertHtml = `
                    <div class="alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3 shadow-sm" role="alert" style="z-index: 9999;">
                        ${form.id === 'registerForm' ? 'Registration successful!' : 'Login successful!'}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `;
                document.body.insertAdjacentHTML('beforeend', alertHtml);
                form.reset();

                // Auto hide alert after 3 seconds
                setTimeout(() => {
                    const alertEl = document.querySelector('.alert-success:not(#checkoutAlert)');
                    if (alertEl) {
                        alertEl.classList.remove('show');
                        setTimeout(() => alertEl.remove(), 150);
                    }
                }, 3000);
            }
        });

        // Remove invalid class on input
        form.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('is-invalid');
            });
            if (input.type === 'checkbox') {
                input.addEventListener('change', () => {
                    input.classList.remove('is-invalid');
                });
            }
        });
    });
});
