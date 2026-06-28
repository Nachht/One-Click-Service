document.addEventListener("DOMContentLoaded", function() {
    const contenedor = document.getElementById("contenedorTarjetas");
    const totalUsuariosSpan = document.getElementById("totalUsuarios");
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    console.log("Usuarios en localStorage:", usuarios);
    console.log("Cantidad de usuarios:", usuarios.length);

    // =========================
    // MENÚ HAMBURGUESA
    // =========================
    const menuBtn = document.getElementById("menuBtn");
    const menu = document.getElementById("menu");
    if (menuBtn && menu) {
        menuBtn.addEventListener("click", function() {
            menu.classList.toggle("activo");
        });

        // Cerrar menú al hacer clic en un enlace
        menu.querySelectorAll("a").forEach(function(enlace) {
            enlace.addEventListener("click", function() {
                menu.classList.remove("activo");
            });
        });
    }

    // =========================
    // ACTUALIZAR TOTAL DE USUARIOS
    // =========================
    if (totalUsuariosSpan) {
        totalUsuariosSpan.textContent = usuarios.length;
    }

    // =========================
    // BOTÓN AGREGAR PERFIL
    // =========================
    const agregarBtn = document.getElementById("agregarPerfil");
    if (agregarBtn) {
        agregarBtn.addEventListener("click", function() {
            if (confirm("➕ ¿Desea agregar un nuevo usuario?\n\nSe abrirá el formulario para crear un nuevo perfil.")) {
                localStorage.removeItem("usuarioEditar");
                window.location.href = "perfil.html";
            }
        });
    }

    contenedor.innerHTML = "";

    // =========================
    // SIN USUARIOS
    // =========================
    if (usuarios.length === 0) {
        contenedor.innerHTML = `
            <div class="sin-datos">
                <p>📋 No hay usuarios registrados</p>
                <p class="sub">Haz clic en "Agregar Usuario" para crear uno nuevo</p>
            </div>
        `;
        return;
    }

    // =========================
    // MOSTRAR TARJETAS
    // =========================
    usuarios.forEach(function(u, index) {
        const card = document.createElement("div");
        card.classList.add("tarjeta");

        const fotoUrl = u.foto && u.foto.length > 100 ? u.foto : '../../assets/img/logo.png';

        let badgeHtml = '';
        if (u.tipoUsuario === 'empleado') {
            badgeHtml = `<span class="badge empleado">👔 Empleado</span>`;
        } else if (u.tipoUsuario === 'cliente') {
            badgeHtml = `<span class="badge cliente">👤 Cliente</span>`;
        } else {
            badgeHtml = `<span class="badge">❓ Sin tipo</span>`;
        }

        let servicioHtml = '';
        if (u.tipoUsuario === 'empleado' && u.servicio) {
            const servicios = {
                'limpieza': '🧹 Limpieza',
                'seguridad': '🔒 Seguridad',
                'mantenimiento': '🔧 Mantenimiento',
                'jardineria': '🌿 Jardinería',
                'cocina': '🍳 Cocina',
                'recepcion': '📋 Recepción',
                'mensajeria': '📦 Mensajería',
                'transporte': '🚗 Transporte',
                'otro': '📌 Otro'
            };
            const servicioNombre = servicios[u.servicio] || u.servicio;
            servicioHtml = `<p><strong>🔧 Servicio:</strong> ${servicioNombre}</p>`;
        }

        card.innerHTML = `
            <div class="imgBox">
                <img src="${fotoUrl}" class="fotoUsuario" alt="Foto de ${u.nombres}" 
                     onerror="this.src='../../assets/img/logo.png'">
            </div>
            <div class="info">
                <h3>${u.nombres || ''} ${u.apellidos || ''}</h3>
                ${badgeHtml}
                <p><strong>📄 Documento:</strong> ${u.documento || ''}</p>
                <p><strong>📋 Tipo:</strong> ${u.tipoDocumento || ''}</p>
                <p><strong>📧 Correo:</strong> ${u.correo || ''}</p>
                <p><strong>📱 Celular:</strong> ${u.celular || ''}</p>
                <p><strong>🏠 Dirección:</strong> ${u.direccion || ''}</p>
                <p><strong>🏙️ Ciudad:</strong> ${u.ciudad || ''}</p>
                ${servicioHtml}
            </div>
            <div class="acciones">
                <button class="editar">✏️ Editar</button>
                <button class="eliminar">🗑️ Eliminar</button>
            </div>
        `;

        // =========================
        // EDITAR CON CONFIRMACIÓN
        // =========================
        card.querySelector(".editar").addEventListener("click", function() {
            const nombreUsuario = `${u.nombres} ${u.apellidos}`;

            const confirmarEditar = confirm(
                `✏️ ¿Desea editar el perfil de "${nombreUsuario}"?\n\n` +
                `📄 Documento: ${u.documento}\n` +
                `📧 Correo: ${u.correo}\n\n` +
                `Se abrirá el formulario para modificar sus datos.`
            );

            if (confirmarEditar) {
                localStorage.setItem("usuarioEditar", index);
                window.location.href = "perfil.html";
            }
        });

        // =========================
        // ELIMINAR CON CONFIRMACIÓN (DOBLE)
        // =========================
        card.querySelector(".eliminar").addEventListener("click", function() {
            const nombreUsuario = `${u.nombres} ${u.apellidos}`;

            const confirmarEliminar = confirm(
                `⚠️ ¿Desea eliminar el usuario "${nombreUsuario}"?\n\n` +
                `📄 Documento: ${u.documento}\n` +
                `📧 Correo: ${u.correo}\n\n` +
                `Esta acción eliminará permanentemente todos sus datos.`
            );

            if (confirmarEliminar) {
                const confirmarSeguro = confirm(
                    `❌ ¿Está SEGURO de eliminar a "${nombreUsuario}"?\n\n` +
                    `Esta acción NO se puede deshacer.\n\n` +
                    `Todos los datos del usuario serán eliminados permanentemente.`
                );

                if (confirmarSeguro) {
                    usuarios.splice(index, 1);
                    localStorage.setItem("usuarios", JSON.stringify(usuarios));

                    alert(`✅ Usuario "${nombreUsuario}" eliminado correctamente`);
                    location.reload();
                } else {
                    alert(`❌ Eliminación cancelada para "${nombreUsuario}"`);
                }
            } else {
                alert(`❌ Eliminación cancelada para "${nombreUsuario}"`);
            }
        });

        contenedor.appendChild(card);
    });

    // =========================
    // RESUMEN EN CONSOLA
    // =========================
    console.log(`✅ Total de usuarios: ${usuarios.length}`);
    console.log(`👤 Clientes: ${usuarios.filter(u => u.tipoUsuario === 'cliente').length}`);
    console.log(`👔 Empleados: ${usuarios.filter(u => u.tipoUsuario === 'empleado').length}`);
});