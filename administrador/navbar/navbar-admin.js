document.addEventListener("DOMContentLoaded", function () {

    // 1. FUNCIONES DE AUTENTICACIÓN
    function obtenerUsuarioLogueado() {
        console.log("🔍 Buscando usuario en localStorage...");

        const usuario = localStorage.getItem("usuarioActivo");
        console.log("📦 Valor en localStorage:", usuario);

        if (usuario) {
            try {
                const user = JSON.parse(usuario);
                console.log("✅ Usuario encontrado:", user);
                return user;
            } catch (e) {
                console.error("❌ Error al parsear usuario:", e);
                return null;
            }
        }
        console.log("❌ No hay usuario en localStorage");
        return null;
    }

    function cerrarSesion() {
    console.log("🚪 Cerrando sesión...");
    
    // Limpiar datos de sesión
    localStorage.removeItem("usuarioActivo");
    localStorage.removeItem("kumo_usuario");
    localStorage.removeItem("token");
    // Opcional: eliminar carrito al cerrar sesión
    // localStorage.removeItem("carrito");
    
    console.log("✅ Sesión cerrada correctamente");
    
    // 🔥 REDIRIGIR AL INDEX
    window.location.href = "../../inicio/index.html";
}


    // 2. GENERAR NAVBAR ADMIN
    const navbarContainer = document.getElementById("navbar-container");
    if (!navbarContainer) {
        console.warn("⚠️ No se encontró #navbar-container");
        return;
    }

    function generarNavbarAdmin() {
        const usuario = obtenerUsuarioLogueado();
        console.log('👤 Usuario para navbar:', usuario);

        let userHTML = '';

        if (usuario) {
            console.log('✅ Usuario logueado, generando menú...');
            const nombre = usuario.nombre || usuario.nombres || 'Administrador';
            const primerNombre = nombre.split(' ')[0];

            userHTML = `
                <div class="dropdown">
                    <button class="btn-user-dropdown dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-person-circle" style="font-size: 1.2rem; color: #FD0C7D;"></i>
                        <span>${primerNombre}</span>
                        <i class="bi bi-chevron-down" style="font-size: 0.7rem; color: rgba(255,255,255,0.4);"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li>
                            <a class="dropdown-item" href="../../perfil/perfil.html"></i> Mi perfil
                            </a>
                        </li>
                        <li>
                            <hr class="dropdown-divider">
                        </li>
                        <li>
                            <a class="dropdown-item" href="../html/admin-servicios.html" >
                                <i class="bi bi-shield-lock"></i> Admin Productos
                            </a>
                        </li>
                        <li>
                            <a class="dropdown-item" href="../html/admin-pedidos.html">
                                <i class="bi bi-box-seam"></i> Admin Pedidos
                            </a>
                        </li>
                        <li>
                            <hr class="dropdown-divider" style="border-color: rgba(255,255,255,0.06);">
                        </li>
                        <li>
                            <button class="dropdown-item text-danger" onclick="cerrarSesion()" >
                                <i class="bi bi-box-arrow-right"></i> Cerrar sesión
                            </button>
                        </li>
                    </ul>
                </div>
            `;
            console.log('✅ userHTML generado para usuario logueado');
        } else {
            console.log('❌ Usuario NO logueado, mostrando login/registro');
            userHTML = `
                <a href="../../inicio_sesion/inicio_sesion.html" class="btn-login"></i> Iniciar sesión
                </a>
                <a href="../../registro/registro.html" class="btn-registro" >
                    <i class="bi bi-person-plus"></i> Registrarse
                </a>
            `;
        }

        console.log('📦 userHTML final (longitud):', userHTML.length);
        console.log('📦 userHTML preview:', userHTML.substring(0, 100) + '...');

        return `
            <header>
                <nav class="navbar-kumo">
                    <div class="container-kumo">
                        <div class="nav-top">
                            <!-- LOGO -->
                            <a href="../../inicio/index.html" class="logo-link">
                                <img src="../../assets/img/logo.png" alt="KUMO" class="logo-img" style="height: 50px; width: 50px; display: block;">
                            </a>
                            
                            

                            <!-- ÍCONOS -->
                            <div class="nav-icons" >
                                <!-- Menú de usuario -->
                                <div class="user-menu-container" id="adminUserMenu" >
                                    ${userHTML}
                                </div>
                                
                                <!-- Volver a la tienda -->
                                <a href="../../inicio/index.html" class="icon-link" title="Volver a la tienda"  >
                                    <i class="bi bi-shop" ></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
        `;
    }

    // 3. INYECTAR NAVBAR
    console.log('🚀 Inyectando navbar admin...');
    navbarContainer.innerHTML = generarNavbarAdmin();
    console.log('✅ Navbar admin inyectado');


    // 4. INICIALIZAR DROPDOWNS (Bootstrap)
    function inicializarDropdownsAdmin() {
        console.log('🔄 Inicializando dropdowns admin...');

        if (typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
            document.querySelectorAll('.dropdown-toggle').forEach(element => {
                try {
                    const existing = bootstrap.Dropdown.getInstance(element);
                    if (existing) existing.dispose();
                } catch (e) { }

                try {
                    new bootstrap.Dropdown(element);
                    console.log('✅ Dropdown inicializado:', element);
                } catch (e) {
                    console.warn('⚠️ Error en dropdown:', e);
                }
            });
            console.log('✅ Dropdowns admin inicializados');
        } else {
            console.warn('⚠️ Bootstrap no disponible, reintentando...');
            if (!document.querySelector('script[src*="bootstrap.bundle"]')) {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
                script.onload = function () {
                    console.log('✅ Bootstrap cargado desde CDN');
                    inicializarDropdownsAdmin();
                };
                document.head.appendChild(script);
            } else {
                setTimeout(inicializarDropdownsAdmin, 500);
            }
        }
    }

    setTimeout(inicializarDropdownsAdmin, 300);

    // 5. EXPONER FUNCIONES GLOBALMENTE
    window.cerrarSesion = cerrarSesion;
    window.obtenerUsuarioLogueado = obtenerUsuarioLogueado;

    console.log('✅ admin-navbar.js cargado correctamente');
});