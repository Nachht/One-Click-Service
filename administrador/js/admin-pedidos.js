// ============================================
// ADMIN - GESTIÓN DE PEDIDOS
// ============================================

// 🔥 CORREGIDO: Usar API_CONFIG.BASE_URL (ya incluye /api)
const API_BASE_URL = (typeof API_CONFIG !== 'undefined' && API_CONFIG.BASE_URL)
    ? API_CONFIG.BASE_URL
    : 'http://localhost:8081/api';

console.log('📦 API_BASE_URL:', API_BASE_URL);

let pedidosAdmin = [];
let textoBusquedaPedidos = '';
let estadoSeleccionado = 'todos';

// ============================================
// OBTENER TODOS LOS PEDIDOS (ADMIN)
// ============================================
async function obtenerTodosLosPedidos() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No autenticado');
        }

        console.log('📤 Obteniendo todos los pedidos (admin)...');
        console.log('📤 URL:', `${API_BASE_URL}/orders`);
        
        // 🔥 ENDPOINT CORRECTO: /api/orders
        const response = await fetch(`${API_BASE_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Pedidos obtenidos:', data.length || 0, 'pedidos');
        return data;
    } catch (error) {
        console.error('❌ Error al obtener pedidos:', error);
        return [];
    }
}

// ============================================
// ACTUALIZAR ESTADO DE PEDIDO (ADMIN)
// ============================================
async function actualizarEstadoPedido(pedidoId, nuevoEstado) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No autenticado');
        }

        console.log(`📤 Actualizando pedido ${pedidoId} a ${nuevoEstado}`);
        console.log('📤 URL:', `${API_BASE_URL}/orders/${pedidoId}/estado?estado=${nuevoEstado}`);
        
        const response = await fetch(`${API_BASE_URL}/orders/${pedidoId}/estado?estado=${nuevoEstado}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('❌ Error response:', error);
            throw new Error(error || 'Error al actualizar estado');
        }

        const data = await response.json();
        console.log('✅ Estado actualizado:', data);
        return data;
    } catch (error) {
        console.error('❌ Error al actualizar estado:', error);
        throw error;
    }
}

// ============================================
// VER DETALLE DE PEDIDO (ADMIN)
// ============================================
async function verDetallePedidoAdmin(pedidoId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Debes iniciar sesión');
            return;
        }

        console.log('📤 Obteniendo detalle del pedido:', pedidoId);
        console.log('📤 URL:', `${API_BASE_URL}/orders/${pedidoId}`);
        
        const response = await fetch(`${API_BASE_URL}/orders/${pedidoId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }

        const pedido = await response.json();
        console.log('📦 Detalle del pedido:', pedido);

        let productosHTML = '';
        if (pedido.items && pedido.items.length > 0) {
            productosHTML = pedido.items.map(item => {
                const product = item.product || {};
                let imagenUrl = product.imagen || '../assets/img/logo.png';
                if (imagenUrl.startsWith('data:image')) {
                    // Base64 - mantener
                } else if (!imagenUrl.startsWith('http') && !imagenUrl.startsWith('../')) {
                    imagenUrl = `${API_BASE_URL}/uploads/${imagenUrl}`;
                }

                return `
                    <div class="producto-item">
                        <img src="${imagenUrl}" alt="${product.nombre || 'Producto'}" onerror="this.src='../assets/img/logo.png'">
                        <div class="info">
                            <div class="nombre">${product.nombre || 'Producto'}</div>
                            <div class="detalle">${item.cantidad} x ${formatearPrecio(item.precioUnitario)}</div>
                        </div>
                        <span class="fw-bold">${formatearPrecio(item.precioUnitario * item.cantidad)}</span>
                    </div>
                `;
            }).join('');
        } else {
            productosHTML = '<p class="text-muted">No hay productos en este pedido</p>';
        }

        const fecha = pedido.fechaPedido ? new Date(pedido.fechaPedido) : null;
        const fechaStr = fecha ? fecha.toLocaleString('es-CO') : 'Fecha no disponible';
        const estadoTexto = getEstadoTexto(pedido.estado);
        const estadoClass = `estado-${pedido.estado?.toLowerCase() || 'pendiente'}`;

        document.getElementById('tituloDetallePedido').textContent = `Pedido #${pedido.id}`;
        document.getElementById('contenidoDetallePedido').innerHTML = `
            <div class="detalle-pedido-info">
                <div>
                    <p><strong>Estado:</strong> <span class="estado-badge ${estadoClass}">${estadoTexto}</span></p>
                    <p><strong>Fecha:</strong> ${fechaStr}</p>
                    <p><strong>Cliente:</strong> ${pedido.user?.nombre || `Usuario ${pedido.usuarioId || 'N/A'}`}</p>
                </div>
                <div>
                    <p><strong>Dirección:</strong> ${pedido.direccionEnvio || 'No especificada'}</p>
                    <p><strong>Método de pago:</strong> ${pedido.metodoPago || 'No especificado'}</p>
                    <p><strong>Usuario ID:</strong> ${pedido.usuarioId || 'N/A'}</p>
                </div>
            </div>
            <div class="detalle-pedido-productos">
                <h6 class="fw-bold mb-2">Productos</h6>
                ${productosHTML}
            </div>
            <div class="detalle-pedido-total">
                Total: <span>${formatearPrecio(pedido.total)}</span>
            </div>
        `;

        document.getElementById('modalDetallePedido').classList.add('activo');

    } catch (error) {
        console.error('❌ Error al ver detalle:', error);
        alert('Error al cargar los detalles del pedido');
    }
}

