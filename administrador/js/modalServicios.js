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
const botonAgregarServicio = document.getElementById("btnAgregarServicio");
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

// =========================
// CONFIGURACIÓN DE VALIDACIONES
// =========================
const validacionesServicio = {
    nombre: {
        regex: /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/,
        min: 4,
        max: 30,
        mensaje: "El nombre debe tener entre 4 y 30 caracteres y solo letras"
    },
    descripcion: {
        regex: /^[A-Za-z0-9ÁÉÍÓÚáéíóúñÑ\s.,;:!?\-]+$/,
        min: 50,
        max: 1000,
        mensaje: "La descripción debe tener entre 50 y 1000 caracteres y solo letras o números"
    },
    precio: {
        regex: /^\d+$/,
        min: 1,
        max: 99999999,
        mensaje: "El precio solo debe contener números"
    }
};

// =========================
// FUNCIONES DE VALIDACIÓN
// =========================

function validarCampo(input, config, id) {
    const valor = input.value.trim();
    const errorEl = document.getElementById(`error-${id}`);
    const exitoEl = document.getElementById(`exito-${id}`);
    const iconoEl = document.getElementById(`icono-${id}`);

    let esValido = true;
    let mensajeError = "";

    if (valor.length === 0) {
        esValido = false;
        mensajeError = "Este campo es obligatorio";
    } else if (valor.length < config.min) {
        esValido = false;
        mensajeError = `Mínimo ${config.min} caracteres`;
    } else if (valor.length > config.max) {
        esValido = false;
        mensajeError = `Máximo ${config.max} caracteres`;
    } else if (!config.regex.test(valor)) {
        esValido = false;
        mensajeError = config.mensaje;
    }

    input.classList.remove("successInput", "errorInput");

    if (esValido) {
        input.classList.add("successInput");
        if (errorEl) {
            errorEl.classList.remove("visible");
            errorEl.textContent = "";
        }
        if (exitoEl) {
            exitoEl.textContent = "✓ Válido";
            exitoEl.classList.add("visible");
        }
        if (iconoEl) {
            iconoEl.textContent = "✅";
            iconoEl.classList.add("visible");
        }
    } else {
        input.classList.add("errorInput");
        if (errorEl) {
            errorEl.textContent = mensajeError || config.mensaje;
            errorEl.classList.add("visible");
        }
        if (exitoEl) {
            exitoEl.classList.remove("visible");
        }
        if (iconoEl) {
            iconoEl.textContent = "❌";
            iconoEl.classList.add("visible");
        }
    }

    return esValido;
}

// Bloquear letras en precio
function bloquearLetrasPrecio(input) {
    input.addEventListener('keypress', function(e) {
        const charCode = e.which || e.keyCode;
        const char = String.fromCharCode(charCode);
        if (!/^\d$/.test(char)) {
            e.preventDefault();
            const errorEl = document.getElementById('error-precioAgregar');
            if (errorEl) {
                errorEl.textContent = "El precio solo permite números";
                errorEl.classList.add('visible');
            }
        }
    });
}

// Bloquear números en nombre
function bloquearNumerosNombre(input, idError) {
    input.addEventListener('keypress', function(e) {
        const charCode = e.which || e.keyCode;
        const char = String.fromCharCode(charCode);
        if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]$/.test(char)) {
            e.preventDefault();
            const errorEl = document.getElementById(idError);
            if (errorEl) {
                errorEl.textContent = "El nombre solo permite letras";
                errorEl.classList.add('visible');
            }
        }
    });
}

// Bloquear solo números en descripción (ahora permite números, solo bloquea caracteres especiales no permitidos)
function bloquearCaracteresEspecialesDescripcion(input, idError) {
    input.addEventListener('keypress', function(e) {
        const charCode = e.which || e.keyCode;
        const char = String.fromCharCode(charCode);
        // Permitir letras, números, espacios, y signos de puntuación básicos
        if (!/^[A-Za-z0-9ÁÉÍÓÚáéíóúñÑ\s.,;:!?\-]$/.test(char)) {
            e.preventDefault();
            const errorEl = document.getElementById(idError);
            if (errorEl) {
                errorEl.textContent = "La descripción solo permite letras, números y signos de puntuación";
                errorEl.classList.add('visible');
            }
        }
    });
}

