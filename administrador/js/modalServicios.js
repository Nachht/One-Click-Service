// ============================================
// ADMIN - GESTIÓN DE PRODUCTOS CON BACKEND
// ============================================

const API_URL = 'http://localhost:8081';
const CLAVE_PRODUCTOS_KUMO = "kumo_productos_cache";

// ============================================
// FUNCIONES DE CONVERSIÓN DE CATEGORÍAS
// ============================================

// Convierte categoría del backend (Mangas) al frontend (manga)
function categoriaBackendToFrontend(categoria) {
    const mapa = {
        'Mangas': 'manga',
        'Figuras': 'figura',
        'Merchandising': 'merch'
    };
    return mapa[categoria] || 'merch';
}

// Convierte categoría del frontend (manga) al backend (Mangas)
function categoriaFrontendToBackend(categoria) {
    const mapa = {
        'manga': 'Mangas',
        'figura': 'Figuras',
        'merch': 'Merchandising'
    };
    return mapa[categoria] || categoria;
}

// Obtiene el nombre mostrado para la categoría
function obtenerNombreCategoria(categoria) {
    const mapa = {
        'Mangas': 'Mangas',
        'Figuras': 'Figuras',
        'Merchandising': 'Merchandising',
        'manga': 'Mangas',
        'figura': 'Figuras',
        'merch': 'Merchandising'
    };
    return mapa[categoria] || categoria;
}

// Obtiene el ícono para la categoría
function obtenerIconoCategoria(categoria) {
    switch (categoria) {
        case 'Mangas':
        case 'manga':
            return "bi bi-book";
        case 'Figuras':
        case 'figura':
            return "bi bi-person-standing";
        case 'Merchandising':
        case 'merch':
            return "bi bi-bag";
        default:
            return "bi bi-box";
    }
}

function guardarProductosEnLocalStorage() {
    try {
        localStorage.setItem(CLAVE_PRODUCTOS_KUMO, JSON.stringify(productos));
        console.log('✅ Productos guardados en localStorage');
        return true;
    } catch (error) {
        console.error('❌ Error al guardar en localStorage:', error);
        return false;
    }
}

function cargarProductosDesdeLocalStorage() {
    try {
        const data = localStorage.getItem(CLAVE_PRODUCTOS_KUMO);
        if (data) {
            const productosGuardados = JSON.parse(data);
            if (productosGuardados && productosGuardados.length > 0) {
                console.log('📦 Productos cargados desde localStorage:', productosGuardados.length);
                return productosGuardados;
            }
        }
        return null;
    } catch (error) {
        console.error('❌ Error al cargar desde localStorage:', error);
        return null;
    }
}



// ============================================
// VERIFICAR ROL DE ADMIN
// ============================================
function verificarRolAdmin() {
    const usuario = obtenerUsuarioLogueado();
    if (!usuario) {
        window.location.href = '../../inicio_sesion/inicio_sesion.html';
        return false;
    }
    
    const rol = usuario.rol || '';
    if (rol.toLowerCase() !== 'admin') {
        alert('⚠️ Acceso denegado. Esta sección es solo para administradores.');
        window.location.href = '../../inicio/index.html';
        return false;
    }
    
    console.log('✅ Usuario ADMIN verificado:', usuario.nombre);
    return true;
}

// ============================================
// OBTENER PRODUCTOS DEL BACKEND
// ============================================
async function obtenerProductosBackend() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No autenticado');
        }

        const response = await fetch(`${API_URL}/api/products/public`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener productos');
        }

        const data = await response.json();
        console.log('✅ Productos obtenidos del backend:', data);
        return data;
    } catch (error) {
        console.error('❌ Error al obtener productos:', error);
        return [];
    }
}

