console.log('carrito.js cargado');

// productos del admin para descontar stock al comprar
const CLAVE_PRODUCTOS_ADMIN_KUMO = "kumo_productos";

function cargarProductosKumo() {
    try {
        const datos = localStorage.getItem(CLAVE_PRODUCTOS_ADMIN_KUMO);
        return datos ? JSON.parse(datos) : [];
    } catch (error) {
        console.error("No se pudieron leer los productos:", error);
        return [];
    }
}

function guardarProductosKumo(lista) {
    try {
        localStorage.setItem(CLAVE_PRODUCTOS_ADMIN_KUMO, JSON.stringify(lista));
        return true;
    } catch (error) {
        console.error("No se pudieron guardar los productos:", error);
        return false;
    }
}

// Descuenta el stock comprado y desactiva automáticamente los productos que se agoten
function descontarStockCompra(carrito) {
    const productos = cargarProductosKumo();

    carrito.forEach(articulo => {
        const producto = productos.find(p => String(p.id) === String(articulo.id));
        if (!producto) return;

        producto.stock = Math.max(0, producto.stock - articulo.cantidad);

        // Si el stock llega a 0, el producto se desactiva automáticamente
        if (producto.stock <= 0) {
            producto.activo = false;
        }
    });

    guardarProductosKumo(productos);

    // avisa a las otras paginas que el stock cambio para que lo actualice
    document.dispatchEvent(new CustomEvent("productosKumoActualizados"));
}

// cargar carrito
function cargarCarrito() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
}

// guardar carrito
function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// formatear precio
function formatearPrecio(precio) {
    return Number(precio).toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0
    });
}

// actualizar badge del navbar
function actualizarBadge() {
    const carrito = cargarCarrito();
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    const badgeNavbar = document.getElementById("badge");
    if (badgeNavbar) {
        badgeNavbar.textContent = totalItems;
    }
}

// renderizar carrito
function renderizarCarrito() {
    console.log('🔄 Renderizando carrito...');

    const carrito = cargarCarrito();
    console.log('📦 Carrito:', carrito);

    // renderizar offcanvas
    const contenedor = document.getElementById("contenedorArticulos");
    console.log('📦 Contenedor offcanvas:', contenedor);

    if (contenedor) {
        contenedor.innerHTML = "";

        if (carrito.length === 0) {
            contenedor.innerHTML = `
                <div class="text-center py-5 w-100">
                    <i class="bi bi-cart-x text-muted" style="font-size: 3.5rem;"></i>
                    <h5 class="mt-3 text-dark fw-bold">Tu carrito está vacío</h5>
                    <p class="text-muted small">Explora nuestro catálogo y agrega figuras.</p>
                </div>
            `;
            console.log('✅ Offcanvas: carrito vacío');
        } else {
            carrito.forEach((articulo, index) => {
                const tarjeta = document.createElement("div");
                tarjeta.className = "card border-0 rounded-3 p-3 text-dark style-tarjeta-producto mb-2";
                tarjeta.style.backgroundColor = "white";

                tarjeta.innerHTML = `
                    <div class="d-flex align-items-center gap-3">
                        <img src="${articulo.imagen}" alt="${articulo.nombre}" class="rounded-2 object-fit-cover flex-shrink-0" style="width: 70px; height: 70px;">
                        
                        <div class="flex-grow-1" style="min-width: 0;">
                            <h6 class="fw-bold m-0 mb-1 text-dark text-truncate">${articulo.nombre}</h6>
                            <span class="text-muted small d-block">${formatearPrecio(articulo.precio)}</span>
                        </div>

                        <div class="control-cantidad d-flex align-items-center border rounded bg-light px-1 flex-shrink-0">
                            <button class="btn btn-sm p-1 border-0 btn-restar fw-bold text-dark" data-index="${index}">−</button>
                            <span class="px-2 fw-bold small text-dark">${articulo.cantidad}</span>
                            <button class="btn btn-sm p-1 border-0 btn-sumar fw-bold text-dark" data-index="${index}">+</button>
                        </div>

                        <button class="btn p-0 border-0 text-danger ms-1 btn-eliminar flex-shrink-0" data-index="${index}" title="Eliminar">
                            <i class="bi bi-trash fs-5"></i>
                        </button>
                    </div>
                `;
                contenedor.appendChild(tarjeta);
            });
            console.log(`✅ Offcanvas: ${carrito.length} productos renderizados`);
        }
    } else {
        console.warn('⚠️ No se encontró #contenedorArticulos');
    }

    //RENDERIZAR PÁGINA PRINCIPAL (tablaCarritoPrincipal)
    const tablaPrincipal = document.getElementById("tablaCarritoPrincipal");
    console.log('📦 Contenedor página principal:', tablaPrincipal);

    if (tablaPrincipal) {
        console.log('✅ Renderizando página principal...');
        tablaPrincipal.innerHTML = "";

        if (carrito.length === 0) {
            tablaPrincipal.innerHTML = `
                <div class="card border-0 shadow-sm p-5 text-center bg-white rounded-4">
                    <i class="bi bi-cart-x text-muted d-block mb-3 fs-1 opacity-50"></i>
                    <h4 class="text-dark fw-bold mb-2">Tu carrito está vacío</h4>
                    <p class="text-secondary mb-4 small">Explora el catálogo para agregar nuevos productos.</p>
                    <a href="../catalogo/catalogo.html" class="btn btn-gradient-kumo text-white px-4 py-2 fw-bold text-uppercase rounded-pill mx-auto">
                        Ir al Catálogo
                    </a>
                </div>
            `;
            console.log('✅ Página principal: carrito vacío');
        } else {
            carrito.forEach((articulo, index) => {
                const tarjeta = document.createElement("div");
                tarjeta.className = "card border-0 shadow-sm p-3 mb-3 bg-white rounded-4";

                tarjeta.innerHTML = `
                    <div class="d-flex align-items-center justify-content-between gap-3">
                        <div class="d-flex align-items-center gap-3" style="min-width: 0; flex: 1 1 auto;">
                            <img src="${articulo.imagen}" alt="${articulo.nombre}" class="rounded-3 object-fit-cover bg-light flex-shrink-0" style="width: 75px; height: 75px;">
                            <div style="min-width: 0;">
                                <h5 class="fw-bold m-0 text-dark text-truncate">${articulo.nombre}</h5>
                                <span class="text-secondary small">${formatearPrecio(articulo.precio)}</span>
                            </div>
                        </div>

                        <div class="d-flex align-items-center gap-4 flex-shrink-0">
                            <div class="d-flex align-items-center rounded-pill px-2 border bg-light">
                                <button class="btn btn-sm p-1 border-0 btn-restar fw-bold text-dark" data-index="${index}">−</button>
                                <span class="px-3 fw-bold text-dark">${articulo.cantidad}</span>
                                <button class="btn btn-sm p-1 border-0 btn-sumar fw-bold text-dark" data-index="${index}">+</button>
                            </div>

                            <span class="fw-bold fs-5 text-fucsia">${formatearPrecio(articulo.precio * articulo.cantidad)}</span>

                            <button class="btn p-0 border-0 text-danger btn-eliminar ms-2" data-index="${index}" title="Eliminar producto">
                                <i class="bi bi-trash3 fs-5"></i>
                            </button>
                        </div>
                    </div>
                `;
                tablaPrincipal.appendChild(tarjeta);
            });
            console.log(`✅ Página principal: ${carrito.length} productos renderizados`);
        }
    } else {
        console.warn('⚠️ No se encontró #tablaCarritoPrincipal en la página');
        console.warn('⚠️ Los IDs disponibles son:');
        document.querySelectorAll('[id]').forEach(el => {
            console.log(`   - #${el.id}`);
        });
    }

    actualizarTotales(carrito);
    actualizarBadge();
}