// =========================
// MENÚ
// =========================
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

if (menuBtn && menu) {
    menuBtn.addEventListener("click", () => {
        menu.classList.toggle("activo");
    });

    document.addEventListener("click", function(e) {
        if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
            menu.classList.remove("activo");
        }
    });
}

// =========================
// CONFIGURAR VALIDACIONES EN TIEMPO REAL - AGREGAR
// =========================
const nombreAgregar = document.getElementById("nombreServicioAgregar");
const descripcionAgregar = document.getElementById("descripcionServicioAgregar");
const precioAgregar = document.getElementById("precioServicioAgregar");
const imagenAgregar = document.getElementById("imagenServicioAgregar");

if (nombreAgregar) {
    bloquearNumerosNombre(nombreAgregar, 'error-nombreAgregar');
    nombreAgregar.addEventListener("input", function() {
        validarCampo(this, validacionesServicio.nombre, 'nombreAgregar');
    });
    nombreAgregar.addEventListener("blur", function() {
        validarCampo(this, validacionesServicio.nombre, 'nombreAgregar');
    });
}

if (descripcionAgregar) {
    bloquearCaracteresEspecialesDescripcion(descripcionAgregar, 'error-descripcionAgregar');
    descripcionAgregar.addEventListener("input", function() {
        validarCampo(this, validacionesServicio.descripcion, 'descripcionAgregar');
        // Actualizar contador
        const contador = document.getElementById("contador-descripcionAgregar");
        if (contador) {
            const length = this.value.length;
            contador.textContent = `${length} / 1000 caracteres`;
            if (length > 1000) {
                contador.classList.add("excedido");
            } else {
                contador.classList.remove("excedido");
            }
        }
    });
    descripcionAgregar.addEventListener("blur", function() {
        validarCampo(this, validacionesServicio.descripcion, 'descripcionAgregar');
    });
}

if (precioAgregar) {
    bloquearLetrasPrecio(precioAgregar);
    precioAgregar.addEventListener("input", function() {
        validarCampo(this, validacionesServicio.precio, 'precioAgregar');
    });
    precioAgregar.addEventListener("blur", function() {
        validarCampo(this, validacionesServicio.precio, 'precioAgregar');
    });
}

if (imagenAgregar) {
    imagenAgregar.addEventListener("change", function() {
        const file = this.files[0];
        const errorEl = document.getElementById("error-imagenAgregar");
        const exitoEl = document.getElementById("exito-imagenAgregar");
        const iconoEl = document.getElementById("icono-imagenAgregar");

        this.classList.remove("successInput", "errorInput");

        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                this.classList.add("errorInput");
                if (errorEl) {
                    errorEl.textContent = "La imagen no debe superar los 2MB";
                    errorEl.classList.add("visible");
                }
                if (exitoEl) {
                    exitoEl.classList.remove("visible");
                }
                if (iconoEl) {
                    iconoEl.textContent = "❌";
                    iconoEl.classList.add("visible");
                }
                return;
            }
            const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
            if (!tiposPermitidos.includes(file.type)) {
                this.classList.add("errorInput");
                if (errorEl) {
                    errorEl.textContent = "Solo se permiten JPG, PNG o WEBP";
                    errorEl.classList.add("visible");
                }
                if (exitoEl) {
                    exitoEl.classList.remove("visible");
                }
                if (iconoEl) {
                    iconoEl.textContent = "❌";
                    iconoEl.classList.add("visible");
                }
                return;
            }
            this.classList.add("successInput");
            if (errorEl) {
                errorEl.classList.remove("visible");
                errorEl.textContent = "";
            }
            if (exitoEl) {
                exitoEl.textContent = "✓ Imagen válida";
                exitoEl.classList.add("visible");
            }
            if (iconoEl) {
                iconoEl.textContent = "✅";
                iconoEl.classList.add("visible");
            }
        } else {
            this.classList.add("errorInput");
            if (errorEl) {
                errorEl.textContent = "Debe seleccionar una imagen";
                errorEl.classList.add("visible");
            }
            if (exitoEl) {
                exitoEl.classList.remove("visible");
            }
            if (iconoEl) {
                iconoEl.textContent = "❌";
                iconoEl.classList.add("visible");
            }
        }
    });
}

