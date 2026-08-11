// ============================================
// PEDIDOS - SERVICIO Y RENDERIZADO
// ============================================

// 🔥 CAMBIAR EL NOMBRE DE LA VARIABLE para evitar conflicto
const PEDIDOS_API_URL = (typeof API_CONFIG !== 'undefined' && API_CONFIG.BASE_URL) 
    ? API_CONFIG.BASE_URL 
    : 'http://localhost:8081';

console.log('📦 PEDIDOS_API_URL:', PEDIDOS_API_URL);

// ============================================
// FUNCIÓN AUXILIAR: OBTENER USER ID
// ============================================
function obtenerUserId() {
    try {
        const usuarioStr = localStorage.getItem('usuarioActivo') || 
                          localStorage.getItem('usuario') || 
                          localStorage.getItem('kumo_usuario');
        
        if (usuarioStr) {
            const usuario = JSON.parse(usuarioStr);
            if (usuario.id) {
                console.log('🔍 ID de usuario encontrado:', usuario.id);
                return usuario.id;
            }
        }
        
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = token.split('.')[1];
                const decoded = atob(payload);
                const data = JSON.parse(decoded);
                console.log('🔍 ID del token:', data.id);
                return data.id || data.userId || null;
            } catch (e) {
                console.error('Error al decodificar token:', e);
            }
        }
        return null;
    } catch (error) {
        console.error('Error al obtener userId:', error);
        return null;
    }
}

// ============================================
// FORMATEAR PRECIO
// ============================================
function formatearPrecio(precio) {
    if (!precio) return '$0';
    return Number(precio).toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    });
}

// ============================================
// COLOR DEL ESTADO
// ============================================
function getEstadoColor(estado) {
    const colores = {
        'pendiente': 'warning',
        'confirmado': 'info',
        'enviado': 'primary',
        'entregado': 'success',
        'cancelado': 'danger'
    };
    return colores[estado?.toLowerCase()] || 'secondary';
}

// ============================================
// TEXTO DEL ESTADO
// ============================================
function getEstadoTexto(estado) {
    const textos = {
        'pendiente': 'Pendiente',
        'confirmado': 'Confirmado',
        'enviado': 'Enviado',
        'entregado': 'Entregado',
        'cancelado': 'Cancelado'
    };
    return textos[estado?.toLowerCase()] || estado || 'Desconocido';
}