// manejo de eventos
document.addEventListener("click", (e) => {
    const btnSumar = e.target.closest(".btn-sumar");
    const btnRestar = e.target.closest(".btn-restar");
    const btnEliminar = e.target.closest(".btn-eliminar");
    const btnVaciar = e.target.closest("#btnVaciarCarrito, #btnVaciarPagina");
    const btnComprar = e.target.closest("#btnComprar, #btnComprarPagina");
    const btnAbrirCart = e.target.closest(".btn-cart-offcanvas");

    if (btnSumar) {
        // 🔥 Cambiado a async
        cambiarCantidad(parseInt(btnSumar.dataset.index), 1);
    } else if (btnRestar) {
        // 🔥 Cambiado a async
        cambiarCantidad(parseInt(btnRestar.dataset.index), -1);
    } else if (btnEliminar) {
        // 🔥 Cambiado a async
        eliminarArticulo(parseInt(btnEliminar.dataset.index));
    } else if (btnVaciar) {
        // 🔥 Cambiado a async
        vaciarTodo();
    } else if (btnComprar) {
        ejecutarCompra();
    } else if (btnAbrirCart) {
        setTimeout(renderizarCarrito, 300);
    }
});

// ===== CAMBIAR CANTIDAD (BACKEND) =====
async function cambiarCantidad(index, delta) {
    const carrito = cargarCarrito();
    if (!carrito[index]) return;

    const nuevaCantidad = carrito[index].cantidad + delta;
    if (nuevaCantidad < 1) return;

    const productoId = carrito[index].id;
    
    // Actualizar en el backend
    const result = await actualizarCantidadBackend(productoId, nuevaCantidad);
    
    if (result.success) {
        carrito[index].cantidad = nuevaCantidad;
        guardarCarrito(carrito);
        renderizarCarrito();
        actualizarBadgeCarrito();
        document.dispatchEvent(new CustomEvent('carritoActualizado'));
    } else {
        alert('Error al actualizar cantidad: ' + result.error);
    }
}