// =========================
// CONFIGURAR VALIDACIONES EN TIEMPO REAL - EDITAR
// =========================
const nombreEditar = document.getElementById("nombreServicioEditar");
const descripcionEditar = document.getElementById("descripcionServicioEditar");
const precioEditar = document.getElementById("precioServicioEditar");
const imagenEditar = document.getElementById("imagenServicioEditar");

if (nombreEditar) {
    bloquearNumerosNombre(nombreEditar, 'error-nombreEditar');
    nombreEditar.addEventListener("input", function() {
        validarCampo(this, validacionesServicio.nombre, 'nombreEditar');
    });
    nombreEditar.addEventListener("blur", function() {
        validarCampo(this, validacionesServicio.nombre, 'nombreEditar');
    });
}

if (descripcionEditar) {
    bloquearCaracteresEspecialesDescripcion(descripcionEditar, 'error-descripcionEditar');
    descripcionEditar.addEventListener("input", function() {
        validarCampo(this, validacionesServicio.descripcion, 'descripcionEditar');
        const contador = document.getElementById("contador-descripcionEditar");
        if (contador) {
            const length = this.value.length;
            contador.textContent = `${length} / 1000 caracteres`;
            if (length > 1000) {
                contador.classList.add("excedido");
            } else {
                contador.classList.remove("excedido");
            }
        }
    });
    descripcionEditar.addEventListener("blur", function() {
        validarCampo(this, validacionesServicio.descripcion, 'descripcionEditar');
    });
}

if (precioEditar) {
    bloquearLetrasPrecio(precioEditar);
    precioEditar.addEventListener("input", function() {
        validarCampo(this, validacionesServicio.precio, 'precioEditar');
    });
    precioEditar.addEventListener("blur", function() {
        validarCampo(this, validacionesServicio.precio, 'precioEditar');
    });
}

if (imagenEditar) {
    imagenEditar.addEventListener("change", function() {
        const file = this.files[0];
        const errorEl = document.getElementById("error-imagenEditar");
        const exitoEl = document.getElementById("exito-imagenEditar");
        const iconoEl = document.getElementById("icono-imagenEditar");

        this.classList.remove("successInput", "errorInput");

        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                this.classList.add("errorInput");
                if (errorEl) {
                    errorEl.textContent = "La imagen no debe superar los 2MB";
                    errorEl.classList.add("visible");
                }
                if (exitoEl) {
                    exitoEl.classList.remove("visible");
                }
                if (iconoEl) {
                    iconoEl.textContent = "❌";
                    iconoEl.classList.add("visible");
                }
                return;
            }
            const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
            if (!tiposPermitidos.includes(file.type)) {
                this.classList.add("errorInput");
                if (errorEl) {
                    errorEl.textContent = "Solo se permiten JPG, PNG o WEBP";
                    errorEl.classList.add("visible");
                }
                if (exitoEl) {
                    exitoEl.classList.remove("visible");
                }
                if (iconoEl) {
                    iconoEl.textContent = "❌";
                    iconoEl.classList.add("visible");
                }
                return;
            }
            this.classList.add("successInput");
            if (errorEl) {
                errorEl.classList.remove("visible");
                errorEl.textContent = "";
            }
            if (exitoEl) {
                exitoEl.textContent = "✓ Imagen válida";
                exitoEl.classList.add("visible");
            }
            if (iconoEl) {
                iconoEl.textContent = "✅";
                iconoEl.classList.add("visible");
            }
        }
    });
}