// ============================================
// RENDERIZAR PEDIDOS
// ============================================
async function renderizarPedidos() {
    const contenedor = document.getElementById('contenedorPedidos');
    if (!contenedor) {
        console.warn('⚠️ No se encontró #contenedorPedidos');
        return;
    }

    contenedor.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3 text-muted">Cargando tus pedidos...</p>
        </div>
    `;

    try {
        const userId = obtenerUserId();
        console.log('🔍 userId obtenido:', userId);
        
        if (!userId) {
            contenedor.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-box-seam text-muted" style="font-size: 3rem;"></i>
                    <h5 class="mt-3">Inicia sesión para ver tus pedidos</h5>
                    <a href="../inicio_sesion/inicio_sesion.html" class="btn btn-gradient-kumo text-white px-4 py-2 rounded-pill mt-3">
                        Iniciar sesión
                    </a>
                </div>
            `;
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            contenedor.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-box-seam text-muted" style="font-size: 3rem;"></i>
                    <h5 class="mt-3">Token no encontrado</h5>
                    <p class="text-muted">Por favor, inicia sesión nuevamente.</p>
                </div>
            `;
            return;
        }

        console.log('📤 Obteniendo pedidos del usuario:', userId);
        console.log('📤 URL:', `${PEDIDOS_API_URL}/orders/user/${userId}`);
        
        const response = await fetch(`${PEDIDOS_API_URL}/orders/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const responseText = await response.text();
        console.log('📦 Respuesta del backend (texto):', responseText);

        if (response.status === 404) {
            contenedor.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-box-seam text-muted" style="font-size: 3rem;"></i>
                    <h5 class="mt-3">No tienes pedidos aún</h5>
                    <p class="text-muted">Realiza tu primera compra en el catálogo.</p>
                    <a href="../catalogo/catalogo.html" class="btn btn-gradient-kumo text-white px-4 py-2 rounded-pill">
                        Ir al catálogo
                    </a>
                </div>
            `;
            return;
        }

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

        let pedidos;
        try {
            pedidos = JSON.parse(responseText);
        } catch (e) {
            console.error('❌ Error al parsear JSON:', e);
            throw new Error('La respuesta no es un JSON válido');
        }

        console.log('📦 Pedidos obtenidos:', pedidos);

        if (!pedidos || pedidos.length === 0) {
            contenedor.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-box-seam text-muted" style="font-size: 3rem;"></i>
                    <h5 class="mt-3">No tienes pedidos aún</h5>
                    <p class="text-muted">Realiza tu primera compra en el catálogo.</p>
                    <a href="../catalogo/catalogo.html" class="btn btn-gradient-kumo text-white px-4 py-2 rounded-pill">
                        Ir al catálogo
                    </a>
                </div>
            `;
            return;
        }

        contenedor.innerHTML = '';
        pedidos.forEach(pedido => {
            const card = document.createElement('div');
            card.className = 'card mb-4 shadow-sm border-0 rounded-4';
            
            const totalItems = pedido.items?.length || 0;
            
            let productosHTML = '';
            if (pedido.items && pedido.items.length > 0) {
                productosHTML = pedido.items.map(item => {
                    const product = item.product || {};
                    let imagenUrl = product.imagen || '../assets/img/logo.png';
                    
                    if (imagenUrl.startsWith('data:image')) {
                        // Base64 - mantener como está
                    } else if (!imagenUrl.startsWith('http') && !imagenUrl.startsWith('../')) {
                        imagenUrl = `${PEDIDOS_API_URL}/uploads/${imagenUrl}`;
                    }
                    
                    return `
                        <div class="d-flex align-items-center gap-3 py-2 border-bottom">
                            <img src="${imagenUrl}" alt="${product.nombre || 'Producto'}" 
                                 style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"
                                 onerror="this.src='../assets/img/logo.png'">
                            <div class="flex-grow-1">
                                <div class="fw-bold">${product.nombre || 'Producto'}</div>
                                <small class="text-muted">${item.cantidad} x ${formatearPrecio(item.precioUnitario)}</small>
                            </div>
                            <span class="fw-bold">${formatearPrecio(item.precioUnitario * item.cantidad)}</span>
                        </div>
                    `;
                }).join('');
            }

            const fecha = pedido.fechaPedido ? new Date(pedido.fechaPedido) : null;
            const fechaStr = fecha ? fecha.toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : 'Fecha no disponible';

            const puedeCancelar = pedido.estado?.toLowerCase() === 'pendiente';

            card.innerHTML = `
                <div class="card-header bg-white border-0 d-flex flex-wrap justify-content-between align-items-center pt-3 px-4">
                    <div>
                        <h6 class="fw-bold mb-0">Pedido #${pedido.id}</h6>
                        <small class="text-muted"><i class="bi bi-calendar3 me-1"></i>${fechaStr}</small>
                    </div>
                    <div class="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                        <span class="badge bg-${getEstadoColor(pedido.estado)} px-3 py-2 rounded-pill">
                            ${getEstadoTexto(pedido.estado)}
                        </span>
                        <span class="badge bg-light text-dark px-3 py-2 rounded-pill">
                            <i class="bi bi-box me-1"></i>${totalItems} items
                        </span>
                    </div>
                </div>
                <div class="card-body px-4 pb-3">
                    ${productosHTML ? `
                        <div class="mb-3">
                            ${productosHTML}
                        </div>
                    ` : `
                        <p class="text-muted text-center py-2">No hay productos en este pedido</p>
                    `}
                    
                    <div class="d-flex flex-wrap justify-content-between align-items-center pt-2 border-top">
                        <div>
                            <p class="mb-1"><strong>Dirección:</strong> ${pedido.direccionEnvio || 'No especificada'}</p>
                            <p class="mb-1"><strong>Método de pago:</strong> ${pedido.metodoPago || 'No especificado'}</p>
                        </div>
                        <div class="text-end">
                            <h5 class="mb-0">Total: <span class="text-fucsia">${formatearPrecio(pedido.total)}</span></h5>
                            <div class="mt-2">
                                ${puedeCancelar ? `
                                    <button class="btn btn-outline-danger btn-sm" onclick="cancelarPedido(${pedido.id})">
                                        <i class="bi bi-x-circle"></i> Cancelar
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            contenedor.appendChild(card);
        });

    } catch (error) {
        console.error('❌ Error al renderizar pedidos:', error);
        contenedor.innerHTML = `
            <div class="text-center py-5 text-danger">
                <i class="bi bi-exclamation-triangle-fill" style="font-size: 3rem;"></i>
                <h5 class="mt-3">Error al cargar los pedidos</h5>
                <p>${error.message || 'Intenta nuevamente más tarde'}</p>
                <button class="btn btn-primary mt-3" onclick="renderizarPedidos()">
                    <i class="bi bi-arrow-clockwise me-1"></i> Reintentar
                </button>
            </div>
        `;
    }
}