// ===== ELIMINAR ARTÍCULO (CON MODAL PERSONALIZADO KUMO) =====
async function eliminarArticulo(index) {
    let carrito = cargarCarrito();
    if (!carrito[index]) return;

    const productoId = carrito[index].id;
    const nombreProducto = carrito[index].nombre;
    
    // 🔥 USAR MODAL KUMO EN VEZ DE confirm()
    mostrarModalKumo({
        icono: "bi-trash3-fill",
        tipoIcono: "",
        titulo: "Eliminar producto",
        mensajeHTML: `¿Seguro que deseas eliminar "<strong>${nombreProducto}</strong>" del carrito?`,
        botones: [
            { 
                texto: "Cancelar", 
                clase: "modal-kumo-btn-cancelar",
                accion: () => {
                    // Solo cerrar el modal, no hacer nada
                    cerrarModalKumo();
                }
            },
            {
                texto: "Eliminar",
                clase: "modal-kumo-btn-confirmar",
                accion: async () => {
                    // Cerrar modal antes de procesar
                    cerrarModalKumo();
                    
                    // Eliminar del backend
                    const result = await eliminarDelCarritoBackend(productoId);
                    
                    if (result.success) {
                        // Eliminar del localStorage
                        carrito.splice(index, 1);
                        guardarCarrito(carrito);
                        renderizarCarrito();
                        actualizarBadgeCarrito();
                        
                        // Disparar evento
                        document.dispatchEvent(new CustomEvent('carritoActualizado'));
                    } else {
                        // Mostrar error con el modal KUMO
                        mostrarModalKumo({
                            icono: "bi-exclamation-triangle-fill",
                            tipoIcono: "icono-vacio",
                            titulo: "Error",
                            mensajeHTML: `No se pudo eliminar el producto: ${result.error}`,
                            botones: [
                                { texto: "Entendido", clase: "modal-kumo-btn-ok" }
                            ]
                        });
                    }
                }
            }
        ]
    });
}

// ===== VACIAR CARRITO COMPLETO (CON MODAL KUMO) =====
function vaciarTodo() {
    const carrito = cargarCarrito();

    if (carrito.length === 0) {
        mostrarModalKumo({
            icono: "bi-cart-x-fill",
            tipoIcono: "icono-vacio",
            titulo: "Carrito vacío",
            mensajeHTML: "Tu carrito ya está vacío, no hay nada que eliminar.",
            botones: [
                { texto: "Entendido", clase: "modal-kumo-btn-ok" }
            ]
        });
        return;
    }

    mostrarModalKumo({
        icono: "bi-trash3-fill",
        tipoIcono: "",
        titulo: "Vaciar carrito",
        mensajeHTML: "¿Seguro que deseas eliminar <strong>todos</strong> los productos de tu carrito?",
        botones: [
            { 
                texto: "Cancelar", 
                clase: "modal-kumo-btn-cancelar",
                accion: () => {
                    cerrarModalKumo();
                }
            },
            {
                texto: "Vaciar",
                clase: "modal-kumo-btn-confirmar",
                accion: async () => {
                    cerrarModalKumo();
                    
                    const result = await vaciarCarritoBackend();
                    if (result.success) {
                        localStorage.removeItem("carrito");
                        renderizarCarrito();
                        actualizarBadgeCarrito();
                        document.dispatchEvent(new CustomEvent('carritoActualizado'));
                    } else {
                        mostrarModalKumo({
                            icono: "bi-exclamation-triangle-fill",
                            tipoIcono: "icono-vacio",
                            titulo: "Error",
                            mensajeHTML: `No se pudo vaciar el carrito: ${result.error}`,
                            botones: [
                                { texto: "Entendido", clase: "modal-kumo-btn-ok" }
                            ]
                        });
                    }
                }
            }
        ]
    });
}

// ===== ACTUALIZAR TOTALES =====
function actualizarTotales(carrito) {
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    const subtotalSpan = document.getElementById("subtotalCarrito");
    const cantidadSpan = document.getElementById("cantidadArticulos");
    const resumenSubtotal = document.getElementById("resumenSubtotal");
    const resumenTotal = document.getElementById("resumenTotal");
    const totalItemsCount = document.getElementById("totalItemsCount");

    if (subtotalSpan) subtotalSpan.textContent = formatearPrecio(subtotal);
    if (cantidadSpan) cantidadSpan.textContent = totalItems;

    if (resumenSubtotal) resumenSubtotal.textContent = formatearPrecio(subtotal);
    if (resumenTotal) resumenTotal.textContent = formatearPrecio(subtotal);
    if (totalItemsCount) totalItemsCount.textContent = totalItems;
}

