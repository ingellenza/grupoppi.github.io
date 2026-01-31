let carrito = [];

function renderizarProductos() {
    const contenedor = document.getElementById('grid-productos');
    productos.forEach(p => {
        contenedor.innerHTML += `
            <div class="card">
                <img src="${p.img}" alt="${p.nombre}">
                <h3>${p.nombre}</h3>
                <p>$${p.precio}</p>
                <button onclick="agregar(${p.id})">Agregar</button>
            </div>`;
    });
}

function agregar(id) {
    const prod = productos.find(p => p.id === id);
    carrito.push(prod);
    actualizarVista();
}

async function pagar() {
    const btn = document.getElementById('btn-pagar');
    btn.innerText = "Cargando...";

    // Llamada a tu backend (reemplaza con tu URL de Render/Railway después)
    const response = await fetch("https://tu-backend-en-render.com/create_preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: carrito })
    });

    const data = await response.json();
    window.location.href = data.init_point; // Redirige a Mercado Pago
}

renderizarProductos();