// ============================================
// VER DETALLE DE PEDIDO
// ============================================
async function verDetallePedido(pedidoId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Debes iniciar sesión');
            return;
        }

        const response = await fetch(`${PEDIDOS_API_URL}/orders/${pedidoId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            throw new Error(`Error ${response.status}`);
        }

        const pedido = await response.json();
        console.log('📦 Detalle del pedido:', pedido);

        let itemsHtml = '';
        if (pedido.items && pedido.items.length > 0) {
            itemsHtml = pedido.items.map(item => {
                const productName = item.product?.nombre || 'Producto';
                const unitPrice = item.precioUnitario || 0;
                return `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${productName}</strong>
                            <small class="text-muted d-block">${formatearPrecio(unitPrice)} x ${item.cantidad}</small>
                        </div>
                        <span class="fw-bold">${formatearPrecio(unitPrice * item.cantidad)}</span>
                    </li>
                `;
            }).join('');
        } else {
            itemsHtml = `<li class="list-group-item text-muted">No hay productos en este pedido</li>`;
        }

        const fecha = pedido.fechaPedido ? new Date(pedido.fechaPedido) : null;
        const fechaStr = fecha ? fecha.toLocaleString('es-CO') : 'Fecha no disponible';

        if (typeof mostrarModalKumo !== 'undefined') {
            mostrarModalKumo({
                icono: "bi-receipt",
                tipoIcono: "",
                titulo: `Pedido #${pedido.id}`,
                mensajeHTML: `
                    <div class="text-start">
                        <p><strong>Estado:</strong> <span class="badge bg-${getEstadoColor(pedido.estado)}">${getEstadoTexto(pedido.estado)}</span></p>
                        <p><strong>Fecha:</strong> ${fechaStr}</p>
                        <p><strong>Dirección:</strong> ${pedido.direccionEnvio || 'No especificada'}</p>
                        <p><strong>Método de pago:</strong> ${pedido.metodoPago || 'No especificado'}</p>
                        <hr>
                        <p><strong>Productos:</strong></p>
                        <ul class="list-group mb-3">
                            ${itemsHtml}
                        </ul>
                        <h5 class="text-end">Total: <span class="text-fucsia">${formatearPrecio(pedido.total)}</span></h5>
                    </div>
                `,
                botones: [
                    { texto: "Cerrar", clase: "modal-kumo-btn-ok" }
                ]
            });
        } else {
            alert('Detalle del pedido:\n' + JSON.stringify(pedido, null, 2));
        }
    } catch (error) {
        console.error('❌ Error al ver detalle:', error);
        alert('Error al cargar los detalles del pedido');
    }
}