// =========================
// FUNCIONES UTILITARIAS
// =========================

function convertirImagenBase64(archivo) {
    return new Promise((resolve) => {
        if (!archivo) {
            resolve("../../assets/img/persona.png");
            return;
        }
        const lector = new FileReader();
        lector.onload = function(e) {
            resolve(e.target.result);
        };
        lector.readAsDataURL(archivo);
    });
}

function formatearPrecio(precio) {
    return Number(precio).toLocaleString(
        "es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0
        }
    );
}

function actualizarContadores() {
    if (contadorTotal) contadorTotal.textContent = listaServicios.length;
    const serviciosVisibles = document.querySelectorAll(".service-card");
    if (contadorVisibles) contadorVisibles.textContent = serviciosVisibles.length;
}

function activarBotonFiltro(botonSeleccionado) {
    document.querySelectorAll(".btn-filter").forEach(boton => {
        boton.classList.remove("active");
    });
    if (botonSeleccionado) botonSeleccionado.classList.add("active");
}

// =========================
// VALIDAR FORMULARIO AGREGAR
// =========================
function validarFormularioAgregar() {
    const nombreInput = document.getElementById("nombreServicioAgregar");
    const descripcionInput = document.getElementById("descripcionServicioAgregar");
    const precioInput = document.getElementById("precioServicioAgregar");
    const imagenInput = document.getElementById("imagenServicioAgregar");

    const nombreValido = validarCampo(nombreInput, validacionesServicio.nombre, 'nombreAgregar');
    const descripcionValido = validarCampo(descripcionInput, validacionesServicio.descripcion, 'descripcionAgregar');
    const precioValido = validarCampo(precioInput, validacionesServicio.precio, 'precioAgregar');

    const errorImagen = document.getElementById("error-imagenAgregar");
    const exitoImagen = document.getElementById("exito-imagenAgregar");
    const iconoImagen = document.getElementById("icono-imagenAgregar");

    if (!imagenInput.files || imagenInput.files.length === 0) {
        imagenInput.classList.add("errorInput");
        if (errorImagen) {
            errorImagen.textContent = "Debe seleccionar una imagen";
            errorImagen.classList.add("visible");
        }
        if (exitoImagen) {
            exitoImagen.classList.remove("visible");
        }
        if (iconoImagen) {
            iconoImagen.textContent = "❌";
            iconoImagen.classList.add("visible");
        }
        return false;
    } else {
        const file = imagenInput.files[0];
        if (file.size > 2 * 1024 * 1024) {
            imagenInput.classList.add("errorInput");
            if (errorImagen) {
                errorImagen.textContent = "La imagen no debe superar los 2MB";
                errorImagen.classList.add("visible");
            }
            if (exitoImagen) {
                exitoImagen.classList.remove("visible");
            }
            if (iconoImagen) {
                iconoImagen.textContent = "❌";
                iconoImagen.classList.add("visible");
            }
            return false;
        }
        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
        if (!tiposPermitidos.includes(file.type)) {
            imagenInput.classList.add("errorInput");
            if (errorImagen) {
                errorImagen.textContent = "Solo se permiten JPG, PNG o WEBP";
                errorImagen.classList.add("visible");
            }
            if (exitoImagen) {
                exitoImagen.classList.remove("visible");
            }
            if (iconoImagen) {
                iconoImagen.textContent = "❌";
                iconoImagen.classList.add("visible");
            }
            return false;
        }
        imagenInput.classList.remove("errorInput");
        imagenInput.classList.add("successInput");
        if (errorImagen) {
            errorImagen.classList.remove("visible");
            errorImagen.textContent = "";
        }
        if (exitoImagen) {
            exitoImagen.textContent = "✓ Imagen válida";
            exitoImagen.classList.add("visible");
        }
        if (iconoImagen) {
            iconoImagen.textContent = "✅";
            iconoImagen.classList.add("visible");
        }
    }

    return nombreValido && descripcionValido && precioValido;
}

