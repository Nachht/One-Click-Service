// ================= VARIABLES =================

const formulario = document.getElementById("formulario");

const nombre = document.getElementById("nombre");
const correo = document.getElementById("correo");
const telefono = document.getElementById("telefono");
const mensaje = document.getElementById("mensaje");
const archivo = document.getElementById("archivo");

const errorNombre = document.getElementById("errorNombre");
const errorCorreo = document.getElementById("errorCorreo");
const errorTelefono = document.getElementById("errorTelefono");
const errorMensaje = document.getElementById("errorMensaje");
const errorArchivo = document.getElementById("errorArchivo");

const mensajeFormulario =
    document.getElementById("mensajeFormulario");

// ================= MENÚ =================

const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

menuBtn.addEventListener("click", () => {
    menu.classList.toggle("activo");
});

// ================= VALIDACIÓN =================

formulario.addEventListener("submit", function (e) {

    e.preventDefault(); // SIEMPRE validamos primero

    let valido = true;

    mensajeFormulario.textContent = "";
    mensajeFormulario.className = "";

    // LIMPIAR MENSAJES
    document.querySelectorAll("small").forEach(campo => {
        campo.textContent = "";
    });

    // LIMPIAR ESTILOS
    document.querySelectorAll("input, textarea").forEach(campo => {
        campo.classList.remove("errorInput");
        campo.classList.remove("successInput");
    });

    if (archivo) {
        archivo.classList.remove("errorInput");
        archivo.classList.remove("successInput");
    }

    // ================= NOMBRE =================

    const nombreValor = nombre.value.trim();

    if (nombreValor === "") {
        errorNombre.textContent = "❌ El nombre es obligatorio";
        nombre.classList.add("errorInput");
        valido = false;

    } else if (nombreValor.length < 10) {
        errorNombre.textContent = "❌ Mínimo 10 caracteres";
        nombre.classList.add("errorInput");
        valido = false;

    } else if (nombreValor.length > 50) {
        errorNombre.textContent = "❌ Máximo 50 caracteres";
        nombre.classList.add("errorInput");
        valido = false;

    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombreValor)) {
        errorNombre.textContent = "❌ Solo letras y espacios";
        nombre.classList.add("errorInput");
        valido = false;

    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(nombreValor)) {
        errorNombre.textContent = "❌ Debe contener mayúsculas y minúsculas";
        nombre.classList.add("errorInput");
        valido = false;

    } else {
        errorNombre.textContent = "✔ Nombre válido";
        nombre.classList.add("successInput");
    }

    // ================= CORREO =================

    const correoValor = correo.value.trim();

    const regexCorreo =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|co|org|net|edu|gov|info|biz)$/i;

    if (correoValor === "") {
        errorCorreo.textContent = "❌ El correo es obligatorio";
        correo.classList.add("errorInput");
        valido = false;

    } else if (!correoValor.includes("@")) {
        errorCorreo.textContent = "❌ Debe contener el símbolo @";
        correo.classList.add("errorInput");
        valido = false;

    } else if (!regexCorreo.test(correoValor)) {
        errorCorreo.textContent =
            "❌ Ingrese un correo válido (ejemplo@gmail.com)";
        correo.classList.add("errorInput");
        valido = false;

    } else {
        errorCorreo.textContent = "✔ Correo válido";
        correo.classList.add("successInput");
    }

    // ================= TELÉFONO =================

    const telefonoValor = telefono.value.trim();

    if (telefonoValor === "") {
        errorTelefono.textContent = "❌ El teléfono es obligatorio";
        telefono.classList.add("errorInput");
        valido = false;

    } else if (!/^\d+$/.test(telefonoValor)) {
        errorTelefono.textContent = "❌ Solo se permiten números";
        telefono.classList.add("errorInput");
        valido = false;

    } else if (telefonoValor.length < 7) {
        errorTelefono.textContent = "❌ Mínimo 7 dígitos";
        telefono.classList.add("errorInput");
        valido = false;

    } else if (telefonoValor.length > 10) {
        errorTelefono.textContent = "❌ Máximo 10 dígitos";
        telefono.classList.add("errorInput");
        valido = false;

    } else {
        errorTelefono.textContent = "✔ Teléfono válido";
        telefono.classList.add("successInput");
    }

    // ================= MENSAJE =================

    const mensajeValor = mensaje.value.trim();

    if (mensajeValor === "") {
        errorMensaje.textContent = "❌ El mensaje es obligatorio";
        mensaje.classList.add("errorInput");
        valido = false;

    } else if (mensajeValor.length < 15) {
        errorMensaje.textContent = "❌ Mínimo 15 caracteres";
        mensaje.classList.add("errorInput");
        valido = false;

    } else if (mensajeValor.length > 100) {
        errorMensaje.textContent = "❌ Máximo 100 caracteres";
        mensaje.classList.add("errorInput");
        valido = false;

    } else {
        errorMensaje.textContent = "✔ Mensaje válido";
        mensaje.classList.add("successInput");
    }

    // ================= PDF (OPCIONAL) =================

    if (archivo) {

        if (archivo.files.length !== 0) {

            const pdf = archivo.files[0];

            if (pdf.type !== "application/pdf") {
                errorArchivo.textContent = "❌ Solo PDF";
                archivo.classList.add("errorInput");
                valido = false;

            } else if (pdf.size > 5000000) {
                errorArchivo.textContent = "❌ Máx 5MB";
                archivo.classList.add("errorInput");
                valido = false;

            } else {
                errorArchivo.textContent = "✔ PDF válido";
                archivo.classList.add("successInput");
            }
        }
    }

    // ================= ENVÍO FORMSPREE =================

    if (!valido) {

        mensajeFormulario.textContent =
            "❌ Corrija los campos marcados en rojo.";

        mensajeFormulario.classList.add("mensajeError");
        return;
    }

    // ✔ SI TODO ESTÁ BIEN → ENVIAR A FORMSPREE
    mensajeFormulario.textContent = "✔ Enviando mensaje...";
    mensajeFormulario.classList.add("mensajeExito");

    // permitir envío real
    formulario.submit();

});