// ============================================
// ABRIR MODAL CAMBIAR ESTADO
// ============================================
let pedidoIdCambiarEstado = null;

function abrirCambiarEstadoPedido(pedidoId, estadoActual) {
    pedidoIdCambiarEstado = pedidoId;

    const estados = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];
    const estadoActualLower = estadoActual.toLowerCase();

    const estadosDisponibles = estados.filter(e => e !== estadoActualLower);

    let html = `
        <p>Selecciona el nuevo estado para el pedido <strong>#${pedidoId}</strong>:</p>
        <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:16px 0;">
    `;

    estadosDisponibles.forEach(estado => {
        const label = getEstadoTexto(estado);
        const colors = {
            'confirmado': '#2563EB',
            'enviado': '#4F46E5',
            'entregado': '#059669',
            'cancelado': '#DC2626'
        };
        const bgColor = colors[estado] || '#8A2BE2';
        html += `
            <button onclick="confirmarCambioEstadoPedido('${estado}')" 
                    class="btn-accion-pedido btn-cambiar-estado"
                    style="background:${bgColor}; color:white; padding:8px 20px; border:none; border-radius:8px; cursor:pointer; font-weight:700;">
                ${label}
            </button>
        `;
    });

    html += `</div>`;

    document.getElementById('tituloConfirmarEstadoPedido').textContent = 'Cambiar estado del pedido';
    document.getElementById('mensajeConfirmarEstadoPedido').innerHTML = html;
    document.getElementById('modalConfirmarEstadoPedido').classList.add('activo');
}

// ============================================
// CONFIRMAR CAMBIO DE ESTADO
// ============================================
async function confirmarCambioEstadoPedido(nuevoEstado) {
    if (!pedidoIdCambiarEstado) return;

    try {
        await actualizarEstadoPedido(pedidoIdCambiarEstado, nuevoEstado);
        document.getElementById('modalConfirmarEstadoPedido').classList.remove('activo');
        await cargarPedidosAdmin();
        mostrarNotificacion('✅ Estado del pedido actualizado exitosamente', 'exito');
    } catch (error) {
        mostrarNotificacion('❌ Error al actualizar estado: ' + error.message, 'error');
    }
}

