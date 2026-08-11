// ============================================
// PERFIL - LÓGICA DE USUARIO
// ============================================

const API_BASE_URL = (typeof API_CONFIG !== 'undefined' && API_CONFIG.BASE_URL)
    ? API_CONFIG.BASE_URL
    : 'http://localhost:8081/api';

let usuarioActual = null;
let esAdmin = false;

// ============================================
// OBTENER USUARIO ACTUAL
// ============================================
function obtenerUsuarioActual() {
    try {
        // 🔥 PROBAR CON DIFERENTES CLAVES
        const usuarioStr = localStorage.getItem('usuarioActivo') ||
                          localStorage.getItem('usuario') ||
                          localStorage.getItem('kumo_usuario');
        
        if (usuarioStr) {
            const parsed = JSON.parse(usuarioStr);
            console.log('📦 Usuario obtenido de localStorage:', parsed);
            
            // 🔥 VERIFICAR QUE TENGA ID
            if (!parsed.id) {
                console.warn('⚠️ El usuario no tiene ID, intentando obtener del token...');
                // Intentar obtener ID del token
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const payload = token.split('.')[1];
                        const decoded = atob(payload);
                        const data = JSON.parse(decoded);
                        console.log('🔍 ID del token:', data.id);
                        parsed.id = data.id || data.userId;
                    } catch (e) {
                        console.error('Error al decodificar token:', e);
                    }
                }
            }
            
            usuarioActual = parsed;
            esAdmin = usuarioActual.rol?.toLowerCase() === 'admin' || 
            usuarioActual.rol?.toLowerCase() === 'administrador';
            
            console.log('✅ Usuario actual:', usuarioActual);
            console.log('✅ ID del usuario:', usuarioActual.id);
            
            return usuarioActual;
        }
        return null;
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        return null;
    }
}

