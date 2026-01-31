let carrito = [];
let productosData = []; // Aquí cargarás tus 30 productos desde la DB

// 1. Cargar productos desde tu backend
async function cargarProductos() {
    const res = await fetch('https://tu-backend.render.com/productos');
    productosData = await res.json();
    dibujarProductos(productosData);
}

function dibujarProductos(lista) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = lista.map(p => `
        <div class="product-card" onclick="openModal('${p._id}')">
            <div class="image-container">
                <img src="${p.imagen}" alt="${p.nombre}">
            </div>
            <h4>${p.nombre}</h4>
            <p class="price">$${p.precio}</p>
            <button class="btn-ver">Ver detalle</button>
        </div>
    `).join('');
}

// 2. Abrir detalle del producto
function openModal(id) {
    const p = productosData.find(item => item._id === id);
    document.getElementById('modal-title').innerText = p.nombre;
    document.getElementById('modal-img').src = p.imagen;
    document.getElementById('modal-desc').innerText = p.descripcion;
    document.getElementById('modal-price').innerText = `$${p.precio}`;
    
    // Configurar botón de agregado
    document.getElementById('btn-add-modal').onclick = () => {
        const cant = parseInt(document.getElementById('modal-qty').value);
        agregarAlCarrito(p, cant);
        closeModal();
    };
    
    document.getElementById('product-modal').style.display = "block";
}

function agregarAlCarrito(producto, cantidad) {
    const existe = carrito.find(item => item._id === producto._id);
    if (existe) {
        existe.cantidad += cantidad;
    } else {
        carrito.push({ ...producto, cantidad });
    }
    actualizarCarritoUI();
}