// =========================
// VALIDAR FORMULARIO EDITAR
// =========================
function validarFormularioEditar() {
    const nombreInput = document.getElementById("nombreServicioEditar");
    const descripcionInput = document.getElementById("descripcionServicioEditar");
    const precioInput = document.getElementById("precioServicioEditar");

    const nombreValido = validarCampo(nombreInput, validacionesServicio.nombre, 'nombreEditar');
    const descripcionValido = validarCampo(descripcionInput, validacionesServicio.descripcion, 'descripcionEditar');
    const precioValido = validarCampo(precioInput, validacionesServicio.precio, 'precioEditar');

    return nombreValido && descripcionValido && precioValido;
}

// =========================
// ELIMINAR SERVICIO
// =========================
function eliminarServicio(id) {
    const servicio = listaServicios.find(s => String(s.id) === String(id));
    
    if (!servicio) {
        alert("❌ Servicio no encontrado");
        return;
    }

    if (confirm(`⚠️ ¿Desea eliminar el servicio "${servicio.nombre}"?\n\nEsta acción eliminará permanentemente el servicio.`)) {
        if (confirm(`❌ ¿Está SEGURO de eliminar "${servicio.nombre}"?\n\nEsta acción NO se puede deshacer.`)) {
            
            listaServicios = listaServicios.filter(s => String(s.id) !== String(id));
            localStorage.setItem("listaServicios", JSON.stringify(listaServicios));
            
            alert(`✅ Servicio "${servicio.nombre}" eliminado correctamente`);
            renderizarServicios();
            
            console.log("✅ Servicio eliminado:", servicio.nombre);
            console.table(listaServicios);
        } else {
            alert(`❌ Eliminación cancelada para "${servicio.nombre}"`);
        }
    } else {
        alert(`❌ Eliminación cancelada para "${servicio.nombre}"`);
    }
}

// =========================
// RENDERIZAR SERVICIOS
// =========================
function renderizarServicios() {
    if (!contenedorServicios) return;
    contenedorServicios.innerHTML = "";

    const serviciosFiltrados = listaServicios.filter(servicio => {
        const coincideBusqueda =
            servicio.nombre.toLowerCase().includes(textoBusqueda.toLowerCase()) ||
            servicio.descripcion.toLowerCase().includes(textoBusqueda.toLowerCase());

        let coincideFiltro = true;
        if (filtroActual === "activos") coincideFiltro = servicio.activo;
        if (filtroActual === "inactivos") coincideFiltro = !servicio.activo;
        return coincideBusqueda && coincideFiltro;
    });

    if (serviciosFiltrados.length === 0) {
        contenedorServicios.innerHTML = `
            <div class="mensajeSinServicios" style="grid-column:1/-1;text-align:center;padding:40px;">
                <h3>📋 No se encontraron servicios.</h3>
                <p>Intenta cambiar el filtro o agregar uno nuevo.</p>
            </div>
        `;
        actualizarContadores();
        return;
    }

    serviciosFiltrados.forEach((servicio) => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "col-lg-6 col-md-6 col-12";

        const iconoToggle = servicio.activo ?
            '<i class="bi bi-toggle-on toggle-icon active"></i>' :
            '<i class="bi bi-toggle-off toggle-icon inactive"></i>';

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
                        <p class="service-card-desc">${servicio.descripcion}</p>
                        <div class="service-card-price">${formatearPrecio(servicio.precio)}</div>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <div class="estado" onclick="cambiarEstadoServicio('${servicio.id}')">
                                <span class="me-2">${servicio.activo ? "Activo" : "Inactivo"}</span>
                                ${iconoToggle}
                            </div>
                            <div class="d-flex gap-2">
                                <button class="btn btn-outline-primary btn-sm rounded-3"
                                    onclick="abrirModalEditarServicio('${servicio.id}')">
                                    <i class="bi bi-pencil-square"></i> Editar
                                </button>
                                <button class="btn btn-outline-danger btn-sm rounded-3"
                                    onclick="eliminarServicio('${servicio.id}')">
                                    <i class="bi bi-trash"></i> Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        contenedorServicios.appendChild(tarjeta);
    });

    actualizarContadores();
}

