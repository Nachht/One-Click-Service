// ============================================
// CATÁLOGO - CONEXIÓN CON EL BACKEND (MEJORADO)
// ============================================

const CLAVE_PRODUCTOS_KUMO = "kumo_productos_cache";
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutos

// ============================================
// 🔥 VARIABLES (RESTAURADAS)
// ============================================
const inputBuscadorCatalogo = document.getElementById("buscadorCatalogo");
const btnLimpiarBusquedaCatalogo = document.getElementById("btnLimpiarBusquedaCatalogo");
const contadorCatalogoTotal = document.getElementById("contadorCatalogoTotal");
const contadorCatalogoVisibles = document.getElementById("contadorCatalogoVisibles");
let productosCatalogo = [];
let textoBusquedaCatalogo = "";

// ============================================
// CATEGORÍAS
// ============================================
const nombresCategoria = {
    manga: "Manga",
    figura: "Figura",
    merch: "Merch"
};

const contenedoresPorCategoria = {
    manga: document.getElementById("productosCategoriaManga"),
    figura: document.getElementById("productosCategoriaFigura"),
    merch: document.getElementById("productosCategoriaMerch")
};

const contadoresPorCategoria = {
    manga: document.getElementById("contadorSeccionManga"),
    figura: document.getElementById("contadorSeccionFigura"),
    merch: document.getElementById("contadorSeccionMerch")
};


// ============================================
// 🔥 OBTENER URL CORRECTA DE LA IMAGEN
// ============================================
function obtenerUrlImagenCatalogo(imagen) {
    // Si no hay imagen, usar la de respaldo
    if (!imagen) {
        return '../assets/img/logo.png';
    }
    
    // Si es Base64 (empieza con data:image) - imágenes creadas desde admin
    if (imagen.startsWith('data:image')) {
        return imagen;
    }
    
    // Si es logo.png o logo.png (imágenes por defecto)
    if (imagen === 'logo.png' || imagen === 'logo.png') {
        return '../assets/img/logo.png';
    }
    
    // Si ya es una URL completa (http o https)
    if (imagen.startsWith('http://') || imagen.startsWith('https://')) {
        return imagen;
    }
    
    // Si es una ruta relativa (../../ o ./)
    if (imagen.startsWith('../../') || imagen.startsWith('./') || imagen.startsWith('../')) {
        return imagen;
    }
    
    // Si es un nombre de archivo (subido al servidor)
    // Excluir cualquier cosa que parezca una ruta
    if (!imagen.includes('/') && !imagen.includes('\\')) {
        return `http://localhost:8081/uploads/${imagen}`;
    }
    
    // Fallback: devolver la imagen como está
    return imagen;
}