// ============================================
// CREAR PRODUCTO EN EL BACKEND
// ============================================
async function crearProductoBackend(producto) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No autenticado');
        }

        const response = await fetch(`${API_URL}/api/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(producto)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Error al crear producto');
        }

        const data = await response.json();
        console.log('✅ Producto creado:', data);
        return data;
    } catch (error) {
        console.error('❌ Error al crear producto:', error);
        throw error;
    }
}

// ============================================
// ACTUALIZAR PRODUCTO EN EL BACKEND
// ============================================
async function actualizarProductoBackend(id, producto) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No autenticado');
        }

        // Asegurar que el objeto tenga todos los campos necesarios
        const productoParaEnviar = {
            nombre: producto.nombre,
            descripcion: producto.descripcion || 'Sin descripción',
            categoria: producto.categoria,
            precio: Number(producto.precio),
            stock: Number(producto.stock),
            imagen: producto.imagen || 'logo.png',
            activo: producto.activo // ⚠️ Asegurar que este campo esté incluido
        };

        console.log('📤 Enviando actualización al backend:', productoParaEnviar);

        const response = await fetch(`${API_URL}/api/products/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productoParaEnviar)
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('❌ Error response:', error);
            throw new Error(error || 'Error al actualizar producto');
        }

        const data = await response.json();
        console.log('✅ Producto actualizado en backend:', data);
        return data;
    } catch (error) {
        console.error('❌ Error al actualizar producto:', error);
        throw error;
    }
}


async function cambiarEstadoBackend(id, activo) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No autenticado');
        }

        console.log(`📤 Enviando PATCH a /api/products/${id}/estado con activo: ${activo}`);

        const response = await fetch(`${API_URL}/api/products/${id}/estado`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ activo: activo })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('❌ Error response:', error);
            throw new Error(error || 'Error al cambiar estado');
        }

        const data = await response.json();
        console.log('✅ Estado actualizado en backend:', data);
        return data;
    } catch (error) {
        console.error('❌ Error al cambiar estado en backend:', error);
        throw error;
    }
}