// ============================================
// RENDERIZAR TABLA DE PEDIDOS
// ============================================
function renderizarPedidosAdmin() {
    const contenedor = document.getElementById('contenedorPedidosAdmin');
    if (!contenedor) {
        console.warn('⚠️ No se encontró #contenedorPedidosAdmin');
        return;
    }

    let pedidosFiltrados = [...pedidosAdmin];

    if (estadoSeleccionado !== 'todos') {
        pedidosFiltrados = pedidosFiltrados.filter(p =>
            p.estado?.toLowerCase() === estadoSeleccionado
        );
    }

    if (textoBusquedaPedidos.trim() !== '') {
        const busqueda = textoBusquedaPedidos.toLowerCase();
        pedidosFiltrados = pedidosFiltrados.filter(p =>
            p.id.toString().includes(busqueda) ||
            (p.usuarioId && p.usuarioId.toString().includes(busqueda))
        );
    }

    document.getElementById('contadorPedidosTotal').textContent = pedidosAdmin.length;
    document.getElementById('contadorPedidosVisibles').textContent = pedidosFiltrados.length;

    if (pedidosFiltrados.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-inbox" style="font-size: 3rem; color: #D1D5DB;"></i>
                <h5 class="mt-3 text-muted">No se encontraron pedidos</h5>
                <p class="text-muted">${textoBusquedaPedidos ? 'Intenta con otra búsqueda' : ''}</p>
            </div>
        `;
        return;
    }

    let html = `
        <table class="tablaPedidos">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    pedidosFiltrados.forEach(pedido => {
        const fecha = pedido.fechaPedido ? new Date(pedido.fechaPedido) : null;
        const fechaStr = fecha ? fecha.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'N/A';

        const estado = pedido.estado || 'pendiente';
        const estadoClass = `estado-${estado.toLowerCase()}`;
        const estadoTexto = getEstadoTexto(estado);
        const nombreCliente = pedido.user?.nombre || `Usuario ${pedido.usuarioId || 'N/A'}`;

        html += `
            <tr>
                <td data-label="ID"><strong>#${pedido.id}</strong></td>
                <td data-label="Cliente">${nombreCliente}</td>
                <td data-label="Fecha">${fechaStr}</td>
                <td data-label="Total"><strong>${formatearPrecio(pedido.total)}</strong></td>
                <td data-label="Estado">
                    <span class="estado-badge ${estadoClass}">${estadoTexto}</span>
                </td>
                <td data-label="Acciones">
                    <button class="btn-accion-pedido btn-ver-detalle" onclick="verDetallePedidoAdmin(${pedido.id})">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn-accion-pedido btn-cambiar-estado" onclick="abrirCambiarEstadoPedido(${pedido.id}, '${estado}')">
                        <i class="bi bi-arrow-repeat"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    contenedor.innerHTML = html;
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================
function formatearPrecio(precio) {
    if (!precio) return '$0';
    return Number(precio).toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    });
}

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

function mostrarNotificacion(mensaje, tipo = 'exito') {
    // ... (código de notificación)
}

// ============================================
// CERRAR MODALES
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const cerrarDetalle = document.getElementById('cerrarModalDetalle');
    if (cerrarDetalle) {
        cerrarDetalle.addEventListener('click', () => {
            document.getElementById('modalDetallePedido').classList.remove('activo');
        });
    }

    const cerrarConfirmar = document.getElementById('cerrarModalConfirmarEstadoPedido');
    if (cerrarConfirmar) {
        cerrarConfirmar.addEventListener('click', () => {
            document.getElementById('modalConfirmarEstadoPedido').classList.remove('activo');
            pedidoIdCambiarEstado = null;
        });
    }

    const modalDetalle = document.getElementById('modalDetallePedido');
    if (modalDetalle) {
        modalDetalle.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                modalDetalle.classList.remove('activo');
            }
        });
    }

    const modalConfirmar = document.getElementById('modalConfirmarEstadoPedido');
    if (modalConfirmar) {
        modalConfirmar.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                modalConfirmar.classList.remove('activo');
                pedidoIdCambiarEstado = null;
            }
        });
    }
});

// ============================================
// FILTROS Y BÚSQUEDA
// ============================================
function configurarFiltros() {
    const filtros = ['todos', 'pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];
    
    filtros.forEach(id => {
        const btnId = `filtro${id.charAt(0).toUpperCase() + id.slice(1)}`;
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.btnFiltroPedido').forEach(b => b.classList.remove('activo'));
                btn.classList.add('activo');
                estadoSeleccionado = id;
                renderizarPedidosAdmin();
            });
        }
    });
}

// Configurar búsqueda
document.addEventListener('DOMContentLoaded', function() {
    const buscador = document.getElementById('buscadorPedidos');
    const btnLimpiar = document.getElementById('btnLimpiarBusquedaPedidos');
    
    if (buscador) {
        buscador.addEventListener('input', function() {
            textoBusquedaPedidos = this.value.trim();
            if (btnLimpiar) {
                btnLimpiar.classList.toggle('visible', this.value.length > 0);
            }
            renderizarPedidosAdmin();
        });
    }
    
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', function() {
            if (buscador) {
                buscador.value = '';
                textoBusquedaPedidos = '';
                this.classList.remove('visible');
                renderizarPedidosAdmin();
            }
        });
    }
});

// ============================================
// CARGAR PEDIDOS
// ============================================
async function cargarPedidosAdmin() {
    const contenedor = document.getElementById('contenedorPedidosAdmin');
    if (!contenedor) return;
    
    contenedor.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3 text-muted">Cargando pedidos...</p>
        </div>
    `;

    try {
        pedidosAdmin = await obtenerTodosLosPedidos();
        renderizarPedidosAdmin();
    } catch (error) {
        console.error('❌ Error al cargar pedidos:', error);
        contenedor.innerHTML = `
            <div class="text-center py-5 text-danger">
                <i class="bi bi-exclamation-triangle-fill" style="font-size: 3rem;"></i>
                <h5 class="mt-3">Error al cargar pedidos</h5>
                <p>${error.message}</p>
                <button class="btn btn-primary mt-3" onclick="cargarPedidosAdmin()">
                    <i class="bi bi-arrow-clockwise me-1"></i> Reintentar
                </button>
            </div>
        `;
    }
}

// ============================================
// INICIALIZAR
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Cargando administración de pedidos...');
    configurarFiltros();
    cargarPedidosAdmin();

    // Verificar rol de admin
    const usuario = JSON.parse(localStorage.getItem('usuarioActivo') || '{}');
    if (usuario.rol?.toLowerCase() !== 'admin') {
        window.location.href = '../../inicio/index.html';
    }
});

// ============================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================
window.verDetallePedidoAdmin = verDetallePedidoAdmin;
window.abrirCambiarEstadoPedido = abrirCambiarEstadoPedido;
window.confirmarCambioEstadoPedido = confirmarCambioEstadoPedido;
window.cargarPedidosAdmin = cargarPedidosAdmin;



// ============================================
// ESCUCHAR EVENTO DE PRODUCTOS ACTUALIZADOS (ADMIN)
// ============================================
document.addEventListener('productosActualizados', async function() {
    console.log('🔄 Evento: productosActualizados - Actualizando panel admin');
    await cargarProductos();
});




