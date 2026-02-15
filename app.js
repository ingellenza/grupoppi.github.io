// DOM Elements
const productList = document.getElementById('product-list');
const cartBtn = document.getElementById('cart-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCartBtn = document.getElementById('close-cart');
const overlay = document.getElementById('overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartCountElement = document.getElementById('cart-count');
const checkoutBtn = document.getElementById('checkout-btn');

// State
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];

// API Configuration
// NOTE: When deploying, this URL will change to the Render backend URL
const API_URL = 'https://grupoppi-backend.onrender.com/api';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updateCartUI();
    initSlider(); // Initialize Slider
});

// Helper: Scroll with offset for sticky header
function scrollToSection(elementId) {
    const element = document.getElementById(elementId) || document.querySelector(elementId);
    if (!element) return;

    const headerOffset = 120; // Adjust this value to center images better (Header height + padding)
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
    });
}

// Slider Logic
function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const indicators = document.querySelectorAll('.indicator');
    let currentSlide = 0;
    const slideInterval = 5000; // 5 seconds

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(ind => ind.classList.remove('active'));

        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;

        slides[currentSlide].classList.add('active');
        indicators[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    // Event Listeners
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    indicators.forEach((ind, index) => {
        ind.addEventListener('click', () => showSlide(index));
    });

    // Auto Play
    setInterval(nextSlide, slideInterval);
}

// Fetch Products from Backend
async function fetchProducts() {
    try {
        // Fallback Mock Data if Backend is not running yet
        // This ensures the user sees something immediately
        const mockProducts = [
            {
                _id: '1',
                name: 'Yerba Mate Taragüi 500g',
                price: 4500,
                image: 'https://http2.mlstatic.com/D_NQ_NP_906950-MLA46054045501_052021-O.webp',
                description: 'Clásica yerba mate argentina con palo.'
            },
            {
                _id: '2',
                name: 'Dulce de Leche Havanna 450g',
                price: 6200,
                image: 'https://http2.mlstatic.com/D_NQ_NP_899201-MLA45750836932_042021-O.webp',
                description: 'El auténtico dulce de leche de Mar del Plata.'
            },
            {
                _id: '3',
                name: 'Alfajor Jorgito Chocolate (Caja x6)',
                price: 3500,
                image: 'https://acdn.mitiendanube.com/stores/001/151/835/products/jorgito-negro-11-2c97444101e45758b916171960256860-640-0.jpg',
                description: 'Alfajor relleno con dulce de leche bañado en chocolate semiamargo.'
            },
            {
                _id: '4',
                name: 'Galletitas Chocolinas 170g',
                price: 1800,
                image: 'https://jumboargentina.vtexassets.com/arquivos/ids/698288/Galletitas-Chocolinas-Original-170-Gr-1-840656.jpg?v=637851610480300000',
                description: 'Las galletitas de chocolate más famosas para tu chocotorta.'
            }
        ];

        // Try to fetch from real API, fallback to mock
        try {
            const response = await fetch(`${API_URL}/products`);
            if (!response.ok) throw new Error('API Error');
            products = await response.json();
            if (products.length === 0) products = mockProducts;
        } catch (error) {
            console.log('Using mock data since backend is unreachable:', error);
            products = mockProducts;
        }

        renderProducts(products);
        renderCategories(products);
    } catch (error) {
        productList.innerHTML = '<p class="error">Error al cargar productos. Por favor intenta más tarde.</p>';
        console.error('Error fetching products:', error);
    }
}

// Render Products to DOM
function renderProducts(productsToRender) {
    productList.innerHTML = '';
    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        // Format price to currency
        const formattedPrice = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.price);

        productCard.innerHTML = `
            <img src="${product.image ? (product.image.startsWith('http') ? product.image : API_URL.replace('/api', '') + product.image) : 'https://via.placeholder.com/300x200?text=Sin+Imagen'}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h4 class="product-title">${product.name}</h4>
                <p class="product-description">${product.description || ''}</p>
                <p class="product-price">${formattedPrice}</p>
                <button class="add-to-cart" data-id="${product._id}">
                    <i class="fas fa-shopping-cart"></i> Agregar al Carrito
                </button>
            </div>
        `;
        productList.appendChild(productCard);
    });

    // Add Event Listeners to Buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').dataset.id;
            addToCart(id);
        });
    });
}

