document.addEventListener("DOMContentLoaded", () => {

    const contenedor = document.getElementById("contenedorTarjetas");

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

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

    // ======================
    // AGREGAR PERFIL
    // ======================
    document.getElementById("agregarPerfil").addEventListener("click", () => {
        localStorage.removeItem("usuarioEditar");
        window.location.href = "perfil.html";
    });

    contenedor.innerHTML = "";

    // ======================
    // SIN USUARIOS
    // ======================
    if (usuarios.length === 0) {
        contenedor.innerHTML = "<p class='sinDatos'>No hay usuarios registrados</p>";
        return;
    }

    // ======================
    // TARJETAS
    // ======================
    usuarios.forEach((u, index) => {

        const card = document.createElement("div");
        card.classList.add("tarjeta");

        card.innerHTML = `
            <div class="imgBox">
                <img src="${u.foto || '../../assets/img/logo.png'}" class="fotoUsuario">
            </div>

            <div class="info">
                <h3>${u.nombres} ${u.apellidos}</h3>

                <p><strong>Documento:</strong> ${u.documento || ""}</p>
                <p><strong>Tipo:</strong> ${u.tipoDocumento || ""}</p>
                <p><strong>Correo:</strong> ${u.correo || ""}</p>
                <p><strong>Celular:</strong> ${u.celular || ""}</p>
                <p><strong>Dirección:</strong> ${u.direccion || ""}</p>
                <p><strong>Ciudad:</strong> ${u.ciudad || ""}</p>
            </div>

            <div class="acciones">
                <button class="editar">Editar</button>
                <button class="eliminar">Eliminar</button>
            </div>
        `;

        // ======================
        // EDITAR
        // ======================
        card.querySelector(".editar").addEventListener("click", () => {
            localStorage.setItem("usuarioEditar", index);
            window.location.href = "perfil.html";
        });

        // ======================
        // ELIMINAR
        // ======================
        card.querySelector(".eliminar").addEventListener("click", () => {
            usuarios.splice(index, 1);
            localStorage.setItem("usuarios", JSON.stringify(usuarios));
            location.reload();
        });

        contenedor.appendChild(card);
    });

});