// js/main.js

// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Kumo App iniciada');
    console.log('📡 API URL:', API_CONFIG.BASE_URL);
    
    // Cargar datos iniciales
    loadOrders();
    
    // Configurar eventos
    setupEventListeners();
});

// ===== FUNCIONES DE ORDENES =====

// Cargar todos los pedidos
async function loadOrders() {
    try {
        const orders = await orderService.getAllOrders();
        displayOrders(orders);
        updateOrderCount(orders.length);
    } catch (error) {
        showError('Error al cargar pedidos: ' + error.message);
    }
}

// Mostrar pedidos en la tabla
function displayOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    
    if (!tbody) return;
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No hay pedidos registrados</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${formatDate(order.fechaPedido)}</td>
            <td>$${formatPrice(order.total)}</td>
            <td><span class="badge estado-${order.estado}">${order.estado}</span></td>
            <td>${order.user?.nombre || 'Usuario ' + order.usuarioId}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewOrder(${order.id})">
                    Ver
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteOrder(${order.id})">
                    Eliminar
                </button>
            </td>
        </tr>
    `).join('');
}

// Ver detalles de un pedido
async function viewOrder(orderId) {
    try {
        const order = await orderService.getOrderById(orderId);
        const items = await orderService.getOrderItems(orderId);
        
        // Mostrar modal con detalles
        showOrderModal(order, items);
    } catch (error) {
        showError('Error al cargar detalles: ' + error.message);
    }
}

// Eliminar un pedido
async function deleteOrder(orderId) {
    if (!confirm(`¿Estás seguro de eliminar el pedido #${orderId}?`)) {
        return;
    }

    try {
        await orderService.deleteOrder(orderId);
        showSuccess('Pedido eliminado correctamente');
        loadOrders(); // Recargar lista
    } catch (error) {
        showError('Error al eliminar: ' + error.message);
    }
}

// ===== CREAR PEDIDO =====

// Configurar eventos del formulario
function setupEventListeners() {
    const form = document.getElementById('createOrderForm');
    if (form) {
        form.addEventListener('submit', handleCreateOrder);
    }

    // Botón para limpiar formulario
    const clearBtn = document.getElementById('clearFormBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearOrderForm);
    }
}

// Manejar creación de pedido
async function handleCreateOrder(event) {
    event.preventDefault();
    
    // Obtener datos del formulario
    const formData = new FormData(event.target);
    
    const orderData = {
        user: { id: parseInt(formData.get('userId')) },
        direccionEnvio: formData.get('direccionEnvio'),
        metodoPago: formData.get('metodoPago'),
        orderItems: [
            {
                productoId: parseInt(formData.get('productoId')),
                cantidad: parseInt(formData.get('cantidad')),
                precioUnitario: parseFloat(formData.get('precioUnitario'))
            }
        ]
    };

    try {
        const newOrder = await orderService.createOrder(orderData);
        showSuccess(`Pedido #${newOrder.id} creado con éxito! Total: $${formatPrice(newOrder.total)}`);
        
        // Limpiar formulario
        clearOrderForm();
        
        // Recargar lista
        loadOrders();
    } catch (error) {
        showError('Error al crear pedido: ' + error.message);
    }
}

// Limpiar formulario
function clearOrderForm() {
    const form = document.getElementById('createOrderForm');
    if (form) {
        form.reset();
    }
}

// ===== FUNCIONES UTILITARIAS =====

// Formatear fecha
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Formatear precio
function formatPrice(amount) {
    return amount?.toFixed(2) || '0.00';
}

// Actualizar contador de pedidos
function updateOrderCount(count) {
    const counter = document.getElementById('orderCount');
    if (counter) {
        counter.textContent = count;
    }
}

// ===== NOTIFICACIONES =====

function showError(message) {
    showNotification(message, 'danger');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) {
        alert(message);
        return;
    }

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    container.appendChild(alert);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// ===== MODAL DE DETALLES =====

function showOrderModal(order, items) {
    // Implementar modal para mostrar detalles
    const modalHtml = `
        <div class="modal fade" id="orderModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Pedido #${order.id}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Fecha:</strong> ${formatDate(order.fechaPedido)}</p>
                                <p><strong>Estado:</strong> <span class="badge estado-${order.estado}">${order.estado}</span></p>
                                <p><strong>Total:</strong> $${formatPrice(order.total)}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Dirección:</strong> ${order.direccionEnvio}</p>
                                <p><strong>Método de pago:</strong> ${order.metodoPago}</p>
                                <p><strong>Usuario:</strong> ${order.user?.nombre || 'Usuario ' + order.usuarioId}</p>
                            </div>
                        </div>
                        <hr>
                        <h6>Productos:</h6>
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items?.map(item => `
                                    <tr>
                                        <td>${item.product?.nombre || 'Producto ' + item.productoId}</td>
                                        <td>${item.cantidad}</td>
                                        <td>$${formatPrice(item.precioUnitario)}</td>
                                        <td>$${formatPrice(item.precioUnitario * item.cantidad)}</td>
                                    </tr>
                                `).join('') || '<tr><td colspan="4">Sin items</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Eliminar modal existente y agregar nuevo
    const existingModal = document.getElementById('orderModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Inicializar modal de Bootstrap
    const modal = new bootstrap.Modal(document.getElementById('orderModal'));
    modal.show();
}