// ============================================
// CARGAR DATOS DEL PERFIL
// ============================================
async function cargarPerfil() {
    const usuario = obtenerUsuarioActual();
    if (!usuario) {
        window.location.href = '../inicio_sesion/inicio_sesion.html';
        return;
    }

    // 🔥 VERIFICAR QUE EL USUARIO TENGA ID
    if (!usuario.id) {
        console.error('❌ El usuario no tiene ID. Datos:', usuario);
        mostrarNotificacion('Error: No se pudo obtener el ID del usuario', 'error');
        return;
    }

    console.log('✅ Cargando perfil para usuario ID:', usuario.id);
    console.log('📦 Datos completos del usuario:', usuario);

    // Mostrar datos del usuario (con verificación de existencia)
    const perfilNombre = document.getElementById('perfilNombre');
    const perfilEmail = document.getElementById('perfilEmail');
    const perfilRol = document.getElementById('perfilRol');
    const perfilTelefono = document.getElementById('perfilTelefono');
    const perfilDireccion = document.getElementById('perfilDireccion');
    const perfilFechaRegistro = document.getElementById('perfilFechaRegistro');

    if (perfilNombre) perfilNombre.textContent = usuario.nombre || usuario.nombres || 'Usuario';
    if (perfilEmail) perfilEmail.textContent = usuario.correo || usuario.email || 'usuario@email.com';
    if (perfilRol) perfilRol.textContent = usuario.rol || 'CLIENTE';

    // 🔥 OBTENER EL TELÉFONO DEL USUARIO DESDE EL BACKEND
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${usuario.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const userData = await response.json();
                console.log('📦 Datos del usuario desde el backend:', userData);
                
                // Actualizar el usuario en localStorage con los datos completos
                const usuarioCompleto = {
                    ...usuario,
                    telefono: userData.telefono || '',
                    direccion: userData.direccion || '',
                    fechaRegistro: userData.fechaRegistro || ''
                };
                
                // Guardar en localStorage
                localStorage.setItem('usuarioActivo', JSON.stringify(usuarioCompleto));
                localStorage.setItem('kumo_usuario', JSON.stringify(usuarioCompleto));
                usuarioActual = usuarioCompleto;
                
                // Mostrar teléfono (con verificación)
                if (perfilTelefono) perfilTelefono.textContent = userData.telefono || 'No especificado';
                if (perfilDireccion) perfilDireccion.textContent = userData.direccion || 'No especificada';
                if (perfilFechaRegistro) {
                    perfilFechaRegistro.textContent = userData.fechaRegistro 
                        ? new Date(userData.fechaRegistro).toLocaleDateString('es-CO') 
                        : '--';
                }
                
                // Llenar formulario
                const inputTelefono = document.getElementById('inputTelefono');
                if (inputTelefono) {
                    inputTelefono.value = userData.telefono || '';
                    console.log('📞 Teléfono del usuario:', userData.telefono);
                    console.log('📞 Valor del input:', inputTelefono.value);
                }
            } else {
                console.warn('⚠️ No se pudo obtener los datos completos del usuario');
                // Mostrar valores por defecto
                if (perfilTelefono) perfilTelefono.textContent = usuario.telefono || 'No especificado';
                if (perfilDireccion) perfilDireccion.textContent = usuario.direccion || 'No especificada';
                if (perfilFechaRegistro) perfilFechaRegistro.textContent = '--';
                
                const inputTelefono = document.getElementById('inputTelefono');
                if (inputTelefono) inputTelefono.value = usuario.telefono || '';
            }
        } catch (error) {
            console.error('❌ Error al obtener datos del usuario:', error);
        }
    } else {
        // Fallback: usar datos de localStorage
        if (perfilTelefono) perfilTelefono.textContent = usuario.telefono || 'No especificado';
        if (perfilDireccion) perfilDireccion.textContent = usuario.direccion || 'No especificada';
        if (perfilFechaRegistro) perfilFechaRegistro.textContent = '--';
        
        const inputTelefono = document.getElementById('inputTelefono');
        if (inputTelefono) inputTelefono.value = usuario.telefono || '';
    }

    // Si es admin, mostrar sección de administración
    if (esAdmin) {
        const seccionAdmin = document.getElementById('seccionAdminUsuarios');
        if (seccionAdmin) {
            seccionAdmin.style.display = 'block';
            await cargarUsuariosAdmin();
        }
    }
}
// ============================================
// CARGAR USUARIOS (PARA ADMIN)
// ============================================
async function cargarUsuariosAdmin() {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No autenticado');

        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Error al cargar usuarios');

        const usuarios = await response.json();
        const select = document.getElementById('selectUsuarioAdmin');
        select.innerHTML = '<option value="">Seleccionar usuario...</option>';
        
        usuarios.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.nombre} (${user.email})`;
            select.appendChild(option);
        });

        select.addEventListener('change', function() {
            if (this.value) {
                cargarDatosUsuarioAdmin(Number(this.value));
            } else {
                document.getElementById('datosUsuarioAdmin').style.display = 'none';
            }
        });

    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        mostrarNotificacion('Error al cargar usuarios', 'error');
    }
}

// ============================================
// CARGAR DATOS DE USUARIO (PARA ADMIN)
// ============================================
async function cargarDatosUsuarioAdmin(userId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No autenticado');

        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Error al cargar usuario');

        const user = await response.json();
        document.getElementById('adminNombre').value = user.nombre || '';
        document.getElementById('adminEmail').value = user.email || '';
        document.getElementById('adminRol').value = user.rol || 'CLIENTE';
        document.getElementById('adminEstado').value = user.activo ? 'true' : 'false';
        document.getElementById('adminPassword').value = '';
        document.getElementById('datosUsuarioAdmin').style.display = 'block';

        // Guardar ID del usuario seleccionado
        document.getElementById('selectUsuarioAdmin').dataset.selectedId = user.id;

    } catch (error) {
        console.error('Error al cargar usuario:', error);
        mostrarNotificacion('Error al cargar usuario', 'error');
    }
}

// ============================================
// GUARDAR USUARIO (PARA ADMIN)
// ============================================
async function guardarUsuarioAdmin() {
    const userId = document.getElementById('selectUsuarioAdmin').dataset.selectedId;
    if (!userId) {
        mostrarNotificacion('Selecciona un usuario primero', 'error');
        return;
    }

    console.log('📤 Guardando usuario ID:', userId);

    const data = {
        nombre: document.getElementById('adminNombre').value,
        rol: document.getElementById('adminRol').value,
        activo: document.getElementById('adminEstado').value === 'true'
    };

    const password = document.getElementById('adminPassword').value;
    if (password && password.trim() !== '') {
        if (password.length < 6) {
            mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        data.password = password;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No autenticado');

        console.log('📤 URL:', `${API_BASE_URL}/users/${userId}`);
        
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('❌ Error response:', error);
            throw new Error(error || 'Error al actualizar usuario');
        }

        const usuarioActualizado = await response.json();
        mostrarNotificacion('✅ Usuario actualizado exitosamente', 'exito');
        
        // Recargar lista de usuarios
        await cargarUsuariosAdmin();

    } catch (error) {
        console.error('❌ Error al actualizar usuario:', error);
        mostrarNotificacion('❌ Error al actualizar usuario: ' + error.message, 'error');
    }
}

// ============================================
// ACTUALIZAR PERFIL (USUARIO ACTUAL)
// ============================================
document.getElementById('formularioPerfil').addEventListener('submit', async function(e) {
    e.preventDefault();

    // 🔥 VERIFICAR QUE EL USUARIO TENGA ID
    if (!usuarioActual || !usuarioActual.id) {
        mostrarNotificacion('Error: No se pudo obtener el ID del usuario', 'error');
        return;
    }

    const data = {
        nombre: document.getElementById('inputNombre').value.trim(),
        telefono: document.getElementById('inputTelefono').value.trim(),
        direccion: document.getElementById('inputDireccion').value.trim()
    };

    if (!data.nombre) {
        mostrarNotificacion('El nombre es obligatorio', 'error');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No autenticado');

        const userId = usuarioActual.id;
        console.log('📤 Actualizando perfil para usuario ID:', userId);
        console.log('📤 URL:', `${API_BASE_URL}/users/${userId}`);
        
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('❌ Error response:', error);
            throw new Error(error || 'Error al actualizar perfil');
        }

        const usuarioActualizado = await response.json();
        console.log('✅ Usuario actualizado:', usuarioActualizado);
        
        // Actualizar localStorage
        const usuarioGuardado = {
            ...usuarioActual,
            nombre: usuarioActualizado.nombre,
            telefono: usuarioActualizado.telefono,
            direccion: usuarioActualizado.direccion
        };
        localStorage.setItem('usuarioActivo', JSON.stringify(usuarioGuardado));
        localStorage.setItem('kumo_usuario', JSON.stringify(usuarioGuardado));
        
        usuarioActual = usuarioGuardado;
        
        // Actualizar vista
        document.getElementById('perfilNombre').textContent = usuarioActualizado.nombre;
        document.getElementById('perfilTelefono').textContent = usuarioActualizado.telefono || 'No especificado';
        document.getElementById('perfilDireccion').textContent = usuarioActualizado.direccion || 'No especificada';

        mostrarNotificacion('✅ Perfil actualizado exitosamente', 'exito');

    } catch (error) {
        console.error('❌ Error al actualizar perfil:', error);
        mostrarNotificacion('❌ Error al actualizar perfil: ' + error.message, 'error');
    }
});


// ============================================
// CAMBIAR CONTRASEÑA
// ============================================
document.getElementById('formularioPassword').addEventListener('submit', async function(e) {
    e.preventDefault();

    // 🔥 VERIFICAR QUE EL USUARIO TENGA ID
    if (!usuarioActual || !usuarioActual.id) {
        mostrarNotificacion('Error: No se pudo obtener el ID del usuario', 'error');
        return;
    }

    const passwordActual = document.getElementById('inputPasswordActual').value;
    const passwordNueva = document.getElementById('inputPasswordNueva').value;
    const passwordConfirmar = document.getElementById('inputPasswordConfirmar').value;

    if (!passwordActual || !passwordNueva || !passwordConfirmar) {
        mostrarNotificacion('Todos los campos son obligatorios', 'error');
        return;
    }

    if (passwordNueva.length < 6) {
        mostrarNotificacion('La nueva contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    if (passwordNueva !== passwordConfirmar) {
        mostrarNotificacion('Las contraseñas no coinciden', 'error');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No autenticado');

        const userId = usuarioActual.id;
        console.log('📤 Cambiando contraseña para usuario ID:', userId);
        console.log('📤 URL:', `${API_BASE_URL}/users/${userId}/password`);
        
        const response = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                passwordActual: passwordActual,
                passwordNueva: passwordNueva
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('❌ Error response:', error);
            throw new Error(error || 'Error al cambiar contraseña');
        }

        mostrarNotificacion('✅ Contraseña cambiada exitosamente', 'exito');
        document.getElementById('formularioPassword').reset();

    } catch (error) {
        console.error('❌ Error al cambiar contraseña:', error);
        mostrarNotificacion('❌ Error al cambiar contraseña: ' + error.message, 'error');
    }
});

// ============================================
// MOSTRAR/OCULTAR CONTRASEÑA
// ============================================
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

// ============================================
// NOTIFICACIONES
// ============================================
function mostrarNotificacion(mensaje, tipo = 'exito') {
    const colores = {
        exito: '#10B981',
        error: '#EF4444',
        info: '#3B82F6',
        advertencia: '#F59E0B'
    };

    const iconos = {
        exito: 'bi-check-circle-fill',
        error: 'bi-exclamation-circle-fill',
        info: 'bi-info-circle-fill',
        advertencia: 'bi-exclamation-triangle-fill'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colores[tipo] || '#3B82F6'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.95rem;
        z-index: 99999;
        box-shadow: 0 8px 30px rgba(0,0,0,0.2);
        max-width: 400px;
        transform: translateX(120%);
        transition: transform 0.4s ease;
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: 'Nunito', sans-serif;
    `;
    toast.innerHTML = `<i class="bi ${iconos[tipo]}" style="font-size: 1.4rem;"></i> ${mensaje}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 4000);
}

// ============================================
// INICIALIZAR
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 Cargando perfil...');
    cargarPerfil();
});

// Exportar funciones globales
window.togglePassword = togglePassword;
window.guardarUsuarioAdmin = guardarUsuarioAdmin;