// Crea el overlay del modal una sola vez y lo reutiliza
function crearModalKumoSiNoExiste() {
    if (document.getElementById("modalKumoOverlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "modalKumoOverlay";
    overlay.className = "modal-kumo-overlay";
    overlay.innerHTML = `
        <div class="modal-kumo-box">
            <div id="modalKumoIcono" class="modal-kumo-icono">
                <i class="bi bi-info-circle-fill"></i>
            </div>
            <h5 id="modalKumoTitulo" class="modal-kumo-titulo">Título</h5>
            <p id="modalKumoMensaje" class="modal-kumo-mensaje">Mensaje</p>
            <div id="modalKumoBotones" class="modal-kumo-botones"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) cerrarModalKumo();
    });
}

function cerrarModalKumo() {
    const overlay = document.getElementById("modalKumoOverlay");
    if (overlay) overlay.classList.remove("activo");
}

function mostrarModalKumo({ icono = "bi-info-circle-fill", tipoIcono = "", titulo, mensajeHTML, botones }) {
    crearModalKumoSiNoExiste();

    const overlay = document.getElementById("modalKumoOverlay");
    const iconoEl = document.getElementById("modalKumoIcono");
    const tituloEl = document.getElementById("modalKumoTitulo");
    const mensajeEl = document.getElementById("modalKumoMensaje");
    const botonesEl = document.getElementById("modalKumoBotones");

    iconoEl.className = `modal-kumo-icono ${tipoIcono}`;
    iconoEl.innerHTML = `<i class="bi ${icono}"></i>`;
    tituloEl.textContent = titulo;
    mensajeEl.innerHTML = mensajeHTML;

    botonesEl.innerHTML = "";
    botones.forEach((btn) => {
        const boton = document.createElement("button");
        boton.className = btn.clase;
        boton.textContent = btn.texto;
        boton.addEventListener("click", () => {
            cerrarModalKumo();
            if (btn.accion) btn.accion();
        });
        botonesEl.appendChild(boton);
    });

    requestAnimationFrame(() => overlay.classList.add("activo"));
}


// ============================================
// MODAL KUMO CON FORMULARIO (PARA DIRECCIÓN Y PAGO)
// ============================================
function mostrarModalKumoFormulario({ 
    icono = "bi-info-circle-fill", 
    tipoIcono = "", 
    titulo, 
    mensajeHTML, 
    campos = [],
    botones = [] 
}) {
    crearModalKumoSiNoExiste();

    const overlay = document.getElementById("modalKumoOverlay");
    const iconoEl = document.getElementById("modalKumoIcono");
    const tituloEl = document.getElementById("modalKumoTitulo");
    const mensajeEl = document.getElementById("modalKumoMensaje");
    const botonesEl = document.getElementById("modalKumoBotones");

    iconoEl.className = `modal-kumo-icono ${tipoIcono}`;
    iconoEl.innerHTML = `<i class="bi ${icono}"></i>`;
    tituloEl.textContent = titulo;
    mensajeEl.innerHTML = mensajeHTML;

    // 🔥 AGREGAR CAMPOS DEL FORMULARIO
    let camposHTML = '';
    campos.forEach(campo => {
        camposHTML += `
            <div style="text-align: left; margin-bottom: 15px;">
                <label style="display: block; font-weight: 700; font-size: 0.85rem; color: #1E1B4B; margin-bottom: 5px;">
                    ${campo.label}
                </label>
                ${campo.type === 'select' ? `
                    <select id="${campo.id}" style="width: 100%; padding: 10px 14px; border: 2px solid #E5E7EB; border-radius: 12px; font-size: 0.95rem; transition: border-color 0.3s ease;">
                        ${campo.options.map(opt => `<option value="${opt.value}">${opt.text}</option>`).join('')}
                    </select>
                ` : `
                    <input type="${campo.type || 'text'}" id="${campo.id}" placeholder="${campo.placeholder || ''}" 
                           style="width: 100%; padding: 10px 14px; border: 2px solid #E5E7EB; border-radius: 12px; font-size: 0.95rem; transition: border-color 0.3s ease;"
                           onfocus="this.style.borderColor='#8A2BE2'"
                           onblur="this.style.borderColor='#E5E7EB'">
                `}
            </div>
        `;
    });

    // Insertar campos después del mensaje
    if (campos.length > 0) {
        const mensajeContainer = mensajeEl.parentNode;
        const camposContainer = document.createElement('div');
        camposContainer.id = 'modalKumoCampos';
        camposContainer.innerHTML = camposHTML;
        mensajeEl.after(camposContainer);
    }

    botonesEl.innerHTML = "";
    botones.forEach((btn) => {
        const boton = document.createElement("button");
        boton.className = btn.clase;
        boton.textContent = btn.texto;
        boton.addEventListener("click", () => {
            if (btn.accion) {
                // Recolectar valores de los campos
                const valores = {};
                campos.forEach(campo => {
                    const input = document.getElementById(campo.id);
                    if (input) {
                        valores[campo.id] = input.value;
                    }
                });
                btn.accion(valores);
            }
            cerrarModalKumo();
        });
        botonesEl.appendChild(boton);
    });

    // Limpiar campos al cerrar
    overlay.addEventListener('modalKumoClosed', () => {
        campos.forEach(campo => {
            const input = document.getElementById(campo.id);
            if (input) {
                input.value = '';
            }
        });
        const camposContainer = document.getElementById('modalKumoCampos');
        if (camposContainer) {
            camposContainer.remove();
        }
    });

    requestAnimationFrame(() => overlay.classList.add("activo"));
}


// ============================================
// 1. OBTENER CARRITO DEL USUARIO
// ============================================
async function obtenerCarritoBackend() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('⚠️ Usuario no autenticado');
            return null;
        }

        console.log('📤 Obteniendo carrito desde el backend...');
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/cart`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 404) {
            console.log('🛒 Usuario sin carrito, creando...');
            return await crearCarritoBackend();
        }

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Carrito obtenido del backend:', data);
        
        // 🔥 LOG PARA VERIFICAR STOCK
        if (data.items) {
            data.items.forEach(item => {
                const product = item.product || {};
                console.log(`📦 ${product.nombre || 'Producto'}: Stock=${product.stock || 0}, Cantidad=${item.cantidad || 0}`);
            });
        }
        
        return data;
    } catch (error) {
        console.error('❌ Error al obtener carrito:', error);
        return null;
    }
}

