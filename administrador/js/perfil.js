document.addEventListener("DOMContentLoaded", () => {

    const formulario = document.getElementById("formulario");
    const mensaje = document.getElementById("mensajeFormulario");
    const fotoInput = document.getElementById("foto");
    const preview = document.getElementById("previewFoto");

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    // 🔥 ESTA ES LA CLAVE CORRECTA (la que usa tu admin)
    let editIndex = localStorage.getItem("usuarioEditar");
    editIndex = editIndex !== null ? Number(editIndex) : null;

    let fotoBase64 = "";

    // =========================
    // CARGAR DATOS SI ESTÁ EDITANDO
    // =========================
    if (editIndex !== null && usuarios[editIndex]) {

        const u = usuarios[editIndex];

        document.getElementById("tipoDocumento").value = u.tipoDocumento;
        document.getElementById("documento").value = u.documento;
        document.getElementById("nombres").value = u.nombres;
        document.getElementById("apellidos").value = u.apellidos;
        document.getElementById("celular").value = u.celular;
        document.getElementById("direccion").value = u.direccion;
        document.getElementById("correo").value = u.correo;
        document.getElementById("ciudad").value = u.ciudad;
        document.getElementById("password").value = u.password;

        if (u.foto) {
            preview.src = u.foto;
            fotoBase64 = u.foto;
        }
    }

    // =========================
    // FOTO
    // =========================
    fotoInput.addEventListener("change", function () {
        const file = this.files[0];
        const reader = new FileReader();

        reader.onload = e => {
            fotoBase64 = e.target.result;
            preview.src = fotoBase64;
        };

        reader.readAsDataURL(file);
    });

    // =========================
    // GUARDAR (CREAR / EDITAR)
    // =========================
    formulario.addEventListener("submit", (e) => {
        e.preventDefault();

        const usuario = {
            tipoDocumento: document.getElementById("tipoDocumento").value,
            documento: document.getElementById("documento").value,
            nombres: document.getElementById("nombres").value,
            apellidos: document.getElementById("apellidos").value,
            celular: document.getElementById("celular").value,
            direccion: document.getElementById("direccion").value,
            correo: document.getElementById("correo").value,
            ciudad: document.getElementById("ciudad").value,
            password: document.getElementById("password").value,
            foto: fotoBase64
        };

        if (!usuario.nombres || !usuario.apellidos || !usuario.correo) {
            mensaje.textContent = "❌ Completa los campos obligatorios";
            mensaje.style.color = "red";
            return;
        }

        // 🔥 EDITAR
        if (editIndex !== null) {
            usuarios[editIndex] = usuario;
            localStorage.removeItem("usuarioEditar");
        } 
        // 🔥 CREAR
        else {
            usuarios.push(usuario);
        }

        localStorage.setItem("usuarios", JSON.stringify(usuarios));

        mensaje.textContent = "✔ Guardado correctamente";
        mensaje.style.color = "green";

        setTimeout(() => {
            window.location.href = "perfil_administrador.html";
        }, 1000);
    });

    // =========================
    // ELIMINAR
    // =========================
    document.getElementById("eliminarUsuario").addEventListener("click", () => {

        if (editIndex !== null) {
            usuarios.splice(editIndex, 1);
            localStorage.setItem("usuarios", JSON.stringify(usuarios));
            localStorage.removeItem("usuarioEditar");
        }

        formulario.reset();
        preview.src = "";
        mensaje.textContent = "🗑 Usuario eliminado";
        mensaje.style.color = "red";
    });

});