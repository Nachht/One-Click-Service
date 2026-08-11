// ============================================
// SERVICIO DE AUTENTICACIÓN
// ============================================

// ============================================
// CONFIGURACIÓN DE API
// ============================================
const API_URL = 'http://localhost:8081';

// ============================================
// 1. REGISTRO DE USUARIO
// ============================================
async function register(userData) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.text();

        if (response.ok) {
            return { success: true, message: data };
        } else {
            try {
                const errorJson = JSON.parse(data);
                return { success: false, error: errorJson.message || errorJson || 'Error al registrar usuario' };
            } catch {
                return { success: false, error: data || 'Error al registrar usuario' };
            }
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// 2. LOGIN DE USUARIO - CORREGIDO
// ============================================
async function login(email, password) {
    try {
        console.log('📤 Intentando login para:', email);
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        // 🔥 LEER LA RESPUESTA COMO TEXTO PRIMERO
        const responseText = await response.text();
        console.log('📦 Respuesta del backend:', responseText);

        // Si la respuesta es exitosa (200 OK)
        if (response.ok) {
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Error al parsear JSON:', e);
                return { 
                    success: false, 
                    error: 'Error en el formato de respuesta del servidor' 
                };
            }

            // ✅ Guardar sesión automáticamente
            guardarSesion(data.token, {
                email: data.email,
                nombre: data.nombre,
                rol: data.rol
            });
            
            return { 
                success: true, 
                token: data.token,
                email: data.email,
                rol: data.rol,
                nombre: data.nombre
            };
        } 
        // Si la respuesta NO es exitosa (401, 400, etc.)
        else {
            let errorMsg = 'Credenciales incorrectas. Por favor, verifica tu correo y contraseña.';
            
            // Intentar parsear como JSON si es posible
            try {
                const errorData = JSON.parse(responseText);
                errorMsg = errorData.message || errorData.error || responseText;
            } catch (e) {
                // Si no es JSON, usar el texto directamente
                if (responseText && responseText.trim()) {
                    errorMsg = responseText.trim();
                }
            }
            
            // 🔥 MENSAJES MÁS AMIGABLES
            if (errorMsg.toLowerCase().includes('password') || 
                errorMsg.toLowerCase().includes('contraseña') ||
                errorMsg.toLowerCase().includes('credencial') ||
                errorMsg.toLowerCase().includes('inválidas') ||
                errorMsg.toLowerCase().includes('invalid') ||
                errorMsg.toLowerCase().includes('unauthorized')) {
                errorMsg = 'Contraseña incorrecta. Por favor, verifica tus credenciales.';
            } else if (errorMsg.toLowerCase().includes('email') || 
                       errorMsg.toLowerCase().includes('correo') ||
                       errorMsg.toLowerCase().includes('not found') ||
                       errorMsg.toLowerCase().includes('no encontrado')) {
                errorMsg = 'Este correo no está registrado. Verifica tu email o regístrate.';
            }
            
            return { 
                success: false, 
                error: errorMsg 
            };
        }
    } catch (error) {
        console.error('Error en login:', error);
        return { 
            success: false, 
            error: 'Error de conexión con el servidor. Por favor, intenta nuevamente.' 
        };
    }
}

// ============================================
// 3. GUARDAR SESIÓN
// ============================================
function guardarSesion(token, userData) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuarioActivo', JSON.stringify({
        correo: userData.email,
        nombre: userData.nombre,
        rol: userData.rol
    }));
    localStorage.setItem('tokenExpiration', Date.now() + 3600000); // 1 hora
}

// ============================================
// 4. CERRAR SESIÓN
// ============================================
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioActivo');
    localStorage.removeItem('tokenExpiration');
    window.location.href = '../inicio_sesion/inicio_sesion.html';
}

// ============================================
// 5. VERIFICAR SI EL USUARIO ESTÁ AUTENTICADO
// ============================================
function isAuthenticated() {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('tokenExpiration');
    
    if (!token) return false;
    if (expiration && Date.now() > parseInt(expiration)) {
        // Token expirado
        localStorage.removeItem('token');
        localStorage.removeItem('usuarioActivo');
        localStorage.removeItem('tokenExpiration');
        return false;
    }
    return true;
}

// ============================================
// 6. OBTENER DATOS DEL USUARIO ACTIVO
// ============================================
function getUsuario() {
    const usuario = localStorage.getItem('usuarioActivo');
    return usuario ? JSON.parse(usuario) : null;
}

// ============================================
// 7. OBTENER EL TOKEN JWT
// ============================================
function getToken() {
    return localStorage.getItem('token');
}

console.log('✅ auth-service.js cargado correctamente');