// =========================
// VENTANA AGREGAR SERVICIO
// =========================
if (botonAgregarServicio) {
    botonAgregarServicio.addEventListener("click", () => {
        if (formularioAgregarServicio) {
            formularioAgregarServicio.reset();
            // Limpiar validaciones
            document.querySelectorAll("#formularioAgregarServicio .successInput, #formularioAgregarServicio .errorInput")
                .forEach(el => el.classList.remove("successInput", "errorInput"));
            document.querySelectorAll("#formularioAgregarServicio .mensaje-error, #formularioAgregarServicio .mensaje-exito")
                .forEach(el => el.classList.remove("visible"));
            document.querySelectorAll("#formularioAgregarServicio .icono-validacion")
                .forEach(el => el.classList.remove("visible"));
            
            // Resetear contador
            const contador = document.getElementById("contador-descripcionAgregar");
            if (contador) {
                contador.textContent = "0 / 1000 caracteres";
                contador.classList.remove("excedido");
            }
            
            const mensaje = document.getElementById("mensajeAgregar");
            if (mensaje) {
                mensaje.style.display = "none";
                mensaje.className = "";
                mensaje.textContent = "";
            }
        }
        if (modalAgregarServicio) modalAgregarServicio.classList.add("activo");
    });
}

if (cerrarModalAgregar) {
    cerrarModalAgregar.addEventListener("click", () => {
        if (modalAgregarServicio) modalAgregarServicio.classList.remove("activo");
    });
}

// =========================
// GUARDAR NUEVO SERVICIO
// =========================
if (formularioAgregarServicio) {
    formularioAgregarServicio.addEventListener("submit", async function(evento) {
        evento.preventDefault();

        if (!validarFormularioAgregar()) {
            const mensaje = document.getElementById("mensajeAgregar");
            if (mensaje) {
                mensaje.textContent = "❌ Por favor, corrija los campos marcados en rojo";
                mensaje.className = "error";
                mensaje.style.display = "block";
            }
            return;
        }

        const archivoImagen = document.getElementById("imagenServicioAgregar").files[0];
        const nombreServicio = document.getElementById("nombreServicioAgregar").value.trim();
        const descripcionServicio = document.getElementById("descripcionServicioAgregar").value.trim();
        const precioServicio = document.getElementById("precioServicioAgregar").value;
        const imagenBase64 = await convertirImagenBase64(archivoImagen);

        const nuevoServicio = {
            id: Date.now().toString(),
            imagen: imagenBase64,
            nombre: nombreServicio,
            descripcion: descripcionServicio,
            precio: Number(precioServicio),
            activo: true
        };

        const mensajeConfirmacion = `¿Desea guardar este servicio?\n\n` +
            `📋 Nombre: ${nuevoServicio.nombre}\n` +
            `📝 Descripción: ${nuevoServicio.descripcion.substring(0, 50)}...\n` +
            `💰 Precio: ${formatearPrecio(nuevoServicio.precio)}`;

        if (!confirm(mensajeConfirmacion)) {
            return;
        }

        listaServicios.push(nuevoServicio);
        localStorage.setItem("listaServicios", JSON.stringify(listaServicios));

        const mensaje = document.getElementById("mensajeAgregar");
        if (mensaje) {
            mensaje.textContent = "✅ Servicio guardado correctamente";
            mensaje.className = "exito";
            mensaje.style.display = "block";
        }

        renderizarServicios();
        formularioAgregarServicio.reset();

        setTimeout(() => {
            if (modalAgregarServicio) modalAgregarServicio.classList.remove("activo");
            if (mensaje) {
                mensaje.style.display = "none";
                mensaje.className = "";
                mensaje.textContent = "";
            }
        }, 1500);
    });
}