async function ejecutarCompra() {
    const carrito = cargarCarrito();

    if (carrito.length === 0) {
        mostrarModalKumo({
            icono: "bi-cart-x-fill",
            tipoIcono: "icono-vacio",
            titulo: "Carrito vacío",
            mensajeHTML: "No tienes productos en tu carrito. Agrega algunas figuras antes de continuar.",
            botones: [
                { texto: "Entendido", clase: "modal-kumo-btn-ok" }
            ]
        });
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Debes iniciar sesión para comprar');
            return;
        }

        // 🔥 OBTENER EL CARRITO DEL BACKEND CON STOCK ACTUALIZADO
        const carritoBackend = await obtenerCarritoBackend();
        if (!carritoBackend || !carritoBackend.items) {
            mostrarModalKumo({
                icono: "bi-exclamation-triangle-fill",
                tipoIcono: "icono-vacio",
                titulo: "Error",
                mensajeHTML: "No se pudo verificar el stock disponible.",
                botones: [
                    { texto: "Entendido", clase: "modal-kumo-btn-ok" }
                ]
            });
            return;
        }

        console.log('📦 Carrito del backend:', carritoBackend);

        // 🔥 VERIFICAR STOCK DE CADA PRODUCTO
        const productosSinStock = [];
        const productosStockInsuficiente = [];

        for (const item of carritoBackend.items) {
            const product = item.product || {};
            const cantidadSolicitada = item.cantidad || 0;
            const stockDisponible = product.stock || 0;
            const nombreProducto = product.nombre || 'Producto';

            console.log(`🔍 Verificando: ${nombreProducto}`);
            console.log(`   📦 Cantidad solicitada: ${cantidadSolicitada}`);
            console.log(`   📊 Stock disponible: ${stockDisponible}`);

            if (stockDisponible === 0) {
                productosSinStock.push({
                    nombre: nombreProducto,
                    cantidad: cantidadSolicitada,
                    stock: stockDisponible
                });
            } else if (cantidadSolicitada > stockDisponible) {
                productosStockInsuficiente.push({
                    nombre: nombreProducto,
                    cantidad: cantidadSolicitada,
                    stock: stockDisponible
                });
            }
        }

        // 🔥 MOSTRAR MENSAJES ESPECÍFICOS
        if (productosSinStock.length > 0) {
            let mensaje = 'Los siguientes productos están <strong>agotados</strong>:<br><br>';
            productosSinStock.forEach(p => {
                mensaje += `• <strong>${p.nombre}</strong> (Stock: 0)<br>`;
            });
            mensaje += '<br>Por favor, elimina estos productos del carrito para continuar.';

            mostrarModalKumo({
                icono: "bi-x-circle-fill",
                tipoIcono: "icono-vacio",
                titulo: "Productos agotados",
                mensajeHTML: mensaje,
                botones: [
                    { 
                        texto: "Ir al carrito", 
                        clase: "modal-kumo-btn-confirmar",
                        accion: () => {
                            window.location.href = "../carrito/carrito.html";
                        }
                    },
                    { 
                        texto: "Seguir comprando", 
                        clase: "modal-kumo-btn-ok" 
                    }
                ]
            });
            return;
        }

        if (productosStockInsuficiente.length > 0) {
            let mensaje = 'No hay suficiente stock para:<br><br>';
            productosStockInsuficiente.forEach(p => {
                mensaje += `• <strong>${p.nombre}</strong> (Solicitado: ${p.cantidad}, Disponible: ${p.stock})<br>`;
            });
            mensaje += '<br>Por favor, reduce la cantidad o elimina estos productos del carrito.';

            mostrarModalKumo({
                icono: "bi-exclamation-triangle-fill",
                tipoIcono: "icono-vacio",
                titulo: "Stock insuficiente",
                mensajeHTML: mensaje,
                botones: [
                    { 
                        texto: "Ir al carrito", 
                        clase: "modal-kumo-btn-confirmar",
                        accion: () => {
                            window.location.href = "../carrito/carrito.html";
                        }
                    },
                    { 
                        texto: "Seguir comprando", 
                        clase: "modal-kumo-btn-ok" 
                    }
                ]
            });
            return;
        }

        // ✅ SI TODO ESTÁ BIEN, CONTINUAR CON LA COMPRA
        const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

        // 🔥 PRIMER MODAL: Confirmar pedido
        mostrarModalKumo({
            icono: "bi-bag-check-fill",
            tipoIcono: "",
            titulo: "Confirmar pedido",
            mensajeHTML: `Estás a punto de confirmar tu compra.<br><br>Total a pagar: <span class="modal-kumo-total">${formatearPrecio(subtotal)}</span>`,
            botones: [
                { texto: "Cancelar", clase: "modal-kumo-btn-cancelar" },
                {
                    texto: "Confirmar",
                    clase: "modal-kumo-btn-confirmar",
                    accion: async () => {
                        // 🔥 SEGUNDO MODAL: Datos de envío y pago (CON FORMULARIO)
                        mostrarModalKumoFormulario({
                            icono: "bi-truck",
                            tipoIcono: "",
                            titulo: "Datos de envío y pago",
                            mensajeHTML: "Completa la información para procesar tu pedido.",
                            campos: [
                                {
                                    id: "direccionEnvio",
                                    label: "Dirección de envío",
                                    type: "text",
                                    placeholder: "Ej: Calle 123 #45-67, Bogotá"
                                },
                                {
                                    id: "metodoPago",
                                    label: "Método de pago",
                                    type: "select",
                                    options: [
                                        { value: "Tarjeta crédito", text: "Tarjeta de crédito" },
                                        { value: "Tarjeta débito", text: "Tarjeta de débito" },
                                        { value: "Contraentrega", text: "Contraentrega (pago en efectivo)" },
                                        { value: "Nequi", text: "Nequi" },
                                        { value: "Daviplata", text: "Daviplata" }
                                    ]
                                }
                            ],
                            botones: [
                                { 
                                    texto: "Cancelar", 
                                    clase: "modal-kumo-btn-cancelar",
                                    accion: () => {
                                        if (typeof cerrarModalKumo === 'function') {
                                            cerrarModalKumo();
                                        }
                                    }
                                },
                                {
                                    texto: "Realizar pedido",
                                    clase: "modal-kumo-btn-confirmar",
                                    accion: async (valores) => {
                                        const direccionEnvio = valores.direccionEnvio?.trim();
                                        const metodoPago = valores.metodoPago;
                                        
                                        if (!direccionEnvio) {
                                            mostrarModalKumo({
                                                icono: "bi-exclamation-triangle-fill",
                                                tipoIcono: "icono-vacio",
                                                titulo: "Campo requerido",
                                                mensajeHTML: "Por favor, ingresa tu dirección de envío.",
                                                botones: [
                                                    { texto: "Entendido", clase: "modal-kumo-btn-ok" }
                                                ]
                                            });
                                            return;
                                        }
                                        
                                        if (!metodoPago) {
                                            mostrarModalKumo({
                                                icono: "bi-exclamation-triangle-fill",
                                                tipoIcono: "icono-vacio",
                                                titulo: "Campo requerido",
                                                mensajeHTML: "Por favor, selecciona un método de pago.",
                                                botones: [
                                                    { texto: "Entendido", clase: "modal-kumo-btn-ok" }
                                                ]
                                            });
                                            return;
                                        }
                                        
                                        // 🔥 PROCESAR LA COMPRA
                                        await procesarCompraConDatos(direccionEnvio, metodoPago);
                                    }
                                }
                            ]
                        });
                    }
                }
            ]
        });

    } catch (error) {
        console.error('❌ Error al verificar stock:', error);
        mostrarModalKumo({
            icono: "bi-exclamation-triangle-fill",
            tipoIcono: "icono-vacio",
            titulo: "Error",
            mensajeHTML: "No se pudo verificar el stock. Por favor, intenta nuevamente.",
            botones: [
                { texto: "Entendido", clase: "modal-kumo-btn-ok" }
            ]
        });
    }
}

