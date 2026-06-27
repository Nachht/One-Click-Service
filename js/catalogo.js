// ================= MENÚ =================

const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

menuBtn.addEventListener("click", () => {
    menu.classList.toggle("activo");
});


// Variables 
const contenedorServicios = document.getElementById("servicesGrid");

const inputBusqueda = document.getElementById("searchInput");
const totalServicios = document.getElementById("totalCount");
const serviciosVisibles = document.getElementById("visibleCount");

let listaServicios = [];
let textoBusqueda = "";


// Formatear precio
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

// cargar servicios
document.addEventListener("DOMContentLoaded", () => {

    const serviciosGuardados = localStorage.getItem("listaServicios");

    if (serviciosGuardados) {
        listaServicios = JSON.parse(serviciosGuardados);

    } else {
        listaServicios = [];
    }

    renderizarServicios();
    actualizarContadores();
});

// buscador
inputBusqueda.addEventListener("input", function () {
    textoBusqueda = this.value.trim();

    renderizarServicios();
});

// Renderizar servicios
function renderizarServicios() {

    contenedorServicios.innerHTML = "";
    const serviciosActivos = listaServicios.filter(servicio => {
        const coincideBusqueda =

            servicio.nombre.toLowerCase().includes(textoBusqueda.toLowerCase())

            ||

            servicio.descripcion.toLowerCase().includes(textoBusqueda.toLowerCase());
        return servicio.activo && coincideBusqueda;
    });

    serviciosVisibles.textContent = serviciosActivos.length;
    totalServicios.textContent = listaServicios.filter(servicio => servicio.activo).length;

    if (serviciosActivos.length === 0) {
        contenedorServicios.innerHTML = `

            <div class="col-12 text-center mt-5">

                <h3>No hay servicios disponibles.</h3>

            </div>

        `;
        return;
    }

    serviciosActivos.forEach(servicio => {
        contenedorServicios.innerHTML += `

            <div class="col-lg-4 col-md-6 col-12">

                <div class="service-card">

                    <div class="service-img-container">

                        <img
                            src="${servicio.imagen}"
                            alt="${servicio.nombre}"
                        >

                    </div>

                    <div class="text-center mt-4">

                        <h3 class="service-card-title">

                            ${servicio.nombre}

                        </h3>

                        <p class="service-card-desc">

                            ${servicio.descripcion}

                        </p>

                        <div class="service-card-price">

                            ${formatearPrecio(servicio.precio)}

                        </div>

                        <button class="btn btn-primary mt-3">

                            Solicitar servicio

                        </button>

                    </div>

                </div>

            </div>

        `;

    });

}


// contadores
function actualizarContadores() {

    const activos = listaServicios.filter(servicio => servicio.activo).length;

    totalServicios.textContent = activos;
    serviciosVisibles.textContent = activos;

}