// =========================
// ABRIR MODAL EDITAR
// =========================
window.abrirModalEditarServicio = function(idServicio) {
    indiceServicioEditar = listaServicios.findIndex(servicio => servicio.id.toString() === idServicio.toString());
    if (indiceServicioEditar === -1) return;

    const servicio = listaServicios[indiceServicioEditar];
    const nombreInput = document.getElementById("nombreServicioEditar");
    const descripcionInput = document.getElementById("descripcionServicioEditar");
    const precioInput = document.getElementById("precioServicioEditar");
    const imagenInput = document.getElementById("imagenServicioEditar");
    const idInput = document.getElementById("idServicioEditar");

    if (idInput) idInput.value = servicio.id;
    if (nombreInput) nombreInput.value = servicio.nombre;
    if (descripcionInput) descripcionInput.value = servicio.descripcion;
    if (precioInput) precioInput.value = servicio.precio;
    if (imagenInput) imagenInput.value = "";

    // Limpiar validaciones
    document.querySelectorAll("#formularioEditarServicio .successInput, #formularioEditarServicio .errorInput")
        .forEach(el => el.classList.remove("successInput", "errorInput"));
    document.querySelectorAll("#formularioEditarServicio .mensaje-error, #formularioEditarServicio .mensaje-exito")
        .forEach(el => el.classList.remove("visible"));
    document.querySelectorAll("#formularioEditarServicio .icono-validacion")
        .forEach(el => el.classList.remove("visible"));

    // Actualizar contador
    const contador = document.getElementById("contador-descripcionEditar");
    if (contador && descripcionInput) {
        const length = descripcionInput.value.length;
        contador.textContent = `${length} / 1000 caracteres`;
        if (length > 1000) {
            contador.classList.add("excedido");
        } else {
            contador.classList.remove("excedido");
        }
    }

    // Validar campos existentes
    if (nombreInput) validarCampo(nombreInput, validacionesServicio.nombre, 'nombreEditar');
    if (descripcionInput) validarCampo(descripcionInput, validacionesServicio.descripcion, 'descripcionEditar');
    if (precioInput) validarCampo(precioInput, validacionesServicio.precio, 'precioEditar');

    const mensaje = document.getElementById("mensajeEditar");
    if (mensaje) {
        mensaje.style.display = "none";
        mensaje.className = "";
        mensaje.textContent = "";
    }

    if (modalEditarServicio) modalEditarServicio.classList.add("activo");
};

if (cerrarModalEditar) {
    cerrarModalEditar.addEventListener("click", () => {
        if (modalEditarServicio) modalEditarServicio.classList.remove("activo");
    });
}

// =========================
// GUARDAR EDICIÓN
// =========================
if (formularioEditarServicio) {
    formularioEditarServicio.addEventListener("submit", async function(evento) {
        evento.preventDefault();

        if (indiceServicioEditar === null) return;

        if (!validarFormularioEditar()) {
            const mensaje = document.getElementById("mensajeEditar");
            if (mensaje) {
                mensaje.textContent = "❌ Por favor, corrija los campos marcados en rojo";
                mensaje.className = "error";
                mensaje.style.display = "block";
            }
            return;
        }

        const servicio = listaServicios[indiceServicioEditar];
        servicio.nombre = document.getElementById("nombreServicioEditar").value.trim();
        servicio.descripcion = document.getElementById("descripcionServicioEditar").value.trim();
        servicio.precio = Number(document.getElementById("precioServicioEditar").value);

        const nuevaImagen = document.getElementById("imagenServicioEditar").files[0];
        if (nuevaImagen) {
            servicio.imagen = await convertirImagenBase64(nuevaImagen);
        }

        const mensajeConfirmacion = `¿Desea guardar los cambios del servicio?\n\n` +
            `📋 Nombre: ${servicio.nombre}\n` +
            `📝 Descripción: ${servicio.descripcion.substring(0, 50)}...\n` +
            `💰 Precio: ${formatearPrecio(servicio.precio)}`;

        if (!confirm(mensajeConfirmacion)) {
            return;
        }

        localStorage.setItem("listaServicios", JSON.stringify(listaServicios));

        const mensaje = document.getElementById("mensajeEditar");
        if (mensaje) {
            mensaje.textContent = "✅ Servicio actualizado correctamente";
            mensaje.className = "exito";
            mensaje.style.display = "block";
        }

        renderizarServicios();
        if (modalEditarServicio) modalEditarServicio.classList.remove("activo");
        indiceServicioEditar = null;

        setTimeout(() => {
            if (mensaje) {
                mensaje.style.display = "none";
                mensaje.className = "";
                mensaje.textContent = "";
            }
        }, 1500);
    });
}