// ============================================
// PROCESAR COMPRA CON DATOS DEL FORMULARIO
// ============================================
async function procesarCompraConDatos(direccionEnvio, metodoPago) {
    try {
        const userId = await obtenerUserId();
        if (!userId) {
            alert('Debes iniciar sesión para comprar');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Debes iniciar sesión para comprar');
            return;
        }

        const url = `${API_CONFIG.BASE_URL}/orders?userId=${userId}&direccionEnvio=${encodeURIComponent(direccionEnvio)}&metodoPago=${encodeURIComponent(metodoPago)}`;
        console.log('📤 Enviando petición a:', url);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const responseText = await response.text();
        console.log('📦 Respuesta del backend:', responseText);

        if (!response.ok) {
            let errorMsg = `Error ${response.status}`;
            try {
                const errorJson = JSON.parse(responseText);
                errorMsg = errorJson.message || errorMsg;
            } catch (e) {
                errorMsg = responseText || errorMsg;
            }
            throw new Error(errorMsg);
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.warn('⚠️ La respuesta no es JSON válido:', responseText);
            data = { message: 'Pedido creado correctamente' };
        }
        
        console.log('✅ Pedido creado:', data);

        // 🔥 1. VACIAR CARRITO
        await vaciarCarritoBackend();
        localStorage.removeItem("carrito");
        renderizarCarrito();
        actualizarBadgeCarrito();
        document.dispatchEvent(new CustomEvent('carritoActualizado'));

        // 🔥 2. RECARGAR PRODUCTOS PARA ACTUALIZAR STOCK
        await recargarProductosActualizados();

        // 🔥 3. DISPARAR EVENTO PARA ACTUALIZAR CATÁLOGO
        document.dispatchEvent(new CustomEvent('productosActualizados'));

        mostrarModalKumo({
            icono: "bi-check-circle-fill",
            tipoIcono: "icono-exito",
            titulo: "¡Compra confirmada!",
            mensajeHTML: "Gracias por tu compra. Revisa tus pedidos para ver el estado.",
            botones: [
                { 
                    texto: "Ver mis pedidos", 
                    clase: "modal-kumo-btn-confirmar",
                    accion: () => {
                        window.location.href = "../pedidos/pedidos.html";
                    }
                },
                { 
                    texto: "Seguir comprando", 
                    clase: "modal-kumo-btn-ok" 
                }
            ]
        });

    } catch (error) {
        console.error('❌ Error al crear pedido:', error);
        mostrarModalKumo({
            icono: "bi-exclamation-triangle-fill",
            tipoIcono: "icono-vacio",
            titulo: "Error al crear pedido",
            mensajeHTML: `No se pudo completar la compra: ${error.message}`,
            botones: [
                { texto: "Entendido", clase: "modal-kumo-btn-ok" }
            ]
        });
    }
}