// ============================================
// 1. OBTENER PRODUCTOS CON CACHÉ INTELIGENTE
// ============================================
async function obtenerProductosBackend(forceRefresh = false) {
    // 🔥 SI SE SOLICITA REFRESH, SALTAR CACHÉ
    if (forceRefresh) {
        console.log('🔄 Refresh forzado - ignorando caché');
        localStorage.removeItem(CLAVE_PRODUCTOS_KUMO);
        localStorage.removeItem(`${CLAVE_PRODUCTOS_KUMO}_time`);
    } else {
        // Verificar caché válida
        const cache = localStorage.getItem(CLAVE_PRODUCTOS_KUMO);
        const cacheTime = localStorage.getItem(`${CLAVE_PRODUCTOS_KUMO}_time`);
        
        if (cache && cacheTime) {
            const elapsed = Date.now() - parseInt(cacheTime);
            if (elapsed < CACHE_EXPIRATION) {
                console.log('📦 Usando caché de productos');
                return JSON.parse(cache);
            }
        }
    }

    try {
        console.log('🌐 Cargando productos desde el backend...');
        
        // 🔥 IMPORTANTE: NO ENVIAR TOKEN (es público)
        const response = await fetch(`${API_CONFIG.BASE_URL}/products/public`, {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
            // ⚠️ SIN Authorization: Bearer token (es público)
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const productos = await response.json();
        
        // Guardar en caché con timestamp
        localStorage.setItem(CLAVE_PRODUCTOS_KUMO, JSON.stringify(productos));
        localStorage.setItem(`${CLAVE_PRODUCTOS_KUMO}_time`, Date.now().toString());
        
        console.log('✅ Productos cargados desde el backend:', productos.length);
        return productos;

    } catch (error) {
        console.error('❌ Error al cargar productos del backend:', error);
        
        // Fallback: cargar desde caché aunque esté expirada
        const cached = localStorage.getItem(CLAVE_PRODUCTOS_KUMO);
        if (cached) {
            console.log('⚠️ Usando caché de respaldo (backend falló)');
            return JSON.parse(cached);
        }
        return [];
    }
}


// ============================================
// 2. BUSCAR PRODUCTOS (OPTIMIZADO)
// ============================================
async function buscarProductosBackend(termino) {
    if (!termino || termino.trim() === '') {
        // Si no hay término, cargar todos (usar caché primero)
        return await obtenerProductosBackend();
    }
    
    // 🔥 PRIMERO: Buscar en la caché local (más rápido)
    const cached = localStorage.getItem(CLAVE_PRODUCTOS_KUMO);
    if (cached) {
        const productos = JSON.parse(cached);
        const filtrados = productos.filter(p => 
            p.nombre.toLowerCase().includes(termino.toLowerCase()) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(termino.toLowerCase()))
        );
        
        if (filtrados.length > 0) {
            console.log('🔍 Productos encontrados en caché:', filtrados.length);
            return filtrados;
        }
    }
    
    // 🔥 SEGUNDO: Buscar en el backend si no hay en caché
    try {
        console.log('🌐 Buscando en el backend...');
        
        // 🔥 IMPORTANTE: NO ENVIAR TOKEN (es público)
        const response = await fetch(`${API_CONFIG.BASE_URL}/products/public/search?nombre=${encodeURIComponent(termino)}`, {
            headers: {
                'Content-Type': 'application/json'
            }
            // ⚠️ SIN Authorization: Bearer token (es público)
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const productos = await response.json();
        console.log('✅ Productos encontrados en backend:', productos.length);
        return productos;

    } catch (error) {
        console.error('❌ Error al buscar productos:', error);
        return [];
    }
}

// ============================================
// 3. TRANSFORMAR PRODUCTOS DEL BACKEND AL FORMATO DEL FRONTEND
// ============================================
function transformarProductoBackend(producto) {
    // Determinar la categoría
    let categoria = 'merch';
    if (producto.category) {
        const nombreCat = producto.category.nombre?.toLowerCase() || '';
        if (nombreCat.includes('manga')) categoria = 'manga';
        else if (nombreCat.includes('figura')) categoria = 'figura';
        else if (nombreCat.includes('merch')) categoria = 'merch';
    }

    return {
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: producto.precio,
        stock: producto.stock || 0,
        // 🔥 USAR LA NUEVA FUNCIÓN PARA LA IMAGEN
        imagen: obtenerUrlImagenCatalogo(producto.imagen),
        categoria: categoria,
        activo: producto.activo !== false
    };
}

// ============================================
// 4. CARGAR PRODUCTOS EN EL CATÁLOGO
// ============================================
async function cargarProductosCatalogo(forceRefresh = false) {
    try {
        const productosBackend = await obtenerProductosBackend(forceRefresh);
        productosCatalogo = productosBackend.map(transformarProductoBackend);
        console.log('✅ Productos cargados:', productosCatalogo.length);
        return productosCatalogo;
    } catch (error) {
        console.error('❌ Error al cargar productos:', error);
        productosCatalogo = [];
        return [];
    }
}

// ============================================
// 5. FORMATEAR PRECIO
// ============================================
function formatearPrecio(precio) {
    return Number(precio).toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0
    });
}

// ============================================
// 6. CREAR TARJETA DE PRODUCTO
// ============================================
function crearTarjetaProductoCatalogo(producto) {
    const columna = document.createElement("div");
    columna.className = "col-lg-3 col-md-4 col-sm-6";
    const nombreCategoria = nombresCategoria[producto.categoria] || producto.categoria;
    
    const imagenSrc = producto.imagen || '../assets/img/logo.png';
    const tieneStock = producto.stock > 0;
    const estadoTexto = tieneStock ? `Stock: ${producto.stock}` : "Agotado";
    const estadoClase = tieneStock ? "" : "agotado";
    const botonDisabled = tieneStock ? "" : "disabled";
    const botonClase = tieneStock ? "botonAgregarCarrito" : "botonAgregarCarrito deshabilitado";
    
    columna.innerHTML = `
        <div class="tarjetaProductoCatalogo ${estadoClase}">
            <div class="contenedorImagenCatalogo">
                <img src="${imagenSrc}" 
                     alt="${producto.nombre}"
                     loading="lazy"
                     onerror="this.src='../assets/img/logo.png'">
                <span class="etiquetaCategoriaCatalogo categoria-${producto.categoria}">
                    ${nombreCategoria}
                </span>
                ${!tieneStock ? `
                    <span class="etiquetaAgotado">
                        <i class="bi bi-x-circle"></i> AGOTADO
                    </span>
                ` : ''}
            </div>
            <div class="contenidoTarjetaCatalogo">
                <h3 class="tituloProductoCatalogo">${producto.nombre}</h3>
                <p class="descripcionProductoCatalogo">${producto.descripcion || 'Sin descripción'}</p>
                <div class="datoStockCatalogo">
                    <i class="bi bi-box-seam"></i>
                    <span class="${tieneStock ? 'text-success' : 'text-danger'}">
                        ${estadoTexto}
                    </span>
                </div>
                <div class="pieTarjetaCatalogo">
                    <span class="precioProductoCatalogo">${formatearPrecio(producto.precio)}</span>
                    <button
                        class="${botonClase}"
                        title="${tieneStock ? "Agregar al carrito" : "Sin stock disponible"}"
                        ${botonDisabled}
                        data-id="${producto.id}"
                        data-nombre="${producto.nombre}"
                        data-descripcion="${producto.descripcion || ''}"
                        data-precio="${producto.precio}"
                        data-imagen="${imagenSrc}">
                        <i class="bi bi-cart-plus-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    return columna;
}

// ============================================
// 7. RENDERIZAR CATÁLOGO
// ============================================
function renderizarCatalogo() {
    // 🔥 FILTRAR PRODUCTOS: activos Y con stock > 0
    const productosActivos = productosCatalogo.filter(producto => {
        const texto = textoBusquedaCatalogo.toLowerCase();
        const coincideBusqueda =
            producto.nombre.toLowerCase().includes(texto) ||
            producto.descripcion.toLowerCase().includes(texto);
        
        // Solo mostrar productos activos con stock disponible
        return producto.activo && coincideBusqueda && producto.stock > 0;
    });

    // 🔥 ACTUALIZAR CONTADORES
    const totalDisponibles = productosCatalogo.filter(p => p.activo && p.stock > 0).length;
    contadorCatalogoTotal.textContent = totalDisponibles;
    contadorCatalogoVisibles.textContent = productosActivos.length;

    // 🔥 RECORRER CADA CATEGORÍA
    Object.keys(contenedoresPorCategoria).forEach(categoria => {
        const contenedor = contenedoresPorCategoria[categoria];
        const contadorTexto = contadoresPorCategoria[categoria];

        if (!contenedor) return;
        contenedor.innerHTML = "";
        
        const productosCategoria = productosActivos.filter(
            producto => producto.categoria === categoria
        );

        // 🔥 ACTUALIZAR CONTADOR DE CATEGORÍA
        if (contadorTexto) {
            contadorTexto.textContent =
                `${productosCategoria.length} ${productosCategoria.length === 1 ? "producto disponible" : "productos disponibles"}`;
        }

        // 🔥 SI NO HAY PRODUCTOS EN LA CATEGORÍA
        if (productosCategoria.length === 0) {
            // Verificar si hay productos inactivos o sin stock en esta categoría
            const hayProductosInactivos = productosCatalogo.some(p => 
                p.categoria === categoria && (!p.activo || p.stock === 0)
            );
            
            if (hayProductosInactivos) {
                contenedor.innerHTML = `<p class="mensajeVacioSeccion">No hay productos disponibles en esta categoría. <br><small>Los productos están agotados o inactivos.</small></p>`;
            } else {
                contenedor.innerHTML = `<p class="mensajeVacioSeccion">No hay productos en esta categoría por ahora.</p>`;
            }
            return;
        }

        // 🔥 RENDERIZAR PRODUCTOS DE LA CATEGORÍA
        productosCategoria.forEach(producto => {
            contenedor.appendChild(crearTarjetaProductoCatalogo(producto));
        });
    });

    // 🔥 EVENTOS DE LOS BOTONES "AGREGAR AL CARRITO"
    document.querySelectorAll(".botonAgregarCarrito").forEach(boton => {
        // Eliminar eventos anteriores para evitar duplicados
        boton.removeEventListener("click", handleAgregarCarrito);
        boton.addEventListener("click", handleAgregarCarrito);
    });
}


// ============================================
// MANEJADOR DE CLICK PARA AGREGAR AL CARRITO
// ============================================
function handleAgregarCarrito(event) {
    const boton = event.currentTarget;
    const producto = {
        id: boton.dataset.id,
        nombre: boton.dataset.nombre,
        descripcion: boton.dataset.descripcion,
        precio: parseFloat(boton.dataset.precio),
        imagen: boton.dataset.imagen,
        cantidad: 1
    };
    agregarAlCarrito(producto);
}

// ============================================
// 8. AGREGAR AL CARRITO (LOCALSTORAGE)
// ============================================
// function agregarAlCarrito(producto) {
//     let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
//     const existente = carrito.find(item => item.id === producto.id);
//     if (existente) {
//         existente.cantidad += 1;
//     } else {
//         carrito.push(producto);
//     }

//     localStorage.setItem("carrito", JSON.stringify(carrito));
//     actualizarBadgeCarrito();
//     mostrarModalCarrito(producto.nombre);
    
//     document.dispatchEvent(new CustomEvent('carritoActualizado'));
// }

// ============================================
// 8. AGREGAR AL CARRITO (BACKEND)
// ============================================
async function agregarAlCarrito(producto) {
    const token = localStorage.getItem('token');
    if (!token) {
        mostrarModalKumo({
            icono: "bi-box-arrow-in-right",
            tipoIcono: "",
            titulo: "Inicia sesión",
            mensajeHTML: "Debes iniciar sesión para agregar productos al carrito.<br><br>¿Ya tienes una cuenta?",
            botones: [
                { 
                    texto: "Iniciar sesión", 
                    clase: "modal-kumo-btn-confirmar",
                    accion: () => {
                        window.location.href = '../inicio_sesion/inicio_sesion.html';
                    }
                },
                { 
                    texto: "Registrarse", 
                    clase: "modal-kumo-btn-ok",
                    accion: () => {
                        window.location.href = '../registro/registro.html';
                    }
                }
            ]
        });
        return;
    }

    try {
        console.log('🛒 Agregando al carrito:', producto);

        // 1. Agregar al backend usando el servicio
        const result = await agregarAlCarritoBackend(producto.id, 1);
        
        if (!result.success) {
            throw new Error(result.error);
        }

        console.log('✅ Producto agregado exitosamente');

        // 2. Sincronizar carrito local con backend
        await sincronizarCarritoLocalConBackend();

        // 3. Actualizar badge
        actualizarBadgeCarrito();

        // 4. Mostrar modal de confirmación
        mostrarModalCarrito(producto.nombre);

        // 5. 🔥 DISPARAR EVENTO PARA ACTUALIZAR EL CARRITO EN TIEMPO REAL
        document.dispatchEvent(new CustomEvent('carritoActualizado'));

        console.log('✅ Evento carritoActualizado disparado');

    } catch (error) {
        console.error('❌ Error al agregar al carrito:', error);
        alert('Error al agregar producto al carrito: ' + error.message);
    }
}

// ============================================
// 9. MODAL DE CONFIRMACIÓN
// ============================================
function mostrarModalCarrito(nombreProducto) {
    const modalExistente = document.getElementById("modalCarritoKumo");
    if (modalExistente) modalExistente.remove();

    const modal = document.createElement("div");
    modal.id = "modalCarritoKumo";
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 12, 24, 0.72);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
        animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="
            background: #ffffff;
            border-radius: 22px;
            padding: 32px 30px 28px;
            max-width: 420px;
            width: 100%;
            text-align: center;
            box-shadow: 
                0 20px 45px rgba(131, 1, 148, 0.69),
                0 0 35px rgba(255, 0, 127, 0.20);
            border: 1px solid rgba(255, 0, 127, 0.18);
            animation: slideUp 0.3s ease;
        ">
            <div style="
                width: 64px;
                height: 64px;
                margin: 0 auto 18px;
                border-radius: 50%;
                background: linear-gradient(135deg, #8A2BE2 0%, #FF007F 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 29px;
                box-shadow: 0 8px 22px rgba(255, 0, 127, 0.30);
            ">
                <i class="bi bi-bag-check-fill"></i>
            </div>
            <h3 style="
                color: #1E1B4B;
                font-size: 1.45rem;
                font-weight: 800;
                margin: 0 0 10px;
                letter-spacing: 0.2px;
            ">
                ¡Agregado al carrito!
            </h3>
            <p style="
                color: #4B5563;
                font-size: 0.98rem;
                line-height: 1.5;
                margin: 0 auto 26px;
            ">
                <strong style="color: #1E1B4B;">"${nombreProducto}"</strong>
                se agregó correctamente.
            </p>
            <div style="
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
                justify-content: center;
                width: 100%;
            ">
                <button onclick="cerrarModalCarrito()" style="
                    flex: 1;
                    min-width: 145px;
                    background: #ffffff;
                    border: 1px solid #D1D5DB;
                    padding: 12px 20px;
                    border-radius: 25px;
                    font-weight: 800;
                    font-size: 0.9rem;
                    color: #1E1B4B;
                    cursor: pointer;
                    transition: all 0.25s ease;
                "
                onmouseover="
                    this.style.background='#F3F4F6';
                    this.style.borderColor='#A855F7';
                "
                onmouseout="
                    this.style.background='#FFFFFF';
                    this.style.borderColor='#D1D5DB';
                ">
                    Seguir comprando
                </button>
                <a href="../carrito/carrito.html" style="
                    flex: 1;
                    min-width: 145px;
                    background: linear-gradient(135deg, #8A2BE2 0%, #FF007F 100%);
                    border: none;
                    padding: 12px 20px;
                    border-radius: 25px;
                    font-weight: 800;
                    font-size: 0.9rem;
                    color: #FFFFFF;
                    cursor: pointer;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    box-shadow: 0 8px 20px rgba(255, 0, 127, 0.25);
                    transition: all 0.25s ease;
                "
                onmouseover="
                    this.style.transform='translateY(-2px)';
                    this.style.boxShadow='0 11px 25px rgba(255, 0, 127, 0.35)';
                "
                onmouseout="
                    this.style.transform='translateY(0)';
                    this.style.boxShadow='0 8px 20px rgba(255, 0, 127, 0.25)';
                ">
                    Ir al carrito
                    <i class="bi bi-cart3"></i>
                </a>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener("click", (e) => {
        if (e.target === modal) cerrarModalCarrito();
    });
}

function cerrarModalCarrito() {
    const modal = document.getElementById("modalCarritoKumo");
    if (modal) modal.remove();
}

// ============================================
// 10. ACTUALIZAR BADGE DEL CARRITO
// ============================================
function actualizarBadgeCarrito() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const totalItems = carrito.reduce((suma, item) => suma + item.cantidad, 0);
    const badge = document.getElementById("badge");
    if (badge) badge.textContent = totalItems;
    const cantidadServicios = document.getElementById("cantidadServicios");
    if (cantidadServicios) cantidadServicios.textContent = totalItems;
}

// ============================================
// 11. MOSTRAR/OCULTAR BOTÓN DE LIMPIAR
// ============================================
function actualizarBotonLimpiarBusqueda() {
    if (!btnLimpiarBusquedaCatalogo) return;
    btnLimpiarBusquedaCatalogo.classList.toggle("visible", inputBuscadorCatalogo.value.trim().length > 0);
}

// ============================================
// 12. ESTILOS DEL MODAL
// ============================================
const estilosModalCatalogo = document.createElement("style");
estilosModalCatalogo.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`;
document.head.appendChild(estilosModalCatalogo);

// ============================================
// 13. EVENTO DE BÚSQUEDA (MEJORADO)
// ============================================
inputBuscadorCatalogo.addEventListener("input", async function () {
    const termino = this.value.trim();
    textoBusquedaCatalogo = termino;
    actualizarBotonLimpiarBusqueda();
    
    clearTimeout(window.busquedaTimeout);
    window.busquedaTimeout = setTimeout(async () => {
        if (termino.length >= 2 || termino.length === 0) {
            const productosBackend = await buscarProductosBackend(termino);
            // 🔥 TRANSFORMAR Y FILTRAR PRODUCTOS
            productosCatalogo = productosBackend
                .map(transformarProductoBackend)
                .filter(p => p.activo && p.stock > 0); // 🔥 SOLO PRODUCTOS DISPONIBLES
            renderizarCatalogo();
        }
    }, 300);
});

// ============================================
// 14. LIMPIAR BÚSQUEDA
// ============================================
if (btnLimpiarBusquedaCatalogo) {
    btnLimpiarBusquedaCatalogo.addEventListener("click", async () => {
        inputBuscadorCatalogo.value = "";
        textoBusquedaCatalogo = "";
        actualizarBotonLimpiarBusqueda();
        
        await cargarProductosCatalogo();
        renderizarCatalogo();
        inputBuscadorCatalogo.focus();
    });
}

// ============================================
// 15. INICIALIZACIÓN
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
    console.log('🚀 Cargando catálogo...');
    
    await cargarProductosCatalogo();
    
    const parametrosUrl = new URLSearchParams(window.location.search);
    const terminoBusqueda = parametrosUrl.get("buscar");

    if (terminoBusqueda) {
        textoBusquedaCatalogo = terminoBusqueda;
        if (inputBuscadorCatalogo) inputBuscadorCatalogo.value = terminoBusqueda;
    }

    actualizarBotonLimpiarBusqueda();
    renderizarCatalogo();
    actualizarBadgeCarrito();
    
    console.log('✅ Catálogo cargado con', productosCatalogo.length, 'productos');
});