// ============================================
// ELIMINAR PRODUCTO EN EL BACKEND
// ============================================
async function eliminarProductoBackend(id) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No autenticado');
        }

        const response = await fetch(`${API_URL}/api/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Error al eliminar producto');
        }

        console.log('✅ Producto eliminado');
        return true;
    } catch (error) {
        console.error('❌ Error al eliminar producto:', error);
        throw error;
    }
}

// ============================================
// CARGA INICIAL
// ============================================
let productos = [];

async function cargarProductos() {
    if (!verificarRolAdmin()) return;

    // 1. Intentar cargar desde localStorage primero
    const productosLocal = cargarProductosDesdeLocalStorage();
    
    if (productosLocal) {
        productos = productosLocal;
        renderizarProductos();
        actualizarContadores();
        console.log('📦 Usando datos de localStorage');
        
        // 2. Actualizar en segundo plano desde el backend
        actualizarDesdeBackendEnSegundoPlano();
        return;
    }

    // 3. Si no hay datos en localStorage, cargar desde el backend
    try {
        console.log('🔄 Cargando productos desde el backend...');
        const productosBackend = await obtenerProductosBackend();
        
        productos = productosBackend.map(p => {
            let categoriaBackend = p.categoria || p.category?.nombre || '';
            const categoriaFrontend = categoriaBackendToFrontend(categoriaBackend);
            
            return {
                ...p,
                categoria: categoriaFrontend,
                categoriaOriginal: categoriaBackend
            };
        });
        
        // Guardar en localStorage
        guardarProductosEnLocalStorage();
        
        renderizarProductos();
        actualizarContadores();
        console.log('✅ Productos cargados desde backend:', productos.length);
    } catch (error) {
        console.error('❌ Error al cargar productos:', error);
        mostrarNotificacion('Error al cargar productos: ' + error.message, 'error');
    }
}

async function actualizarDesdeBackendEnSegundoPlano() {
    try {
        console.log('🔄 Actualizando datos en segundo plano...');
        const productosBackend = await obtenerProductosBackend();
        
        const productosActualizados = productosBackend.map(p => {
            let categoriaBackend = p.categoria || p.category?.nombre || '';
            const categoriaFrontend = categoriaBackendToFrontend(categoriaBackend);
            
            return {
                ...p,
                categoria: categoriaFrontend,
                categoriaOriginal: categoriaBackend
            };
        });
        
        // Verificar si hay cambios
        if (JSON.stringify(productos) !== JSON.stringify(productosActualizados)) {
            productos = productosActualizados;
            guardarProductosEnLocalStorage();
            renderizarProductos();
            actualizarContadores();
            console.log('🔄 Productos actualizados desde el backend en segundo plano');
        } else {
            console.log('✅ No hay cambios en el backend');
        }
    } catch (error) {
        console.warn('⚠️ No se pudo actualizar en segundo plano:', error);
    }
}

// ============================================
// REDIMENSIONAR Y COMPRIMIR IMAGEN
// ============================================
function comprimirImagen(archivo, anchoMaximo = 800, calidad = 0.72) {
    return new Promise((resolve, reject) => {
        const lector = new FileReader();
        lector.onload = function () {
            const imagen = new Image();
            imagen.onload = function () {
                const escala = Math.min(1, anchoMaximo / imagen.width);
                const canvas = document.createElement("canvas");
                canvas.width = imagen.width * escala;
                canvas.height = imagen.height * escala;

                const contexto = canvas.getContext("2d");
                contexto.drawImage(imagen, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", calidad));
            };
            imagen.onerror = reject;
            imagen.src = lector.result;
        };
        lector.onerror = reject;
        lector.readAsDataURL(archivo);
    });
}

// ============================================
// REFERENCIAS HTML
// ============================================
const contenedorProductos = document.getElementById("contenedorProductos");
const contadorProductosTotal = document.getElementById("contadorProductosTotal");
const contadorProductosVisibles = document.getElementById("contadorProductosVisibles");
const buscadorProductos = document.getElementById("buscadorProductos");
const btnLimpiarBusquedaProductos = document.getElementById("btnLimpiarBusquedaProductos");
const filtroTodos = document.getElementById("filtroTodos");
const filtroMangas = document.getElementById("filtroMangas");
const filtroFiguras = document.getElementById("filtroFiguras");
const filtroMerch = document.getElementById("filtroMerch");
const limpiarFiltros = document.getElementById("limpiarFiltros");

const modalAgregarProducto = document.getElementById("modalAgregarProducto");
const modalEditarProducto = document.getElementById("modalEditarProducto");
const cerrarModalAgregar = document.getElementById("cerrarModalAgregar");
const cerrarModalEditar = document.getElementById("cerrarModalEditar");

const modalConfirmarEstado = document.getElementById("modalConfirmarEstado");
const tituloConfirmarEstado = document.getElementById("tituloConfirmarEstado");
const mensajeConfirmarEstado = document.getElementById("mensajeConfirmarEstado");
const btnCancelarCambioEstado = document.getElementById("btnCancelarCambioEstado");
const btnConfirmarCambioEstado = document.getElementById("btnConfirmarCambioEstado");
const cerrarModalConfirmarEstadoBtn = document.getElementById("cerrarModalConfirmarEstado");
let idProductoParaCambiarEstado = null;

const formularioAgregarProducto = document.getElementById("formularioAgregarProducto");
const formularioEditarProducto = document.getElementById("formularioEditarProducto");

const imagenProductoAgregar = document.getElementById("imagenProductoAgregar");
const nombreProductoAgregar = document.getElementById("nombreProductoAgregar");
const descripcionProductoAgregar = document.getElementById("descripcionProductoAgregar");
const categoriaProductoAgregar = document.getElementById("categoriaProductoAgregar");
const precioProductoAgregar = document.getElementById("precioProductoAgregar");
const stockProductoAgregar = document.getElementById("stockProductoAgregar");

const idProductoEditar = document.getElementById("idProductoEditar");
const imagenProductoEditar = document.getElementById("imagenProductoEditar");
const nombreProductoEditar = document.getElementById("nombreProductoEditar");
const descripcionProductoEditar = document.getElementById("descripcionProductoEditar");
const categoriaProductoEditar = document.getElementById("categoriaProductoEditar");
const precioProductoEditar = document.getElementById("precioProductoEditar");
const stockProductoEditar = document.getElementById("stockProductoEditar");

const botonAgregarProducto = document.getElementById("botonAgregarProducto");

let categoriaSeleccionada = "todos";
let textoBusqueda = "";

// ============================================
// FUNCIONES DE RENDERIZADO
// ============================================
function crearTarjetaProducto(producto) {
    // Determinar la URL de la imagen
    let imagenUrl = '../../assets/img/logo.png';
    
    if (producto.imagen) {
        if (producto.imagen.startsWith('data:image')) {
            imagenUrl = producto.imagen;
        } else if (producto.imagen !== 'logo.png' && producto.imagen !== 'sin-imagen.png') {
            imagenUrl = `http://localhost:8081/uploads/${producto.imagen}`;
        } else {
            imagenUrl = '../../assets/img/logo.png';
        }
    }
    
    // Obtener el nombre de la categoría para mostrar
    const nombreCategoria = obtenerNombreCategoria(producto.categoria);
    
    return `
    <div class="col-lg-3 col-md-6 mb-4">
        <div class="tarjetaProductoAdmin ${producto.activo ? "productoActivo" : "productoInactivo"}">
            <div class="contenedorImagenProducto">
                <img src="${imagenUrl}" alt="${producto.nombre}" 
                     onerror="this.src='../../assets/img/logo.png'">
                <span class="badgeCategoriaProducto categoria-${producto.categoria}">
                    ${nombreCategoria}
                </span>
            </div>
            <div class="contenidoTarjetaProducto">
                <div class="grupoInfoProducto">
                    <h3 class="tituloProductoAdmin">${producto.nombre}</h3>
                    <p class="descripcionProductoAdmin">${producto.descripcion || ''}</p>
                    <div class="informacionProducto">
                        <div class="datoProducto">
                            <i class="bi bi-box-seam"></i>
                            <span>Stock: ${producto.stock}</span>
                        </div>
                    </div>
                    <div class="precioProductoAdmin">
                        $${Number(producto.precio).toLocaleString("es-CO")}
                    </div>
                </div>
                <div class="filaFinalProducto">
                    <div class="estadoProducto">
                        <span>${producto.activo ? 'Activo' : 'Inactivo'}</span>
                        <i class="bi ${producto.activo ? "bi-toggle-on" : "bi-toggle-off"} toggleEstadoProducto"
                            onclick="cambiarEstado(${producto.id})" style="cursor:pointer;">
                        </i>
                    </div>
                    <div class="accionesProducto">
                        <button class="btn botonEditarProducto" onclick="abrirEditar(${producto.id})">
                            <i class="bi bi-pencil-square"></i> Editar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

function crearSeccionCategoria(nombre, categoria, listaProductos) {
    if (listaProductos.length === 0) return "";

    let html = `
    <section class="categoriaProductos">
        <div class="tituloCategoriaProducto">
            <i class="${obtenerIconoCategoria(categoria)}"></i>
            <h2>${nombre}</h2>
        </div>
        <div class="row">
    `;

    listaProductos.forEach(producto => {
        html += crearTarjetaProducto(producto);
    });

    html += `</div></section>`;
    return html;
}

function ordenarProductos(lista) {
    return lista.sort((a, b) => {
        if (a.activo === b.activo) {
            return a.nombre.localeCompare(b.nombre);
        }
        return a.activo ? -1 : 1;
    });
}

function renderizarProductos() {
    if (!contenedorProductos) {
        console.warn('⚠️ contenedorProductos no encontrado');
        return;
    }
    
    contenedorProductos.innerHTML = "";

    let lista = [...productos];

    if (textoBusqueda !== "") {
        lista = lista.filter(producto =>
            producto.nombre.toLowerCase().includes(textoBusqueda) ||
            (producto.descripcion && producto.descripcion.toLowerCase().includes(textoBusqueda))
        );
    }

    if (categoriaSeleccionada !== "todos") {
        lista = lista.filter(producto => producto.categoria === categoriaSeleccionada);
    }

    const mangas = ordenarProductos(lista.filter(p => p.categoria === "manga"));
    const figuras = ordenarProductos(lista.filter(p => p.categoria === "figura"));
    const merch = ordenarProductos(lista.filter(p => p.categoria === "merch"));

    contenedorProductos.innerHTML += crearSeccionCategoria("Mangas", "manga", mangas);
    contenedorProductos.innerHTML += crearSeccionCategoria("Figuras", "figura", figuras);
    contenedorProductos.innerHTML += crearSeccionCategoria("Merch", "merch", merch);

    actualizarContadores();
}

function actualizarContadores() {
    if (contadorProductosTotal) {
        contadorProductosTotal.textContent = productos.length;
    }

    let visibles = [...productos];
    if (categoriaSeleccionada !== "todos") {
        visibles = visibles.filter(p => p.categoria === categoriaSeleccionada);
    }
    if (textoBusqueda !== "") {
        visibles = visibles.filter(p =>
            p.nombre.toLowerCase().includes(textoBusqueda) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(textoBusqueda))
        );
    }
    if (contadorProductosVisibles) {
        contadorProductosVisibles.textContent = visibles.length;
    }
}

// ============================================
// ABRIR EDITAR
// ============================================
function abrirEditar(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    idProductoEditar.value = producto.id;
    nombreProductoEditar.value = producto.nombre || '';
    descripcionProductoEditar.value = producto.descripcion || '';
    // El select debe tener el valor en el formato del frontend (minúsculas)
    categoriaProductoEditar.value = producto.categoria || 'manga';
    precioProductoEditar.value = producto.precio || 0;
    stockProductoEditar.value = producto.stock || 0;

    modalEditarProducto.classList.add("activo");
}

// ============================================
// CREAR PRODUCTO - CORREGIDO
// ============================================
formularioAgregarProducto.addEventListener("submit", async function (e) {
    e.preventDefault();

    const archivo = imagenProductoAgregar.files[0];
    
    let imagenBase64 = null;
    if (archivo) {
        if (archivo.size > 5 * 1024 * 1024) {
            mostrarNotificacion('❌ La imagen no puede superar los 5 MB', 'error');
            return;
        }
        imagenBase64 = await comprimirImagen(archivo);
    }

    // 🔥 OBTENER CATEGORÍA EN FORMATO BACKEND (MAYÚSCULAS)
    const categoriaFrontend = categoriaProductoAgregar.value;
    const categoriaBackend = categoriaFrontendToBackend(categoriaFrontend);

    const productoData = {
        nombre: nombreProductoAgregar.value.trim(),
        descripcion: descripcionProductoAgregar.value.trim(),
        categoria: categoriaBackend, // Envía "Mangas", "Figuras" o "Merchandising"
        precio: Number(precioProductoAgregar.value),
        stock: Number(stockProductoAgregar.value),
        imagen: imagenBase64 || 'logo.png',
        activo: true
    };

    console.log('📦 Enviando producto:', productoData);

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productoData)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Error al crear producto');
        }

        const productoCreado = await response.json();
        
        // Convertir categoría al formato frontend para el renderizado
        productoCreado.categoria = categoriaBackendToFrontend(productoCreado.categoria || productoCreado.category?.nombre);
        
        productos.push(productoCreado);
        renderizarProductos();
        formularioAgregarProducto.reset();
        modalAgregarProducto.classList.remove("activo");
        mostrarNotificacion('✅ Producto creado exitosamente', 'exito');
    } catch (error) {
        console.error('❌ Error:', error);
        mostrarNotificacion('❌ Error al crear producto: ' + error.message, 'error');
    }
});

// ============================================
// EDITAR PRODUCTO - CORREGIDO
// ============================================
formularioEditarProducto.addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = Number(idProductoEditar.value);
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    const archivo = imagenProductoEditar.files[0];
    let imagenBase64 = producto.imagen;
    
    if (archivo) {
        if (archivo.size > 5 * 1024 * 1024) {
            mostrarNotificacion('❌ La imagen no puede superar los 5 MB', 'error');
            return;
        }
        imagenBase64 = await comprimirImagen(archivo);
    }

    // 🔥 OBTENER CATEGORÍA EN FORMATO BACKEND (MAYÚSCULAS)
    const categoriaFrontend = categoriaProductoEditar.value;
    const categoriaBackend = categoriaFrontendToBackend(categoriaFrontend);

    const productoData = {
        nombre: nombreProductoEditar.value.trim(),
        descripcion: descripcionProductoEditar.value.trim(),
        categoria: categoriaBackend, // Envía "Mangas", "Figuras" o "Merchandising"
        precio: Number(precioProductoEditar.value),
        stock: Number(stockProductoEditar.value),
        imagen: imagenBase64 || 'logo.png',
        activo: producto.activo !== false
    };

    console.log('📦 Actualizando producto:', productoData);

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/products/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productoData)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Error al actualizar producto');
        }

        const actualizado = await response.json();
        
        // Convertir categoría al formato frontend para el renderizado
        actualizado.categoria = categoriaBackendToFrontend(actualizado.categoria || actualizado.category?.nombre);

        const index = productos.findIndex(p => p.id === id);
        if (index !== -1) {
            productos[index] = actualizado;
        }

        renderizarProductos();
        modalEditarProducto.classList.remove("activo");
        mostrarNotificacion('✅ Producto actualizado exitosamente', 'exito');
    } catch (error) {
        console.error('❌ Error:', error);
        mostrarNotificacion('❌ Error al actualizar producto: ' + error.message, 'error');
    }
});

// ============================================
// CAMBIAR ESTADO (CON BACKEND)
// ============================================
function cambiarEstado(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    if (!producto.activo && producto.stock <= 0) {
        idProductoParaCambiarEstado = null;
        tituloConfirmarEstado.textContent = "Sin stock disponible";
        mensajeConfirmarEstado.textContent =
            `No puedes activar "${producto.nombre}" porque no tiene stock. Edita el producto y aumenta el stock para poder activarlo.`;
        btnCancelarCambioEstado.style.display = "none";
        btnConfirmarCambioEstado.textContent = "Entendido";
        modalConfirmarEstado.classList.add("activo");
        return;
    }

    idProductoParaCambiarEstado = id;
    btnCancelarCambioEstado.style.display = "";
    btnConfirmarCambioEstado.textContent = "Confirmar";

    if (producto.activo) {
        tituloConfirmarEstado.textContent = "Desactivar producto";
        mensajeConfirmarEstado.textContent =
            `¿Seguro que deseas desactivar "${producto.nombre}"? Dejará de mostrarse en el catálogo.`;
    } else {
        tituloConfirmarEstado.textContent = "Activar producto";
        mensajeConfirmarEstado.textContent =
            `¿Seguro que deseas activar "${producto.nombre}"? Se mostrará en el catálogo.`;
    }

    modalConfirmarEstado.classList.add("activo");
}

// ============================================
// CONFIRMAR CAMBIO DE ESTADO (CON BACKEND)
// ============================================
async function confirmarCambioEstado() {
    console.log('🔍 Iniciando confirmación de cambio de estado...');
    
    const producto = productos.find(p => p.id === idProductoParaCambiarEstado);
    if (!producto) {
        console.warn('⚠️ Producto no encontrado');
        cerrarModalConfirmarEstado();
        return;
    }

    const nuevoEstado = !producto.activo;
    console.log(`🔄 Cambiando estado de "${producto.nombre}" de ${producto.activo} a ${nuevoEstado}`);

    try {
        // 🔥 USAR EL NUEVO ENDPOINT PATCH
        const actualizado = await cambiarEstadoBackend(producto.id, nuevoEstado);
        console.log('✅ Respuesta del backend:', actualizado);
        
        // Convertir categoría al formato frontend (si viene del backend)
        if (actualizado.categoria) {
            actualizado.categoria = categoriaBackendToFrontend(actualizado.categoria);
        }
        if (actualizado.category?.nombre) {
            actualizado.categoria = categoriaBackendToFrontend(actualizado.category.nombre);
        }

        // Actualizar el array de productos
        const index = productos.findIndex(p => p.id === producto.id);
        if (index !== -1) {
            productos[index] = {
                ...productos[index],
                ...actualizado,
                categoria: actualizado.categoria || productos[index].categoria
            };
            console.log('✅ Producto actualizado en array local');
        }

        // 💾 GUARDAR EN LOCALSTORAGE
        guardarProductosEnLocalStorage();

        // Renderizar la vista
        renderizarProductos();
        cerrarModalConfirmarEstado();
        mostrarNotificacion(`✅ Producto ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`, 'exito');
        
    } catch (error) {
        console.error('❌ Error al cambiar estado:', error);
        mostrarNotificacion('❌ Error al cambiar estado: ' + error.message, 'error');
    }
}

// ============================================
// CERRAR MODAL CONFIRMACIÓN
// ============================================
function cerrarModalConfirmarEstado() {
    modalConfirmarEstado.classList.remove("activo");
    idProductoParaCambiarEstado = null;
}

// ============================================
// EVENTOS DE MODALES
// ============================================
btnConfirmarCambioEstado.addEventListener("click", confirmarCambioEstado);
btnCancelarCambioEstado.addEventListener("click", cerrarModalConfirmarEstado);
cerrarModalConfirmarEstadoBtn.addEventListener("click", cerrarModalConfirmarEstado);

modalConfirmarEstado.addEventListener("click", (e) => {
    if (e.target === modalConfirmarEstado) {
        cerrarModalConfirmarEstado();
    }
});

botonAgregarProducto.addEventListener("click", () => {
    formularioAgregarProducto.reset();
    modalAgregarProducto.classList.add("activo");
});

cerrarModalAgregar.addEventListener("click", () => {
    modalAgregarProducto.classList.remove("activo");
});

modalAgregarProducto.addEventListener("click", (e) => {
    if (e.target === modalAgregarProducto) {
        modalAgregarProducto.classList.remove("activo");
    }
});

cerrarModalEditar.addEventListener("click", () => {
    modalEditarProducto.classList.remove("activo");
});

modalEditarProducto.addEventListener("click", (e) => {
    if (e.target === modalEditarProducto) {
        modalEditarProducto.classList.remove("activo");
    }
});

// ============================================
// BUSCADOR Y FILTROS
// ============================================
function actualizarBotonLimpiarBusquedaProductos() {
    if (!btnLimpiarBusquedaProductos) return;
    btnLimpiarBusquedaProductos.classList.toggle("visible", buscadorProductos.value.trim().length > 0);
}

buscadorProductos.addEventListener("input", function () {
    textoBusqueda = this.value.trim().toLowerCase();
    actualizarBotonLimpiarBusquedaProductos();
    renderizarProductos();
});

btnLimpiarBusquedaProductos.addEventListener("click", () => {
    buscadorProductos.value = "";
    textoBusqueda = "";
    actualizarBotonLimpiarBusquedaProductos();
    renderizarProductos();
    buscadorProductos.focus();
});

filtroTodos.addEventListener("click", () => {
    categoriaSeleccionada = "todos";
    renderizarProductos();
});

filtroMangas.addEventListener("click", () => {
    categoriaSeleccionada = "manga";
    renderizarProductos();
});

filtroFiguras.addEventListener("click", () => {
    categoriaSeleccionada = "figura";
    renderizarProductos();
});

filtroMerch.addEventListener("click", () => {
    categoriaSeleccionada = "merch";
    renderizarProductos();
});

limpiarFiltros.addEventListener("click", () => {
    categoriaSeleccionada = "todos";
    textoBusqueda = "";
    buscadorProductos.value = "";
    actualizarBotonLimpiarBusquedaProductos();
    renderizarProductos();
});

// ============================================
// EXPONER FUNCIONES GLOBALMENTE
// ============================================
window.abrirEditar = abrirEditar;
window.cambiarEstado = cambiarEstado;
window.confirmarCambioEstado = confirmarCambioEstado;
window.cerrarModalConfirmarEstado = cerrarModalConfirmarEstado;

// ============================================
// NOTIFICACIONES (TOAST)
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
// FUNCIÓN PARA OBTENER USUARIO LOGUEADO
// ============================================
function obtenerUsuarioLogueado() {
    try {
        const usuario = localStorage.getItem('usuario');
        return usuario ? JSON.parse(usuario) : null;
    } catch (error) {
        console.error('❌ Error al obtener usuario:', error);
        return null;
    }
}

// ============================================
// INICIALIZAR
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    cargarProductos();
});