// =========================
// BUSCADOR
// =========================
if (buscadorServicios) {
    buscadorServicios.addEventListener("input", function() {
        textoBusqueda = this.value.trim();
        renderizarServicios();
    });
}

// =========================
// FILTROS
// =========================
if (botonFiltroTodos) {
    botonFiltroTodos.addEventListener("click", () => {
        filtroActual = "todos";
        activarBotonFiltro(botonFiltroTodos);
        renderizarServicios();
    });
}

if (botonFiltroActivos) {
    botonFiltroActivos.addEventListener("click", () => {
        filtroActual = "activos";
        activarBotonFiltro(botonFiltroActivos);
        renderizarServicios();
    });
}

if (botonFiltroInactivos) {
    botonFiltroInactivos.addEventListener("click", () => {
        filtroActual = "inactivos";
        activarBotonFiltro(botonFiltroInactivos);
        renderizarServicios();
    });
}

if (botonLimpiarFiltros) {
    botonLimpiarFiltros.addEventListener("click", () => {
        textoBusqueda = "";
        filtroActual = "todos";
        if (buscadorServicios) buscadorServicios.value = "";
        activarBotonFiltro(botonFiltroTodos);
        renderizarServicios();
    });
}

// =========================
// CAMBIAR ESTADO SERVICIO
// =========================
window.cambiarEstadoServicio = function(idServicio) {
    const servicio = listaServicios.find(servicio => servicio.id.toString() === idServicio.toString());
    if (!servicio) return;

    const estadoActual = servicio.activo ? "Activo" : "Inactivo";
    const nuevoEstado = servicio.activo ? "Inactivo" : "Activo";

    if (confirm(`⚠️ ¿Desea cambiar el estado del servicio "${servicio.nombre}"?\n\n` +
            `Estado actual: ${estadoActual}\n` +
            `Nuevo estado: ${nuevoEstado}`)) {

        servicio.activo = !servicio.activo;
        localStorage.setItem("listaServicios", JSON.stringify(listaServicios));
        
        alert(`✅ Servicio "${servicio.nombre}" ahora está ${servicio.activo ? "Activo" : "Inactivo"}`);
        renderizarServicios();
    }
};

// =========================
// CERRAR MODALES CLICK FUERA
// =========================
window.addEventListener("click", (evento) => {
    if (evento.target === modalAgregarServicio) {
        if (modalAgregarServicio) modalAgregarServicio.classList.remove("activo");
    }
    if (evento.target === modalEditarServicio) {
        if (modalEditarServicio) modalEditarServicio.classList.remove("activo");
    }
});

// =========================
// INICIALIZACIÓN
// =========================
document.addEventListener("DOMContentLoaded", () => {
    activarBotonFiltro(botonFiltroTodos);

    const guardados = localStorage.getItem("listaServicios");

    if (guardados) {
        listaServicios = JSON.parse(guardados);
    } else {
        listaServicios = [];
        localStorage.setItem("listaServicios", JSON.stringify(listaServicios));
    }

    renderizarServicios();
    actualizarContadores();
    
    console.log("✅ Sistema de servicios inicializado");
    console.log(`📊 Total de servicios: ${listaServicios.length}`);
});

// =========================
// EXPONER FUNCIONES GLOBALES
// =========================
window.abrirModalEditarServicio = abrirModalEditarServicio;
window.cambiarEstadoServicio = cambiarEstadoServicio;
window.eliminarServicio = eliminarServicio;