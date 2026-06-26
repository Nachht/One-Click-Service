let listaServicios = [];
let filtroActual = "todos";
let textoBusqueda = "";
let indiceServicioEditar = null;

// Referencias HTML
const contenedorServicios = document.getElementById("servicesGrid");
const contadorTotal = document.getElementById("totalCount");
const contadorVisibles = document.getElementById("visibleCount");
const buscadorServicios = document.getElementById("searchInput");

// Botones principales
const botonAgregarServicio = document.querySelector(".btn-add");
const botonFiltroTodos = document.getElementById("filterAll");
const botonFiltroActivos = document.getElementById("filterActive");
const botonFiltroInactivos = document.getElementById("filterInactive");
const botonLimpiarFiltros = document.getElementById("clearFilters");

// Ventana agregar
const modalAgregarServicio = document.getElementById("modalAgregarServicio");
const cerrarModalAgregar = document.getElementById("cerrarModalAgregar");
const formularioAgregarServicio = document.getElementById("formularioAgregarServicio");

// Ventana editar
const modalEditarServicio = document.getElementById("modalEditarServicio");
const cerrarModalEditar = document.getElementById("cerrarModalEditar");
const formularioEditarServicio = document.getElementById("formularioEditarServicio");

// ======================
// MENÚ
// ======================
    const menuBtn = document.getElementById("menuBtn");
    const menu = document.getElementById("menu");

    if (menuBtn && menu) {
        menuBtn.addEventListener("click", () => {
            menu.classList.toggle("activo");
        });
    }
    
// Devuelve una imagen temporal cuando el usuario selecciona un archivo.
function obtenerRutaImagen(imagenArchivo) {
    if (!imagenArchivo) {
        return "../../assets/img/persona.png";
    }
    return URL.createObjectURL(imagenArchivo);
}

// Pasa a pesos colombianos
function formatearPrecio(precio) {
    return Number(precio).toLocaleString(
        "es-CO",
        {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0
        }
    );
}

// Actualizacion de contadores
function actualizarContadores() {
    contadorTotal.textContent = listaServicios.length;
    const serviciosVisibles = document.querySelectorAll(".service-card");
    contadorVisibles.textContent = serviciosVisibles.length;
}

// Activa el boton del filtro
function activarBotonFiltro(botonSeleccionado) {
    document
        .querySelectorAll(".btn-filter")
        .forEach(boton => {
            boton.classList.remove("active");
        });
    botonSeleccionado.classList.add("active");
}

// Renderizado de servios - genera automáticamente las tarjetas.
function renderizarServicios() {
    contenedorServicios.innerHTML = "";
    const serviciosFiltrados = listaServicios.filter(servicio => {
        const coincideBusqueda =
            servicio.nombre
                .toLowerCase()
                .includes(textoBusqueda.toLowerCase())
        servicio.descripcion
            .toLowerCase()
            .includes(textoBusqueda.toLowerCase());

        let coincideFiltro = true;
        if (filtroActual === "activos") {
            coincideFiltro = servicio.activo;
        }
        if (filtroActual === "inactivos") {
            coincideFiltro = !servicio.activo;
        }
        return coincideBusqueda && coincideFiltro;
    });

    if (serviciosFiltrados.length === 0) {
        contenedorServicios.innerHTML =
            `
            <div class="mensajeSinServicios">
                <h3>No se encontraron servicios.</h3>
                <p>Intenta cambiar el filtro o agregar uno nuevo.</p>
            </div>
        `;
        actualizarContadores();
        return;
    }

    // Crear cada tarjeta
    serviciosFiltrados.forEach((servicio) => {
        const tarjeta = document.createElement("div");

        // Asignamos las clases dinámicas de estado correspondientes
        tarjeta.className = "col-lg-6 col-md-6 col-12";
        // Definimos el icono del interruptor deslizante
        const iconoToggle = servicio.activo
            ? '<i class="bi bi-toggle-on toggle-icon active"></i>'
            : '<i class="bi bi-toggle-off toggle-icon inactive"></i>';

        tarjeta.innerHTML = `
<div class="service-card ${servicio.activo ? "card-activo" : "card-inactivo"}">

    <div class="row align-items-center">

        <div class="col-4 text-center">
            <div class="service-img-container">
                <img src="${servicio.imagen}" alt="${servicio.nombre}">
            </div>
        </div>

        <div class="col-8">
            <h3 class="service-card-title">${servicio.nombre}</h3>
            <p class="service-card-desc"> ${servicio.descripcion} </p>

            <div class="service-card-price"> ${formatearPrecio(servicio.precio)} </div>

            <div class="d-flex justify-content-between align-items-center mt-3">
                <div class="estado"
                    onclick="cambiarEstadoServicio(${servicio.id})">

                    <span class="me-2"> ${servicio.activo ? "Activo" : "Inactivo"} </span>
                    ${iconoToggle}
                </div>

                <button class="btn btn-outline-primary btn-sm rounded-3" onclick="abrirModalEditarServicio(${servicio.id})"> <i class="bi bi-pencil-square"></i> Editar</button>
            </div>
        </div>
    </div>
</div>
`;
        contenedorServicios.appendChild(tarjeta);
    });

    actualizarContadores();
}

// Ventana agregar servicio
botonAgregarServicio.addEventListener("click", () => {
    formularioAgregarServicio.reset();
    modalAgregarServicio.classList.add("activo");
});

// Cerrar ventana con x
cerrarModalAgregar.addEventListener("click", () => {
    modalAgregarServicio.classList.remove("activo");
});