// ============================================
// CANCELAR PEDIDO (CON MODAL KUMO) - CORREGIDO
// ============================================
async function cancelarPedido(pedidoId) {
    console.log('🔄 Cancelando pedido:', pedidoId);
    
    // Usar el modal KUMO desde window
    if (typeof window.mostrarModalKumo === 'function') {
        window.mostrarModalKumo({
            icono: "bi-exclamation-triangle-fill",
            tipoIcono: "",
            titulo: "Cancelar pedido",
            mensajeHTML: "¿Seguro que deseas cancelar este pedido? Esta acción no se puede deshacer.",
            botones: [
                { 
                    texto: "Cancelar", 
                    clase: "modal-kumo-btn-cancelar",
                    accion: () => {
                        if (typeof window.cerrarModalKumo === 'function') {
                            window.cerrarModalKumo();
                        }
                    }
                },
                {
                    texto: "Confirmar",
                    clase: "modal-kumo-btn-confirmar",
                    accion: async () => {
                        if (typeof window.cerrarModalKumo === 'function') {
                            window.cerrarModalKumo();
                        }
                        await procesarCancelacionPedido(pedidoId);
                    }
                }
            ]
        });
    } else {
        // Fallback: usar el modal simple CON ESTILOS CSS
        console.warn('⚠️ Modal KUMO no disponible, usando modal simple');
        crearModalCancelarSimple(pedidoId);
    }
}

// ============================================
// CREAR MODAL SIMPLE PARA CANCELAR (FALLBACK CON CSS)
// ============================================
function crearModalCancelarSimple(pedidoId) {
    // Eliminar modal anterior si existe
    const oldModal = document.getElementById('modalCancelarPedidoSimple');
    if (oldModal) oldModal.remove();
    
    const modalHTML = `
        <div id="modalCancelarPedidoSimple" class="modal-kumo-overlay" style="opacity:1;visibility:visible;">
            <div class="modal-kumo-box">
                <div class="modal-kumo-icono" style="background:#FEE2E2;color:#DC2626;box-shadow:none;">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                </div>
                <h5 class="modal-kumo-titulo">Cancelar pedido</h5>
                <p class="modal-kumo-mensaje">¿Seguro que deseas cancelar este pedido? Esta acción no se puede deshacer.</p>
                <div class="modal-kumo-botones">
                    <button class="modal-kumo-btn-cancelar" onclick="this.closest('#modalCancelarPedidoSimple').remove()">
                        Cancelar
                    </button>
                    <button class="modal-kumo-btn-confirmar" onclick="this.closest('#modalCancelarPedidoSimple').remove(); procesarCancelacionPedido(${pedidoId})">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Cerrar al hacer clic fuera
    document.getElementById('modalCancelarPedidoSimple').addEventListener('click', function(e) {
        if (e.target === this) {
            this.remove();
        }
    });
}

// ============================================
// PROCESAR CANCELACIÓN DE PEDIDO
// ============================================
async function procesarCancelacionPedido(pedidoId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Debes iniciar sesión');
            return;
        }

        const response = await fetch(`${PEDIDOS_API_URL}/orders/${pedidoId}/cancelar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            throw new Error(`Error ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Pedido cancelado:', result);

        if (typeof mostrarModalKumo !== 'undefined') {
            mostrarModalKumo({
                icono: "bi-check-circle-fill",
                tipoIcono: "icono-exito",
                titulo: "Pedido cancelado",
                mensajeHTML: "El pedido ha sido cancelado exitosamente.",
                botones: [
                    { 
                        texto: "Entendido", 
                        clase: "modal-kumo-btn-ok",
                        accion: () => {
                            if (typeof cerrarModalKumo === 'function') {
                                cerrarModalKumo();
                            }
                            renderizarPedidos();
                        }
                    }
                ]
            });
        } else {
           
            renderizarPedidos();
        }

    } catch (error) {
        console.error('❌ Error al cancelar pedido:', error);
        if (typeof mostrarModalKumo !== 'undefined') {
            mostrarModalKumo({
                icono: "bi-exclamation-triangle-fill",
                tipoIcono: "icono-vacio",
                titulo: "Error",
                mensajeHTML: `No se pudo cancelar el pedido: ${error.message}`,
                botones: [
                    { texto: "Entendido", clase: "modal-kumo-btn-ok" }
                ]
            });
        } else {
            alert('Error al cancelar el pedido: ' + error.message);
        }
    }
}

// ============================================
// INICIALIZAR
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 Cargando página de pedidos...');
    renderizarPedidos();
});

// ============================================
// EXPORTAR FUNCIONES
// ============================================
window.renderizarPedidos = renderizarPedidos;
window.verDetallePedido = verDetallePedido;
window.cancelarPedido = cancelarPedido;
window.procesarCancelacionPedido = procesarCancelacionPedido;

console.log('✅ pedidos.js cargado correctamente');