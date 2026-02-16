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
                name: 'Ladrillo Hueco 12x18x33',
                price: 1200,
                stock: 1000,
                category: 'Obra Gruesa',
                image: 'https://http2.mlstatic.com/D_NQ_NP_796532-MLA45711365440_042021-O.webp',
                description: 'Ladrillo cerámico hueco para muros portantes y cerramientos.'
            },
            {
                _id: '2',
                name: 'Cemento Loma Negra 50kg',
                price: 9500,
                stock: 50,
                category: 'Obra Gruesa',
                image: 'https://http2.mlstatic.com/D_NQ_NP_916327-MLA44546376362_012021-O.webp',
                description: 'Cemento Portland fillerizado, ideal para uso general en la construcción.'
            },
            {
                _id: '3',
                name: 'Hierro del 8 (Barra 12m)',
                price: 12500,
                stock: 0, // Mock "Sin Stock"
                category: 'Hierros',
                image: 'https://http2.mlstatic.com/D_NQ_NP_606622-MLA44597332766_012021-O.webp',
                description: 'Acero aletado para hormigón armado. Barra de 12 metros.'
            },
            {
                _id: '4',
                name: 'Placa Durlock Estándar 12.5mm',
                price: 15800,
                stock: 20,
                category: 'Durlock',
                image: 'https://http2.mlstatic.com/D_NQ_NP_736279-MLA44566373804_012021-O.webp',
                description: 'Placa de yeso estándar para paredes y cielorrasos interiores.'
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

        // Stock Logic (Robust check)
        // Check if stock exists and exactly 0 (handling numbers and numeric strings)
        const stockValue = product.stock !== undefined ? Number(product.stock) : 10; // Default to 10 if undefined
        const isOutOfStock = stockValue === 0;

        const stockBadge = isOutOfStock ? '<div class="badge-no-stock">SIN STOCK</div>' : '';
        const buttonHtml = isOutOfStock
            ? `<button class="add-to-cart" disabled style="background-color: #ccc; cursor: not-allowed; transform: none;">Sin Stock</button>`
            : `<button class="add-to-cart" data-id="${product._id}">
                <i class="fas fa-shopping-cart"></i> Agregar al Carrito
               </button>`;

        productCard.innerHTML = `
            <div style="position: relative;">
                ${stockBadge}
                <img src="${product.image ? (product.image.startsWith('http') ? product.image : API_URL.replace('/api', '') + product.image) : 'https://via.placeholder.com/300x200?text=Sin+Imagen'}" alt="${product.name}" class="product-image" style="${isOutOfStock ? 'opacity: 0.6;' : ''}">
            </div>
            <div class="product-info">
                <h4 class="product-title">${product.name}</h4>
                <p class="product-description">${product.description || ''}</p>
                <p class="product-price">${formattedPrice}</p>
                ${buttonHtml}
            </div>
        `;
        productList.appendChild(productCard);
    });

    // Add Event Listeners to Buttons (only active ones)
    document.querySelectorAll('.add-to-cart:not([disabled])').forEach(btn => {
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

            // Robust Image Logic: Handle relative paths and fallbacks
            // User requested "miniatura sin texto" (thumbnail without text)
            let imageUrl = 'https://via.placeholder.com/80/cccccc/ffffff?text=+'; // Blank gray box with specific size

            if (item.image) {
                if (item.image.startsWith('http')) {
                    imageUrl = item.image;
                } else {
                    // It's a relative path, prepend API URL base if known, otherwise use it as relative to site
                    // Assuming API_URL is like .../api, we want the root .../
                    const baseUrl = API_URL.replace('/api', '');
                    imageUrl = baseUrl + item.image;
                }
            }

            // Error handler for broken images to revert to the blank box
            const imgTag = `<img src="${imageUrl}" alt="${item.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/80/cccccc/ffffff?text=+';">`;

            cartItem.innerHTML = `
                ${imgTag}
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
// Checkout Logic (Open Modal)
// Checkout Logic (Open Modal)
const checkoutModal = document.getElementById('checkout-modal');

function openCheckoutModal() {
    if (!checkoutModal) {
        console.error('Checkout modal not found!');
        alert('Error: No se encuentra la ventana de pago. Por favor recarga la página.');
        return;
    }

    // Reset Form and Button State on Open
    const form = document.getElementById('checkout-form');
    if (form) {
        form.reset();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerText = 'Confirmar Compra'; // Or whatever original text was
            submitBtn.disabled = false;
        }
    }

    checkoutModal.classList.add('active');
    console.log('Checkout modal opened');
}

function closeCheckoutModal() {
    if (checkoutModal) checkoutModal.classList.remove('active');
}

if (checkoutBtn) {
    // Remove previous listeners (not really possible without function reference, but creating a new unique listener helps)
    // We assume the old one is gone because we replaced the code block
    checkoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Checkout button clicked');

        if (cart.length === 0) {
            alert('El carrito está vacío');
            return;
        }

        closeCart(); // Close sidebar
        openCheckoutModal(); // Open form
    });
} else {
    console.error('Checkout button not found in DOM');
}

// Handle Checkout Form Submit
const checkoutForm = document.getElementById('checkout-form');
// Barrio Input removed from HTML, so we don't need to select it
// const calleInput ... (keeping selection if needed for other logic, but auto-fill is gone)

// Auto-fill Barrio Logic (Mocking "City Map" / USIG behavior)
function checkAddress() {
    const calle = calleInput.value.trim();
    const altura = alturaInput.value.trim();

    if (calle.length > 3 && altura.length > 0) {
        barrioInput.value = "Buscando...";
        barrioInput.style.color = "#999";

        // Simulate API delay
        setTimeout(() => {
            // Heuristic or Mock response
            // In a real app, fetch from https://ws.usig.buenosaires.gob.ar/geocoding/v2/geocoding/?text=${calle} ${altura}
            barrioInput.value = "Caballito (Detectado)";
            barrioInput.style.color = "#333";
            barrioInput.style.fontWeight = "bold";
        }, 1500);
    } else {
        barrioInput.value = "";
    }
}

// calleInput.addEventListener('blur', checkAddress);
// alturaInput.addEventListener('blur', checkAddress);

checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = checkoutForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'Procesando...';
    submitBtn.disabled = true;

    // Collect Data
    const shippingInfo = {
        calle: document.getElementById('calle').value,
        altura: document.getElementById('altura').value,
        piso: document.getElementById('piso').value || '',
        entreCalles: document.getElementById('entre-calles').value || '',
        barrio: '', // Removed field
        telefono: document.getElementById('telefono').value,
        observaciones: document.getElementById('observaciones').value || ''
    };

    try {
        // Prepare Order Data
        const orderData = {
            items: cart,
            shipping: shippingInfo
        };

        // Call Backend to Create Order and Preference
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al procesar el pedido');
        }

        const data = await response.json();

        // Redirect to Mercado Pago
        if (data.init_point) {
            // Success: Now we can clear the form and cart if needed, but usually redirect happens fast
            window.location.href = data.init_point;
        } else {
            throw new Error('No se recibió el link de pago');
        }

    } catch (error) {
        console.error('Checkout error:', error);
        alert(`Error: ${error.message}`);
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
});

// Carousel Filter Logic
function filterAndScroll(term) {
    // Normalize term
    const searchTerm = term.toLowerCase();

    // Mapping for specific "Obra Gruesa" terms if category doesn't exist yet
    const keywords = {
        'obra gruesa': ['ladrillo', 'cemento', 'arena', 'cal', 'vigueta', 'cascote'],
        'hierros': ['hierro', 'malla', 'viga', 'columna', 'estribo'],
        'durlock': ['durlock', 'perfil', 'masilla', 'placa', 'yeso', 'montante', 'solera']
    };

    const searchTerms = keywords[searchTerm] || [searchTerm];

    // Filter products looking in Category, Subcategory, Name, or Description
    const filtered = products.filter(p => {
        const cat = p.category ? p.category.toLowerCase() : '';
        const sub = p.subcategory ? p.subcategory.toLowerCase() : '';
        const name = p.name ? p.name.toLowerCase() : '';
        const desc = p.description ? p.description.toLowerCase() : '';

        // Check against all related keywords for this term
        return searchTerms.some(k =>
            cat.includes(k) ||
            sub.includes(k) ||
            name.includes(k) ||
            desc.includes(k)
        );
    });

    if (filtered.length > 0) {
        renderProducts(filtered);
    } else {
        console.warn(`No products found for filter: ${term}`);
        renderProducts([]);
        document.getElementById('product-list').innerHTML = `<p style="text-align:center; grid-column:1/-1; padding: 20px;">No se encontraron productos para "${term}". <br> <small>Intenta buscando por nombre o revisa la conexión.</small></p>`;
    }

    scrollToSection('#product-list');
}

// Search Logic (Real-time 3 chars)
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();

        // Reset if empty
        if (term.length === 0) {
            renderProducts(products); // Show all
            return;
        }

        // Trigger only on 3+ chars
        if (term.length >= 3) {
            // Priority: "Starts With" or Exact Match
            const filtered = products.filter(p => {
                const name = p.name.toLowerCase();
                return name.startsWith(term) || name.includes(term);
            });

            // Special Case: "que sea el unico producto si es igual"
            // If we have an EXACT match by name, show ONLY that one.
            const exactMatch = filtered.find(p => p.name.toLowerCase() === term);

            if (exactMatch) {
                renderProducts([exactMatch]);
            } else {
                // Sort to put "Starts With" first
                filtered.sort((a, b) => {
                    const nameA = a.name.toLowerCase();
                    const nameB = b.name.toLowerCase();
                    const startsA = nameA.startsWith(term);
                    const startsB = nameB.startsWith(term);

                    if (startsA && !startsB) return -1;
                    if (!startsA && startsB) return 1;
                    return 0;
                });

                renderProducts(filtered);
            }

            // Optional: Scroll to results if user is typing? 
            // Maybe annoying while typing, so we skip auto-scroll here unless they hit enter.
        }
    });
}

// Contact Modal Logic
const contactModal = document.getElementById('contact-modal');

function openContactModal() {
    contactModal.classList.add('active');
}

function closeContactModal() {
    contactModal.classList.remove('active');
}

// Close modal when clicking outside content
window.addEventListener('click', (e) => {
    if (e.target === contactModal) {
        closeContactModal();
    }
});