// ============================================
// RECARGAR PRODUCTOS ACTUALIZADOS
// ============================================
async function recargarProductosActualizados() {
    try {
        console.log('🔄 Recargando productos actualizados...');
        
        // Limpiar caché de productos
        localStorage.removeItem(CLAVE_PRODUCTOS_KUMO);
        localStorage.removeItem(`${CLAVE_PRODUCTOS_KUMO}_time`);
        
        // Recargar productos desde el backend
        const token = localStorage.getItem('token');
        if (token) {
            const response = await fetch(`${API_CONFIG.BASE_URL}/products/public`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const productos = await response.json();
                localStorage.setItem(CLAVE_PRODUCTOS_KUMO, JSON.stringify(productos));
                localStorage.setItem(`${CLAVE_PRODUCTOS_KUMO}_time`, Date.now().toString());
                console.log('✅ Productos recargados correctamente');
                
                // Si estamos en el catálogo, actualizar la vista
                if (typeof cargarProductosCatalogo === 'function') {
                    await cargarProductosCatalogo();
                    if (typeof renderizarCatalogo === 'function') {
                        renderizarCatalogo();
                    }
                }
                
                // Si estamos en el panel de admin, actualizar
                if (typeof cargarProductos === 'function') {
                    await cargarProductos();
                }
            }
        }
    } catch (error) {
        console.error('❌ Error al recargar productos:', error);
    }
}

