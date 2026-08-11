// ============================================
// SERVICIO DE CARRITO - CONEXIÓN CON EL BACKEND
// ============================================

// 🔥 USAR API_CONFIG en lugar de API_URL
const BASE_URL = API_CONFIG.BASE_URL;

// ============================================
// FUNCIÓN AUXILIAR: OBTENER ID DEL USUARIO DEL TOKEN
// ============================================
function obtenerUserIdDelToken() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        
        const payload = token.split('.')[1];
        if (!payload) return null;
        
        const decoded = atob(payload);
        const data = JSON.parse(decoded);
        
        console.log('🔍 Datos del token:', data);
        return data.id || data.userId || null;
    } catch (error) {
        console.error('❌ Error al decodificar token:', error);
        return null;
    }
}

// ============================================
// FUNCIÓN AUXILIAR: OBTENER ID DEL USUARIO
// ============================================
async function obtenerUserId() {
    // Primero intentar obtener del token
    const userIdFromToken = obtenerUserIdDelToken();
    if (userIdFromToken) {
        console.log('🔍 ID de usuario obtenido del token:', userIdFromToken);
        return userIdFromToken;
    }
    
    // Si no está en el token, buscar en localStorage
    try {
        const usuarioStr = localStorage.getItem('usuarioActivo') || 
                          localStorage.getItem('usuario') || 
                          localStorage.getItem('kumo_usuario');
        
        if (usuarioStr) {
            const usuario = JSON.parse(usuarioStr);
            if (usuario.id) {
                console.log('🔍 ID de usuario encontrado en localStorage:', usuario.id);
                return usuario.id;
            }
        }
    } catch (error) {
        console.error('❌ Error al obtener usuario de localStorage:', error);
    }
    
    console.warn('⚠️ No se pudo obtener el ID del usuario');
    return null;
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
        
        // 🔥 Usar apiClient con la URL correcta
        const data = await apiClient.get('/cart', true);
        console.log('✅ Carrito obtenido del backend:', data);
        return data;
    } catch (error) {
        if (error.message.includes('404')) {
            console.log('🛒 Usuario sin carrito, creando...');
            return await crearCarritoBackend();
        }
        console.error('❌ Error al obtener carrito:', error);
        return null;
    }
}

// ============================================
// 2. CREAR CARRITO PARA EL USUARIO
// ============================================
async function crearCarritoBackend() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No autenticado');
        }

        console.log('📤 Creando carrito en el backend...');
        
        // 🔥 Usar apiClient
        const data = await apiClient.post('/cart/create', {}, true);
        console.log('✅ Carrito creado en backend:', data);
        return data;
    } catch (error) {
        console.error('❌ Error al crear carrito:', error);
        return null;
    }
}

// ============================================
// 3. AGREGAR PRODUCTO AL CARRITO
// ============================================
async function agregarAlCarritoBackend(productId, quantity = 1) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No autenticado');
        }

        console.log(`📤 Agregando al carrito: productId=${productId}, cantidad=${quantity}`);

        // 🔥 Usar apiClient
        const data = await apiClient.post('/cart/add', {
            productId: Number(productId),
            cantidad: Number(quantity)
        }, true);
        
        console.log('✅ Producto agregado al carrito:', data);
        return { success: true, data: data };
    } catch (error) {
        console.error('❌ Error al agregar producto:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// 4. ELIMINAR PRODUCTO DEL CARRITO
// ============================================
async function eliminarDelCarritoBackend(productId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return { success: false, error: 'No autenticado' };
        }

        // 🔥 Usar apiClient
        const data = await apiClient.delete(`/cart/remove/${productId}`, true);
        console.log('✅ Producto eliminado del carrito:', data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error al eliminar producto:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// 5. ACTUALIZAR CANTIDAD DE PRODUCTO
// ============================================
async function actualizarCantidadBackend(productId, quantity) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return { success: false, error: 'No autenticado' };
        }

        // 🔥 Usar apiClient
        const data = await apiClient.put('/cart/update', {
            productId: Number(productId),
            cantidad: Number(quantity)
        }, true);
        
        console.log('✅ Cantidad actualizada:', data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error al actualizar cantidad:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// 6. VACIAR CARRITO
// ============================================
async function vaciarCarritoBackend() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return { success: false, error: 'No autenticado' };
        }

        // 🔥 Usar apiClient
        const data = await apiClient.delete('/cart/clear', true);
        console.log('✅ Carrito vaciado:', data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error al vaciar carrito:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// 7. OBTENER TOTAL DEL CARRITO
// ============================================
async function obtenerTotalCarritoBackend() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return null;
        }

        // 🔥 Usar apiClient
        const data = await apiClient.get('/cart/total', true);
        console.log('✅ Total del carrito:', data);
        return data;
    } catch (error) {
        console.error('❌ Error al obtener total:', error);
        return null;
    }
}