// Render Categories to Menu
function renderCategories(products) {
    const categoryMenu = document.getElementById('category-menu');
    if (!categoryMenu) return;

    // Group by Category -> Subcategories
    const categoryMap = {};

    products.forEach(p => {
        if (!p.category) return;
        if (!categoryMap[p.category]) {
            categoryMap[p.category] = new Set();
        }
        if (p.subcategory) {
            categoryMap[p.category].add(p.subcategory);
        }
    });

    categoryMenu.innerHTML = '';

    // Sort categories alphabetically
    const sortedCategories = Object.keys(categoryMap).sort();

    sortedCategories.forEach(cat => {
        const subcats = Array.from(categoryMap[cat]).sort();

        if (subcats.length > 0) {
            // Render as Submenu
            const submenuContainer = document.createElement('div');
            submenuContainer.classList.add('dropdown-submenu');

            const catLink = document.createElement('a');
            catLink.href = '#';
            catLink.innerHTML = `${cat} <i class="fas fa-chevron-right"></i>`;

            // Clicking Category shows all products in that category
            catLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent closing immediately if handled elsewhere
                const filtered = products.filter(p => p.category === cat);
                renderProducts(filtered);
                scrollToSection('#product-list');
            });

            const subMenuDiv = document.createElement('div');
            subMenuDiv.classList.add('dropdown-content');

            subcats.forEach(sub => {
                const subLink = document.createElement('a');
                subLink.href = '#';
                subLink.innerText = sub;
                subLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const filtered = products.filter(p => p.category === cat && p.subcategory === sub);
                    renderProducts(filtered);
                    scrollToSection('#product-list');
                });
                subMenuDiv.appendChild(subLink);
            });

            submenuContainer.appendChild(catLink);
            submenuContainer.appendChild(subMenuDiv);
            categoryMenu.appendChild(submenuContainer);

        } else {
            // Render as Simple Link
            const link = document.createElement('a');
            link.href = `#`;
            link.innerText = cat;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const filtered = products.filter(p => p.category === cat);
                renderProducts(filtered);
                scrollToSection('#product-list');
            });
            categoryMenu.appendChild(link);
        }
    });
}

// Add to Cart Logic
function addToCart(id) {
    const product = products.find(p => p._id === id);
    const existingItem = cart.find(item => item._id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    openCart();
}

// Remove from Cart Logic
function removeFromCart(id) {
    cart = cart.filter(item => item._id !== id);
    saveCart();
    updateCartUI();
}

// Save Cart to LocalStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update Cart UI
function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    let count = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Tu carrito está vacío</p>';
    } else {
        cart.forEach(item => {
            total += item.price * item.quantity;
            count += item.quantity;

            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            const formattedPrice = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(item.price);

            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h5 class="cart-item-title">${item.name}</h5>
                    <p class="cart-item-price">${formattedPrice} x ${item.quantity}</p>
                </div>
                <div class="remove-item" data-id="${item._id}">
                    <i class="fas fa-trash"></i>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
    }

    // Update totals and badge
    cartTotalElement.innerText = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(total);
    cartCountElement.innerText = count;

    // Add listeners to remove buttons
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.remove-item').dataset.id;
            removeFromCart(id);
        });
    });
}

// Cart Sidebar Toggles
function openCart() {
    cartSidebar.classList.add('open');
    overlay.classList.add('active');
}

function closeCart() {
    cartSidebar.classList.remove('open');
    overlay.classList.remove('active');
}

cartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openCart();
});

closeCartBtn.addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);

// Checkout Logic (Mercado Pago Integration)
checkoutBtn.addEventListener('click', async () => {
    if (cart.length === 0) return alert('El carrito está vacío');

    checkoutBtn.innerText = 'Procesando...';
    checkoutBtn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/payment/create-preference`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items: cart })
        });

        if (!response.ok) throw new Error('Error creating preference');

        const data = await response.json();

        // Redirect to Mercado Pago Sandbox
        if (data.init_point) {
            window.location.href = data.init_point;
        } else {
            alert('Error al iniciar el pago. Intenta nuevamente.');
        }

    } catch (error) {
        console.error('Checkout error:', error);
        // Mostrar el mensaje real del error para facilitar depuración
        alert(`Error: ${error.message || 'Hubo un error al procesar el pago.'}`);
    } finally {
        checkoutBtn.innerText = 'Finalizar Compra';
        checkoutBtn.disabled = false;
    }
});