// ============================================
// 16. SINCRONIZACIÓN CON LOCALSTORAGE
// ============================================
window.addEventListener("storage", (evento) => {
    if (evento.key === CLAVE_PRODUCTOS_KUMO) {
        cargarProductosCatalogo();
        renderizarCatalogo();
    }
});

document.addEventListener("productosKumoActualizados", () => {
    cargarProductosCatalogo();
    renderizarCatalogo();
});

// ============================================
// 17. FORZAR REFRESH DEL CATÁLOGO
// ============================================
async function forzarRefreshCatalogo() {
    console.log('🔄 Forzando refresh del catálogo...');
    // Limpiar caché
    localStorage.removeItem(CLAVE_PRODUCTOS_KUMO);
    localStorage.removeItem(`${CLAVE_PRODUCTOS_KUMO}_time`);
    // Recargar productos desde el backend
    await cargarProductosCatalogo(true);
    renderizarCatalogo();
    console.log('✅ Catálogo refrescado correctamente');
}

// ============================================
// 18. FORZAR RECARGA DE PRODUCTOS (ALIAS)
// ============================================
function forzarRecargaProductos() {
    forzarRefreshCatalogo();
}

// ============================================
// 19. ESCUCHAR EVENTO DE PRODUCTOS ACTUALIZADOS (ÚNICO)
// ============================================
document.addEventListener('productosActualizados', async function() {
    console.log('🔄🔴 EVENTO RECIBIDO EN CATÁLOGO: productosActualizados');
    await forzarRefreshCatalogo();
});

// ============================================
// 20. EXPORTAR FUNCIONES GLOBALES
// ============================================
window.forzarRefreshCatalogo = forzarRefreshCatalogo;
window.forzarRecargaProductos = forzarRecargaProductos;
window.cargarProductosCatalogo = cargarProductosCatalogo;
window.renderizarCatalogo = renderizarCatalogo;

console.log('✅ catalogo.js cargado correctamente');