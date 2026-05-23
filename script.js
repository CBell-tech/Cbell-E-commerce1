let count = 0;

const product = {
    id: 'sneaker-fall-1',
    name: 'Fall Limited Edition Sneakers',
    unitPrice: 125.0,
};

const CART_STORAGE_KEY = 'ecommerce1_cart';

const cart = {
    items: [],
    get quantity() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    get subtotal() {
        return this.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    },
    add(product, qty) {
        if (qty <= 0) return;
        const existing = this.items.find((item) => item.id === product.id);
        if (existing) {
            existing.quantity += qty;
        } else {
            this.items.push({ ...product, quantity: qty });
        }
        this.save();
    },
    clear() {
        this.items = [];
        this.save();
    },
    save() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
    },
    load() {
        const data = localStorage.getItem(CART_STORAGE_KEY);
        if (!data) return;
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                this.items = parsed.map((item) => ({ ...item }));
            }
        } catch (e) {
            console.warn('Could not parse cart data from localStorage', e);
            this.items = [];
            localStorage.removeItem(CART_STORAGE_KEY);
        }
    },
};

const counterEl = document.getElementById('counter');
const cartBadgeEl = document.getElementById('cartBadge');
const addToCartBtn = document.getElementById('addToCartBtn');
const cartIconEl = document.getElementById('cartIcon');
const cartDropdownEl = document.getElementById('cartDropdown');
const cartContentEl = document.getElementById('cartContent');

function renderCounter() {
    counterEl.textContent = count;
}

function renderCartBadge() {
    cartBadgeEl.textContent = cart.quantity;
    cartBadgeEl.style.display = cart.quantity > 0 ? 'inline-block' : 'none';
}

function renderCartDropdown() {
    if (!cartContentEl) return;

    if (cart.quantity === 0) {
        cartContentEl.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
        return;
    }

    const rows = cart.items
        .map((item) =>
            `<div class="cart-row"><span class="cart-name">${item.name}</span><span>${item.quantity} × $${item.unitPrice.toFixed(
                2
            )}</span></div>`
        )
        .join('');

    const total = cart.subtotal.toFixed(2);

    cartContentEl.innerHTML = `${rows}
        <div class="cart-row"><strong>Total</strong><strong>$${total}</strong></div>
        <button id="clearCartBtn" class="cart-delete">Clear cart</button>`;

    const clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            cart.clear();
            renderCartBadge();
            renderCartDropdown();
            cartDropdownEl.classList.add('hidden');
        });
    }
}

function increase() {
    count += 1;
    renderCounter();
}

function decrease() {
    if (count > 0) {
        count -= 1;
        renderCounter();
    }
}

function reset() {
    count = 0;
    renderCounter();
}

function addToCart(event) {
    if (event) event.stopPropagation();

    if (count <= 0) {
        return;
    }

    cart.add(product, count);
    reset();
    renderCartBadge();
    renderCartDropdown();
    if (cartDropdownEl) cartDropdownEl.classList.remove('hidden');
}

if (addToCartBtn) addToCartBtn.addEventListener('click', addToCart);

if (cartIconEl) {
    cartIconEl.addEventListener('click', () => {
        if (!cartDropdownEl) return;
        cartDropdownEl.classList.toggle('hidden');
        renderCartDropdown();
    });
}

window.addEventListener('click', (event) => {
    const wrapper = document.getElementById('cartWrapper');
    if (!wrapper || !cartDropdownEl) return;

    if (addToCartBtn && addToCartBtn.contains(event.target)) {
        return;
    }

    if (!wrapper.contains(event.target)) {
        cartDropdownEl.classList.add('hidden');
    }
});

renderCounter();
renderCartBadge();
renderCartDropdown();