// ===== ACCIÓN COMPRAR (BACKEND) =====
async function procesarCompra(direccionEnvio, metodoPago) {
    try {
        // Obtener el ID del usuario
        const userId = await obtenerUserId();
        if (!userId) {
            alert('Debes iniciar sesión para comprar');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Debes iniciar sesión para comprar');
            return;
        }

        const url = `${API_CONFIG.BASE_URL}/orders?userId=${userId}&direccionEnvio=${encodeURIComponent(direccionEnvio)}&metodoPago=${encodeURIComponent(metodoPago)}`;
        console.log('📤 Enviando petición a:', url);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const responseText = await response.text();
        console.log('📦 Respuesta del backend:', responseText);

        if (!response.ok) {
            let errorMsg = `Error ${response.status}`;
            try {
                const errorJson = JSON.parse(responseText);
                errorMsg = errorJson.message || errorMsg;
            } catch (e) {
                errorMsg = responseText || errorMsg;
            }
            throw new Error(errorMsg);
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.warn('⚠️ La respuesta no es JSON válido:', responseText);
            data = { message: 'Pedido creado correctamente' };
        }
        
        console.log('✅ Pedido creado:', data);

        // ✅ Pedido creado exitosamente
        // Vaciar carrito local y backend
        await vaciarCarritoBackend();
        localStorage.removeItem("carrito");
        renderizarCarrito();
        actualizarBadgeCarrito();
        document.dispatchEvent(new CustomEvent('carritoActualizado'));

        mostrarModalKumo({
            icono: "bi-check-circle-fill",
            tipoIcono: "icono-exito",
            titulo: "¡Compra confirmada!",
            mensajeHTML: "Gracias por tu compra. Revisa tus pedidos para ver el estado.",
            botones: [
                { 
                    texto: "Ver mis pedidos", 
                    clase: "modal-kumo-btn-confirmar",
                    accion: () => {
                        window.location.href = "../pedidos/pedidos.html";
                    }
                },
                { 
                    texto: "Seguir comprando", 
                    clase: "modal-kumo-btn-ok" 
                }
            ]
        });

    } catch (error) {
        console.error('❌ Error al crear pedido:', error);
        mostrarModalKumo({
            icono: "bi-exclamation-triangle-fill",
            tipoIcono: "icono-vacio",
            titulo: "Error al crear pedido",
            mensajeHTML: `No se pudo completar la compra: ${error.message}`,
            botones: [
                { texto: "Entendido", clase: "modal-kumo-btn-ok" }
            ]
        });
    }
}

// FORZAR ESTILOS DEL OFFCANVAS
function forzarEstilosOffcanvas() {
    const offcanvas = document.getElementById('carritoKumo');
    if (!offcanvas) return;

    offcanvas.style.backgroundColor = '#ffffff';
    offcanvas.style.color = '#050505';
    offcanvas.style.borderLeft = '2px solid #ff007f';

    const subtotal = document.getElementById('subtotalCarrito');
    if (subtotal) {
        subtotal.style.color = '#FF007F';
    }

    console.log('✅ Estilos del offcanvas forzados');
}

// EVENTOS DE CARGA Y ACTUALIZACIÓN
// 1. Cuando el navbar se carga
document.addEventListener("navbarCargado", () => {
    console.log('✅ navbarCargado recibido');
    renderizarCarrito();
    setTimeout(forzarEstilosOffcanvas, 100);
});

// 2. Cuando se abre el offcanvas
document.addEventListener("show.bs.offcanvas", (e) => {
    if (e.target.id === "carritoKumo") {
        console.log('✅ Offcanvas abriéndose');
        renderizarCarrito();
        setTimeout(forzarEstilosOffcanvas, 150);
    }
});

// 3. Cuando cambia el localStorage (desde otra pestaña)
window.addEventListener('storage', function (e) {
    if (e.key === 'carrito') {
        console.log('🔄 Carrito actualizado en localStorage (otra pestaña)');
        renderizarCarrito();
    }
});

// 4. Cuando el DOM se carga
document.addEventListener('DOMContentLoaded', function () {
    console.log('📄 DOM cargado');
    renderizarCarrito();
});

window.renderizarCarrito = renderizarCarrito;
window.cargarCarrito = cargarCarrito;
window.actualizarBadge = actualizarBadge;

console.log('✅ carrito.js cargado correctamente');



// ============================================
// ESCUCHAR EVENTO DE ACTUALIZACIÓN DEL CARRITO
// ============================================
document.addEventListener('carritoActualizado', function() {
    console.log('🔄 Evento: carritoActualizado - Renderizando carrito');
    renderizarCarrito();
    setTimeout(forzarEstilosOffcanvas, 100);
});

// También escuchar el evento de sincronización
document.addEventListener('carritoSincronizado', function() {
    console.log('🔄 Evento: carritoSincronizado - Actualizando vista');
    renderizarCarrito();
    setTimeout(forzarEstilosOffcanvas, 100);
});


// ============================================
// RECARGAR PRODUCTOS DESPUÉS DE LA COMPRA
// ============================================
function recargarProductosDespuesDeCompra() {
    console.log('🔄 Recargando productos después de la compra...');
    
    // 🔥 FORZAR RECARGA EN EL CATÁLOGO
    if (typeof window.forzarRecargaProductos === 'function') {
        window.forzarRecargaProductos();
    } else {
        // Fallback: limpiar caché y disparar evento
        localStorage.removeItem('kumo_productos_cache');
        localStorage.removeItem('kumo_productos_cache_time');
        document.dispatchEvent(new CustomEvent('productosActualizados'));
    }
    
    // 🔥 SI ESTAMOS EN EL PANEL ADMIN, RECARGAR TAMBIÉN
    if (typeof window.cargarProductos === 'function') {
        window.cargarProductos();
    }
}