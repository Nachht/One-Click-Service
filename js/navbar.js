console.log("✅ Hola navbar - JS cargado correctamente");

// CARGAR BOOTSTRAP JS SI NO ESTÁ DISPONIBLE
function cargarBootstrap() {
    if (typeof bootstrap !== 'undefined') {
        console.log('✅ Bootstrap ya está disponible');
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
        script.onload = () => {
            resolve();
        };
        script.onerror = () => {
            console.error('❌ Error al cargar Bootstrap');
            reject();
        };
        document.head.appendChild(script);
    });
}

//FUNCIONES DE AUTENTICACIÓN
function obtenerUsuarioLogueado() {
    // Intentar con diferentes claves de localStorage
    const usuario = localStorage.getItem("usuarioActivo") || localStorage.getItem("usuario") || localStorage.getItem("kumo_usuario");
    if (usuario) {
        try {
            const parsed = JSON.parse(usuario);
            console.log('👤 Usuario obtenido:', parsed);
            return parsed;
        } catch (e) {
            console.error('❌ Error al parsear usuario:', e);
            return null;
        }
    }
    return null;
}

function estaLogueado() {
    return obtenerUsuarioLogueado() !== null;
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
    window.location.href = "../inicio/index.html";
}

//OFFCANVAS DEL CARRITO (VERSIÓN COMPLETA Y ESTILIZADA)
function prepararOffcanvasCarrito() {
    if (!document.getElementById("carritoKumo")) {
        const offcanvasHTML = `
            <div class="offcanvas offcanvas-end" tabindex="-1" id="carritoKumo" aria-labelledby="carritoKumoLabel"
                style="background-color: #1b1618; color: white; width: 380px; border-left: 2px solid #ff007f;">

                <div class="offcanvas-header pt-4 pb-2 px-4 border-bottom border-secondary border-opacity-25">
                    <h6 class="offcanvas-title fw-bold text-uppercase small text-fucsia-neon" id="carritoKumoLabel"
                        style="letter-spacing: 1px;">
                        CARRITO (<span id="cantidadArticulos">0</span>)
                    </h6>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"
                        style="font-size: 0.8rem;"></button>
                </div>

                <div class="offcanvas-body px-4 pt-3">
                    <div id="contenedorArticulos" class="d-flex flex-column gap-2"></div>

                    <div class="text-start mt-3">
                        <button id="btnVaciarCarrito"
                            class="btn btn-link btn-vaciar-offcanvas text-decoration-none p-0 small fw-bold text-uppercase"
                            style="font-size: 0.75rem; letter-spacing: 0.5px;">
                            Vaciar Carrito
                        </button>
                    </div>
                </div>

                <div class="offcanvas-footer p-4 border-top border-secondary border-opacity-25">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="small fw-bold text-white-50 text-uppercase" style="letter-spacing: 0.5px;">Subtotal</span>
                        <span id="subtotalCarrito" class="fw-bold fs-4 text-fucsia-neon">$0</span>
                    </div>

                    <div class="d-flex flex-column gap-2 text-center">
                        <button id="btnComprar" class="btn btn-fucsia-led w-100 py-2.5 fw-bold text-uppercase rounded-3">
                            Comprar
                        </button>

                        <a href="../carrito/carrito.html"
                            class="btn btn-outline-fucsia-led w-100 py-2 fw-bold text-uppercase rounded-3 mt-1"
                            style="font-size: 0.75rem; letter-spacing: 1px;">
                            Ver carrito completo
                        </a>

                        <button type="button"
                            class="btn btn-link btn-seguir-viendo text-decoration-none text-uppercase fw-bold p-0 mt-1"
                            data-bs-dismiss="offcanvas" style="font-size: 0.75rem; letter-spacing: 0.5px;">
                            Seguir viendo
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML("beforeend", offcanvasHTML);
        console.log('✅ Offcanvas del carrito preparado');
    }
}

// CARGAR NAVBAR
function cargarNavbar() {
    const path = window.location.pathname;
    let rutaNavbar = '../navbar/navbar-completo.html';

    if (path.includes('/administrador/')) {
        rutaNavbar = '../../navbar/navbar-completo.html';
    } else if (path.includes('/inicio/') || path.includes('/catalogo/') ||
        path.includes('/nosotros/') || path.includes('/contactenos/')) {
        rutaNavbar = '../navbar/navbar-completo.html';
    }

    console.log('📦 Cargando navbar desde:', rutaNavbar);

    cargarBootstrap()
        .then(() => {
            return fetch(rutaNavbar);
        })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.text();
        })
        .then(data => {
            document.body.insertAdjacentHTML("afterbegin", data);

            // Preparar Offcanvas del carrito
            prepararOffcanvasCarrito();

            // Avisar a carrito.js que el navbar y el offcanvas ya están listos
            document.dispatchEvent(new CustomEvent("navbarCargado"));

            setTimeout(() => {
                actualizarMenuUsuario();
                inicializarInteracciones();
                crearBadge();
                actualizarBadgeCarrito();
            }, 100);
        })
        .catch(err => console.warn("⚠️ No se pudo cargar el navbar:", err));
}

//CREAR BADGE DEL CARRITO
function crearBadge() {
    const usuario = obtenerUsuarioLogueado();
    if (!usuario) {
        console.log('👤 Usuario no logueado, badge no creado');
        return;
    }

    const carritoBtn = document.querySelector('.btn-cart-offcanvas');
    if (!carritoBtn) {
        console.warn('⚠️ Botón de carrito no encontrado');
        return;
    }

    let badge = carritoBtn.querySelector('.badge-number');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'badge-number';
        badge.id = 'badge';
        badge.textContent = '0';
        carritoBtn.style.position = 'relative';
        carritoBtn.appendChild(badge);
    }
}

// 6. ACTUALIZAR BADGE DEL CARRITO
// En navbar.js
function actualizarBadgeCarrito() {
    const usuario = obtenerUsuarioLogueado();
    const carritoBtn = document.querySelector('.btn-cart-offcanvas');

    if (!carritoBtn) return;

    let badge = carritoBtn.querySelector('.badge-number');

    if (!usuario) {
        if (badge) {
            badge.style.display = 'none';
        }
        return;
    }

    // 🔥 Leer carrito desde localStorage
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'badge-number';
        badge.id = 'badge';
        badge.textContent = '0';
        carritoBtn.style.position = 'relative';
        carritoBtn.appendChild(badge);
        console.log('✅ Badge creado');
    }

    badge.style.display = 'flex';
    badge.textContent = totalItems;
}


// ACTUALIZAR MENÚ DE USUARIO
function actualizarMenuUsuario() {
    const usuario = obtenerUsuarioLogueado();

    const cuentaLink = document.querySelector('.icon-link[href*="perfil"]');
    if (!cuentaLink) {
        console.warn('⚠️ No se encontró el enlace "Cuenta"');
        return;
    }

    const menuContainer = document.createElement('div');
    menuContainer.className = 'user-menu-container';
    menuContainer.style.cssText = 'display: flex; align-items: center; gap: 12px;';

    if (usuario) {
        const nombre = usuario.nombre || usuario.nombres || 'Usuario';
        const primerNombre = nombre.split(' ')[0];
        
        // 🔥 CORREGIDO: Comparar correctamente el rol (mayúsculas/minúsculas)
        const esAdmin = usuario.rol && (usuario.rol.toLowerCase() === 'admin' || usuario.rol.toLowerCase() === 'administrador');

        console.log(`🔍 Usuario: ${primerNombre}, esAdmin: ${esAdmin}, rol: ${usuario.rol}`);

        // 🔥 Construir el menú según el rol
        let itemsMenu = '';
        
        if (esAdmin) {
            // 👑 PARA ADMIN: Mostrar Panel Admin con opciones de gestión
            console.log('👑 Mostrando menú de ADMIN');
            itemsMenu = `
                <li><a class="dropdown-item" href="../perfil/perfil.html"><i class="bi bi-person"></i> Mi perfil</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="../administrador/html/admin-servicios.html"><i class="bi bi-shield-lock"></i> Admin Productos</a></li>
                <li><a class="dropdown-item" href="../administrador/html/admin-pedidos.html"><i class="bi bi-box-seam"></i> Admin Pedidos</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><button class="dropdown-item text-danger" onclick="cerrarSesion()"><i class="bi bi-box-arrow-right"></i> Cerrar sesión</button></li>
            `;
        } else {
            // 👤 PARA CLIENTE: Mostrar Mis pedidos
            console.log('👤 Mostrando menú de CLIENTE');
            itemsMenu = `
                <li><a class="dropdown-item" href="../perfil/perfil.html"><i class="bi bi-person"></i> Mi perfil</a></li>
                <li><a class="dropdown-item" href="../pedidos/pedidos.html"><i class="bi bi-box-seam"></i> Mis pedidos</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><button class="dropdown-item text-danger" onclick="cerrarSesion()"><i class="bi bi-box-arrow-right"></i> Cerrar sesión</button></li>
            `;
        }

        menuContainer.innerHTML = `
            <div class="dropdown">
                <button class="btn-user-dropdown dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-person-circle"></i>
                    <span class="user-name">${primerNombre}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    ${itemsMenu}
                </ul>
            </div>
        `;
        
        // Cargar carrito desde backend al loguearse
        setTimeout(cargarCarritoAlLoguearse, 500);
        
    } else {
        menuContainer.innerHTML = `
            <a href="../inicio_sesion/inicio_sesion.html" class="btn-login">
                <i class="bi bi-box-arrow-in-right"></i> Ingresar
            </a>
            <a href="../registro/registro.html" class="btn-registro">
                <i class="bi bi-person-plus"></i> Registrarse
            </a>
        `;
    }

    cuentaLink.replaceWith(menuContainer);
    
    // Reinicializar dropdowns después de actualizar el menú
    setTimeout(inicializarDropdowns, 100);
}

// ============================================
// CARGAR CARRITO DESDE BACKEND AL LOGIN
// ============================================
async function cargarCarritoAlLoguearse() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('⚠️ Usuario no autenticado');
        return;
    }

    try {
        // Esperar a que carrito-service.js esté cargado
        if (typeof sincronizarCarritoLocalConBackend === 'function') {
            await sincronizarCarritoLocalConBackend();
        } else {
            console.warn('⚠️ carrito-service.js no está cargado');
        }
    } catch (error) {
        console.error('❌ Error al cargar carrito:', error);
    }
}



//INICIALIZAR DROPDOWNS
function inicializarDropdowns() {
    if (typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
        document.querySelectorAll('.dropdown-toggle').forEach(element => {
            try {
                const existing = bootstrap.Dropdown.getInstance(element);
                if (existing) existing.dispose();
            } catch (e) { }

            try {
                new bootstrap.Dropdown(element);
            } catch (e) {
                console.warn('⚠️ Error al crear dropdown:', e);
            }
        });
    } else {
        console.warn('⚠️ Bootstrap no disponible, reintentando...');
        setTimeout(inicializarDropdowns, 500);
    }
}

// INICIALIZAR INTERACCIONES
function inicializarInteracciones() {
    const hamburger = document.getElementById("hamburgerBtn");
    const navMenu = document.getElementById("navMenu");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            navMenu.classList.toggle("open");
            hamburger.innerHTML = navMenu.classList.contains("open")
                ? '<i class="bi bi-x"></i>'
                : '<i class="bi bi-list"></i>';
        });

        document.querySelectorAll(".menu-link").forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("open");
                hamburger.innerHTML = '<i class="bi bi-list"></i>';
            });
        });
    }

    const navbar = document.querySelector(".navbar-kumo");
    if (navbar) {
        window.addEventListener("scroll", () => {
            navbar.classList.toggle("scrolled", window.scrollY > 50);
        });
    }

    manejarBusqueda();
    marcarEnlaceActivo();

    // CARRITO - Offcanvas con verificación de login
    const carritoBtn = document.querySelector('.btn-cart-offcanvas');
    if (carritoBtn) {
        // NO eliminar data-bs-toggle ni data-bs-target
        // El offcanvas se abre normalmente con Bootstrap

        // Agregar verificación de login ANTES de abrir el offcanvas
        carritoBtn.addEventListener('click', function (e) {
            // Si NO está logueado, prevenir la apertura del offcanvas
            if (!estaLogueado()) {
                e.preventDefault();      // Evita que se abra el offcanvas
                e.stopPropagation();     // Evita que el evento se propague
                // Redirigir al login
                window.location.href = '../inicio/index.html';
            }
            // Si está logueado, el offcanvas se abre normalmente
        });
        console.log('✅ Offcanvas del carrito configurado (solo para logueados)');
    }
    setTimeout(inicializarDropdowns, 200);
}

// FUNCIONES AUXILIARES
function marcarEnlaceActivo() {
    const path = window.location.pathname;
    const enlaces = document.querySelectorAll('.menu-link');

    enlaces.forEach(enlace => {
        const href = enlace.getAttribute('href');
        if (href && path.includes(href.replace('../', '').replace('.html', ''))) {
            enlace.classList.add('active');
        } else {
            enlace.classList.remove('active');
        }
    });
}


function manejarBusqueda() {
    console.log("🔍 Inicializando buscador con sugerencias...");

    const input = document.getElementById("searchInputNav");
    const icon = document.getElementById("searchIcon");

    if (!input) {
        console.warn("⚠️ No se encontró #searchInputNav, reintentando...");
        setTimeout(manejarBusqueda, 500);
        return;
    }

    console.log("✅ Input encontrado:", input);

    // CREAR CONTENEDOR DE SUGERENCIAS
    let sugerenciasContainer = document.getElementById("sugerenciasContainer");
    if (!sugerenciasContainer) {
        sugerenciasContainer = document.createElement("div");
        sugerenciasContainer.id = "sugerenciasContainer";
        sugerenciasContainer.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
            max-height: 350px;
            overflow-y: auto;
            z-index: 9999;
            display: none;
            margin-top: 4px;
            border: 1px solid rgba(0,0,0,0.05);
        `;
        input.parentNode.style.position = 'relative';
        input.parentNode.appendChild(sugerenciasContainer);
        console.log("✅ Contenedor de sugerencias CREADO:", sugerenciasContainer);
    } else {
        console.log("✅ Contenedor de sugerencias ya existe");
    }

    // FUNCIÓN PARA BUSCAR PRODUCTOS
    function buscarProductos(termino) {
        console.log(`🔎 Buscando productos que contengan: "${termino}"`);

        let productos = [];

        // Buscar en listaServicios (admin)
        const listaServicios = JSON.parse(localStorage.getItem("listaServicios")) || [];
        console.log(`📦 listaServicios: ${listaServicios.length} productos`);

        // Buscar en kumo_productos (catálogo)
        const kumoProductos = JSON.parse(localStorage.getItem("kumo_productos")) || [];
        console.log(`📦 kumo_productos: ${kumoProductos.length} productos`);

        // Buscar en carrito (por si hay productos)
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        console.log(`📦 carrito: ${carrito.length} productos`);

        // Unificar todos los productos
        const todosLosProductos = [...listaServicios, ...kumoProductos, ...carrito];

        // Eliminar duplicados por id
        const idsUnicos = new Set();
        const productosUnicos = todosLosProductos.filter(producto => {
            if (!producto.id) return false;
            if (idsUnicos.has(producto.id)) {
                return false;
            }
            idsUnicos.add(producto.id);
            return true;
        });

        console.log(`📦 ${productosUnicos.length} productos únicos disponibles`);

        if (productosUnicos.length === 0) {
            console.warn('⚠️ No hay productos en localStorage');
            console.log('💡 Agrega productos desde el panel de administración');
            return [];
        }

        if (!termino || termino.length < 1) {
            console.log('❌ Término vacío');
            return [];
        }

        const terminoLower = termino.toLowerCase();

        // Filtrar productos
        const resultados = productosUnicos.filter(producto => {
            const nombre = (producto.nombre || '').toLowerCase();
            const descripcion = (producto.descripcion || '').toLowerCase();
            return nombre.includes(terminoLower) || descripcion.includes(terminoLower);
        });

        console.log(`✅ ${resultados.length} productos encontrados para "${termino}"`);

        // Mostrar los nombres de los resultados
        resultados.forEach(p => {
            console.log(`   - ${p.nombre}`);
        });

        return resultados;
    }

    // FUNCIÓN PARA MOSTRAR SUGERENCIAS (MEJORADA)
    function mostrarSugerencias(resultados, termino) {
        console.log('📋 Mostrando sugerencias...');
        console.log('📋 Resultados:', resultados);

        if (!sugerenciasContainer) {
            console.warn('⚠️ No hay contenedor de sugerencias');
            return;
        }

        if (resultados.length === 0 || !termino || termino.length < 1) {
            console.log('❌ No hay resultados o término vacío, ocultando sugerencias');
            sugerenciasContainer.style.display = 'none';
            return;
        }

        const resultadosMostrar = resultados.slice(0, 6);
        console.log(`📋 Mostrando ${resultadosMostrar.length} sugerencias`);

        sugerenciasContainer.innerHTML = `
        <div style="padding: 8px 12px; background: #f8f9fa; border-bottom: 1px solid #eee; font-size: 0.75rem; color: #888; font-weight: 600; display: flex; justify-content: space-between;">
            <span>🔍 ${resultados.length} resultado${resultados.length > 1 ? 's' : ''}</span>
            <span style="cursor: pointer; color: #FD0C7D;" onclick="document.getElementById('sugerenciasContainer').style.display='none';">✕</span>
        </div>
        ${resultadosMostrar.map(producto => {
            const imagenUrl = producto.imagen || '../assets/img/logo.png';
            return `
            <div class="sugerencia-item" 
                 style="
                    padding: 10px 14px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border-bottom: 1px solid #f0f0f0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                " 
                 onmouseover="this.style.background='#f5f0ff'" 
                 onmouseout="this.style.background='transparent'"
                 onclick="window.location.href='../catalogo/catalogo.html?buscar=${encodeURIComponent(producto.nombre)}'">
                
                <img src="${imagenUrl}" 
                     alt="${producto.nombre}" 
                     style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px; background: #f0f0f0; border: 1px solid #eee;"
                     onerror="this.src='../assets/img/logo.png'">
                
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; color: #282121; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${producto.nombre}
                    </div>
                    <div style="font-size: 0.75rem; color: #888; display: flex; gap: 12px; align-items: center;">
                        <span>${producto.categoria || 'Producto'}</span>
                        <span style="color: #8316ED; font-weight: 700;">${formatearPrecioSugerencia(producto.precio)}</span>
                    </div>
                </div>
                <div style="color: #8316ED; font-size: 0.8rem;">
                    <i class="bi bi-arrow-right"></i>
                </div>
            </div>
        `}).join('')}
        
        ${resultados.length > 6 ? `
            <div style="padding: 10px 14px; text-align: center; background: #f8f9fa; border-radius: 0 0 12px 12px;">
                <a href="../catalogo/catalogo.html?buscar=${encodeURIComponent(termino)}" 
                   style="color: #8316ED; text-decoration: none; font-weight: 600; font-size: 0.85rem;">
                    Ver todos los ${resultados.length} resultados →
                </a>
            </div>
        ` : ''}
    `;

        sugerenciasContainer.style.display = 'block';
        console.log('✅ Sugerencias mostradas correctamente');
    }

    // FORMATEAR PRECIO PARA SUGERENCIAS
    function formatearPrecioSugerencia(precio) {
        if (!precio) return '$0';
        return Number(precio).toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        });
    }

    // FUNCIÓN PARA EJECUTAR BÚSQUEDA
    function ejecutarBusqueda() {
        const termino = input.value.trim();
        const path = window.location.pathname;
        let rutaCatalogo = '../catalogo/catalogo.html';
        if (path.includes('/administrador/')) {
            rutaCatalogo = '../../catalogo/catalogo.html';
        }

        console.log(`🔍 Ejecutando búsqueda: "${termino}"`);

        if (sugerenciasContainer) {
            sugerenciasContainer.style.display = 'none';
        }

        if (termino === "") {
            window.location.href = rutaCatalogo;
        } else {
            window.location.href = `${rutaCatalogo}?buscar=${encodeURIComponent(termino)}`;
        }
    }

    // EVENTO: mientras escribe (input)
    input.addEventListener("input", function () {
        const termino = this.value.trim();
        console.log(`✏️ Input event: "${termino}"`);

        if (termino.length < 1) {
            console.log("❌ Término vacío, ocultando sugerencias");
            if (sugerenciasContainer) {
                sugerenciasContainer.style.display = 'none';
            }
            return;
        }

        console.log(`🔎 Buscando productos para: "${termino}"`);
        const resultados = buscarProductos(termino);
        console.log(`✅ ${resultados.length} productos encontrados`);

        mostrarSugerencias(resultados, termino);
    });

    // EVENTO: tecla Enter
    input.addEventListener("keydown", function (e) {
        console.log(`⌨️ keydown: "${e.key}"`);
        if (e.key === "Enter") {
            console.log("✅ Enter presionado, ejecutando búsqueda...");
            e.preventDefault();
            ejecutarBusqueda();
        }
    });

    // EVENTO: clic en icono de búsqueda
    if (icon) {
        console.log("✅ Icono de búsqueda encontrado");
        icon.addEventListener("click", function (e) {
            console.log("🖱️ Clic en icono de búsqueda");
            e.preventDefault();
            ejecutarBusqueda();
        });
    }

    // CERRAR SUGERENCIAS AL HACER CLIC FUERA
    document.addEventListener("click", function (e) {
        if (!e.target.closest('.search-wrapper') && sugerenciasContainer) {
            console.log("👆 Clic fuera, ocultando sugerencias");
            sugerenciasContainer.style.display = 'none';
        }
    });

    // PREVENIR ENVÍO DE FORMULARIO
    const form = input.closest('form');
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            console.log("🚫 Submit prevenido");
            ejecutarBusqueda();
        });
    }

    console.log("✅ Buscador con sugerencias configurado");
}

//ESCUCHAR CAMBIOS EN LOCALSTORAGE
window.addEventListener('storage', function (e) {
    if (e.key === 'carrito') {
        console.log('🔄 Carrito actualizado desde otra pestaña');
        actualizarBadgeCarrito();
    }
    if (e.key === 'usuarioActivo' || e.key === 'kumo_usuario') {
        console.log('🔄 Usuario actualizado desde otra pestaña');
        window.location.reload();
    }
});

// ACTUALIZAR BADGE CADA 1 SEGUNDO
setInterval(actualizarBadgeCarrito, 1000);

// INICIALIZAR
console.log('🚀 Inicializando navbar...');

window.cerrarSesion = cerrarSesion;

document.addEventListener('DOMContentLoaded', function () {
    cargarNavbar();
});