// Cerrar modal haciendo clic fuera
window.addEventListener("click", (evento) => {
    if (evento.target === modalAgregarServicio) {
        modalAgregarServicio.classList.remove("activo");
    }
});

// Función para guardar un nuevo servicio
formularioAgregarServicio.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const archivoImagen = document.getElementById("imagenServicioAgregar").files[0];
    const nombreServicio = document.getElementById("nombreServicioAgregar").value.trim();
    const descripcionServicio = document.getElementById("descripcionServicioAgregar").value.trim();
    const precioServicio = document.getElementById("precioServicioAgregar").value;
    const nuevoServicio = {
        id: Date.now(),
        imagen: obtenerRutaImagen(archivoImagen),
        nombre: nombreServicio,
        descripcion: descripcionServicio,
        precio: Number(precioServicio),
        activo: true

    };

    listaServicios.push(nuevoServicio);

    // Para mostrar JSON en consola
    console.clear();

    console.table(listaServicios);
    console.log(JSON.stringify(listaServicios, null, 2));

    renderizarServicios();
    formularioAgregarServicio.reset();
    modalAgregarServicio.classList.remove("activo");
});

// Función para poder editar un servicio
function abrirModalEditarServicio(idServicio) {
    indiceServicioEditar = listaServicios.findIndex(servicio => servicio.id === idServicio);
    if (indiceServicioEditar === -1) {
        return;
    }

    const servicio = listaServicios[indiceServicioEditar];
    document.getElementById("nombreServicioEditar").value = servicio.nombre;
    document.getElementById("descripcionServicioEditar").value = servicio.descripcion;
    document.getElementById("precioServicioEditar").value = servicio.precio;
    // Limpiar el input de imagen. Si el usuario no selecciona otra, se conserva la actual.
    document.getElementById("imagenServicioEditar").value = "";
    modalEditarServicio.classList.add("activo");
}

// Cerrar ventana emergente
cerrarModalEditar.addEventListener("click", () => {
    modalEditarServicio.classList.remove("activo");
});

window.addEventListener("click", (evento) => {
    if (evento.target === modalEditarServicio) {
        modalEditarServicio.classList.remove("activo");
    }
});

// Guardar los cambios
formularioEditarServicio.addEventListener("submit", function (evento) {
    evento.preventDefault();
    if (indiceServicioEditar === null) {
        return;
    }

    const servicio = listaServicios[indiceServicioEditar];
    servicio.nombre = document.getElementById("nombreServicioEditar").value.trim();
    servicio.descripcion = document.getElementById("descripcionServicioEditar").value.trim();
    servicio.precio = Number(document.getElementById("precioServicioEditar").value);

    const nuevaImagen =
        document.getElementById("imagenServicioEditar").files[0];

    if (nuevaImagen) {
        servicio.imagen = obtenerRutaImagen(nuevaImagen);
    }

    // Mostrar JSON actualizado
    console.clear();

    console.table(listaServicios);
    console.log(
        JSON.stringify(listaServicios, null, 2)
    );

    renderizarServicios();
    modalEditarServicio.classList.remove("activo");
    indiceServicioEditar = null;
});

// Buscador de servicios
buscadorServicios.addEventListener("input", function () {
    textoBusqueda = this.value.trim();
    renderizarServicios();
});

// FILTROS                                     
botonFiltroTodos.addEventListener("click", () => {
    filtroActual = "todos";
    activarBotonFiltro(botonFiltroTodos);
    renderizarServicios();
});

botonFiltroActivos.addEventListener("click", () => {
    filtroActual = "activos";
    activarBotonFiltro(botonFiltroActivos);
    renderizarServicios();
});

botonFiltroInactivos.addEventListener("click", () => {
    filtroActual = "inactivos";
    activarBotonFiltro(botonFiltroInactivos);
    renderizarServicios();
});

botonLimpiarFiltros.addEventListener("click", () => {
    textoBusqueda = "";
    filtroActual = "todos";
    buscadorServicios.value = "";
    activarBotonFiltro(botonFiltroTodos);
    renderizarServicios();
});

// Activar y desactivar servicio
function cambiarEstadoServicio(idServicio) {
    const servicio = listaServicios.find(servicio => {
        return servicio.id === idServicio;
    });
    if (!servicio) {
        return;
    }

    servicio.activo = !servicio.activo;
    console.clear();

    console.table(listaServicios);
    console.log(JSON.stringify(listaServicios, null, 2));
    renderizarServicios();
}

// Inicialización del sistema 
document.addEventListener("DOMContentLoaded", () => {
    activarBotonFiltro(botonFiltroTodos);

    const guardados = localStorage.getItem("listaServicios");

    if (guardados) {
        listaServicios = JSON.parse(guardados);
    } else if (listaServicios.length === 0) {
       
        listaServicios = [
            {
                id: 1,
                imagen: "../../assets/img/persona.png",
                nombre: "Servicio de Aseo",
                descripcion: "Limpieza de hogares y oficinas.",
                precio: 80000,
                activo: true
            },
            {
                id: 2,
                imagen: "../../assets/img/persona.png",
                nombre: "Jardinería",
                descripcion: "Mantenimiento y poda de jardines.",
                precio: 65000,
                activo: true
            },
            {
                id: 3,
                imagen: "../../assets/img/persona.png",
                nombre: "Peluquería",
                descripcion: "Corte y arreglo personal a domicilio.",
                precio: 45000,
                activo: false
            }
        ];
        
        localStorage.setItem("listaServicios", JSON.stringify(listaServicios));
    }

    renderizarServicios();
    actualizarContadores();
});

window.abrirModalEditarServicio =
    abrirModalEditarServicio;

window.cambiarEstadoServicio =
    cambiarEstadoServicio;