// ============================================
// 8. SINCRONIZAR CARRITO LOCAL CON BACKEND
// ============================================
async function sincronizarCarritoLocalConBackend() {
    try {
        const carritoBackend = await obtenerCarritoBackend();
        if (!carritoBackend) {
            console.log('⚠️ No se pudo obtener el carrito del backend');
            return;
        }

        console.log('📦 Backend devuelve:', carritoBackend);

        const itemsSource = carritoBackend.items || carritoBackend.cartItems || [];
        console.log('📦 Items encontrados:', itemsSource.length);
        
        const itemsLocal = itemsSource.map(item => {
            const product = item.product || {};
            
            // 🔥 OBTENER LA IMAGEN CORRECTAMENTE
            let imagenUrl = product.imagen || item.imagen || '../assets/img/sin-imagen.png';
            
            // ✅ Si es Base64 (empieza con data:image) - MANTENERLA COMO ESTÁ
            if (imagenUrl.startsWith('data:image')) {
                console.log('🖼️ Imagen Base64 detectada para:', product.nombre);
                // No hacer nada, mantenerla como está
            } 
            // ✅ Si es un nombre de archivo (como "onepiece-vol1.jpg")
            else if (imagenUrl && !imagenUrl.startsWith('http') && !imagenUrl.startsWith('../') && !imagenUrl.startsWith('data:')) {
                imagenUrl = `${API_CONFIG.BASE_URL}/uploads/${imagenUrl}`;
                console.log('🖼️ Imagen de servidor:', imagenUrl);
            }
            // ✅ Si ya es una URL completa, mantenerla
            else if (imagenUrl.startsWith('http')) {
                console.log('🖼️ Imagen con URL completa:', imagenUrl);
            }
            
            return {
                id: item.productoId || product.id || item.id,
                nombre: product.nombre || item.nombre || 'Producto',
                descripcion: product.descripcion || item.descripcion || '',
                precio: item.precioUnitario || product.precio || item.precio || 0,
                cantidad: item.cantidad || 1,
                imagen: imagenUrl
            };
        });

        localStorage.setItem('carrito', JSON.stringify(itemsLocal));
        console.log('✅ Carrito sincronizado con backend:', itemsLocal);

        // 🔥 DISPARAR EVENTO DE SINCRONIZACIÓN
        document.dispatchEvent(new CustomEvent('carritoSincronizado'));

    } catch (error) {
        console.error('❌ Error al sincronizar carrito:', error);
    }
}


// ============================================
// EXPORTAR FUNCIONES PARA USO GLOBAL
// ============================================
window.obtenerCarritoBackend = obtenerCarritoBackend;
window.crearCarritoBackend = crearCarritoBackend;
window.agregarAlCarritoBackend = agregarAlCarritoBackend;
window.eliminarDelCarritoBackend = eliminarDelCarritoBackend;
window.actualizarCantidadBackend = actualizarCantidadBackend;
window.vaciarCarritoBackend = vaciarCarritoBackend;
window.obtenerTotalCarritoBackend = obtenerTotalCarritoBackend;
window.sincronizarCarritoLocalConBackend = sincronizarCarritoLocalConBackend;

console.log('✅ carrito-service.js cargado correctamente');