// ============================================
// INICIO DE SESIÓN - VERSIÓN MEJORADA
// ============================================

const formulario = document.getElementById("formularioLogin");
const mensajeFormulario = document.getElementById("mensajeFormulario");

const correo = document.getElementById("correo");
const password = document.getElementById("password");
const mostrarPassword = document.getElementById("mostrarPassword")

const errorCorreo = document.getElementById("errorCorreo");
const errorPassword = document.getElementById("errorPassword");

// Mostrar y ocultar contraseña
mostrarPassword.addEventListener("click", () => {
    if (password.type === "password") {
        password.type = "text";
        mostrarPassword.innerHTML = '<i class="bi bi-eye-slash"></i>';
    } else {
        password.type = "password";
        mostrarPassword.innerHTML = '<i class="bi bi-eye"></i>';
    }
});

// ============================================
// INICIAR SESIÓN (USANDO AUTH-SERVICE)
// ============================================
formulario.addEventListener("submit", async function (e) {
    e.preventDefault();

    let valido = true;

    // Limpiar mensajes
    mensajeFormulario.textContent = "";
    mensajeFormulario.className = "";
    errorCorreo.textContent = "";
    errorPassword.textContent = "";

    correo.classList.remove("errorInput", "successInput");
    password.classList.remove("errorInput", "successInput");

    const correoValor = correo.value.trim();
    const passwordValor = password.value.trim();

    // Validaciones
    if (correoValor === "") {
        errorCorreo.className = "mensajeErrorCampo";
        errorCorreo.innerHTML = '<i class="bi bi-exclamation-circle-fill"></i> Debe ingresar su correo.';
        correo.classList.add("errorInput");
        valido = false;
    }

    if (passwordValor === "") {
        errorPassword.className = "mensajeErrorCampo";
        errorPassword.innerHTML = '<i class="bi bi-exclamation-circle-fill"></i> Debe ingresar su contraseña.';
        password.classList.add("errorInput");
        valido = false;
    }

    if (!valido) {
        mensajeFormulario.className = "mensajeError";
        mensajeFormulario.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Complete los campos obligatorios.';
        return;
    }

    // Mostrar estado de carga
    const btnLogin = document.querySelector('.botonIngresar');
    const textoOriginal = btnLogin.textContent;
    btnLogin.disabled = true;
    btnLogin.textContent = 'Verificando...';

    // 🔥 USAR AUTH-SERVICE MEJORADO
    const result = await login(correoValor, passwordValor);

    // Restaurar botón
    btnLogin.disabled = false;
    btnLogin.textContent = textoOriginal;

    if (result.success) {
        // ✅ Login exitoso
        correo.classList.add("successInput");
        password.classList.add("successInput");

        mensajeFormulario.className = "mensajeExito";
        mensajeFormulario.innerHTML = '<i class="bi bi-check-circle-fill"></i> ¡Bienvenido! Redirigiendo...';

        // Guardar en localStorage
        if (result.data?.usuario) {
            const usuario = result.data.usuario;
            localStorage.setItem('usuario', JSON.stringify(usuario));
            localStorage.setItem('usuarioActivo', JSON.stringify(usuario));
            localStorage.setItem('kumo_usuario', JSON.stringify(usuario));
            localStorage.setItem('token', result.data.token);
            
            console.log('✅ Usuario guardado:', usuario);
        }

        setTimeout(() => {
            window.location.href = "../inicio/index.html";
        }, 1500);
    } else {
        //Error en el login - MOSTRAR MENSAJE AMIGABLE
        const errorMsg = result.error || 'Error al iniciar sesión';
        
        console.log('Error de login:', errorMsg);
        
        // Limpiar mensajes anteriores
        errorCorreo.textContent = "";
        errorPassword.textContent = "";
        mensajeFormulario.className = "";
        
        // Mostrar error en el campo correspondiente
        if (errorMsg.toLowerCase().includes('correo') || 
            errorMsg.toLowerCase().includes('email') ||
            errorMsg.toLowerCase().includes('registrado') ||
            errorMsg.toLowerCase().includes('no existe')) {
            errorCorreo.className = "mensajeErrorCampo";
            errorCorreo.innerHTML = `<i class="bi bi-exclamation-circle-fill"></i> ${errorMsg}`;
            correo.classList.add("errorInput");
            password.classList.remove("errorInput");
        } else if (errorMsg.toLowerCase().includes('contraseña') || 
                   errorMsg.toLowerCase().includes('password') ||
                   errorMsg.toLowerCase().includes('incorrecta')) {
            errorPassword.className = "mensajeErrorCampo";
            errorPassword.innerHTML = `<i class="bi bi-exclamation-circle-fill"></i> ${errorMsg}`;
            password.classList.add("errorInput");
            correo.classList.remove("errorInput");
        } else {
            // Error general
            mensajeFormulario.className = "mensajeError";
            mensajeFormulario.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> ${errorMsg}`;
            correo.classList.add("errorInput");
            password.classList.add("errorInput");
        }
    }
});

// ============================================
// VALIDACIÓN EN TIEMPO REAL
// ============================================
correo.addEventListener('input', function() {
    if (this.value.trim() !== '') {
        errorCorreo.textContent = '';
        errorCorreo.className = '';
        this.classList.remove('errorInput');
        this.classList.add('successInput');
    } else {
        this.classList.remove('successInput');
        this.classList.remove('errorInput');
    }
});

password.addEventListener('input', function() {
    if (this.value.trim() !== '') {
        errorPassword.textContent = '';
        errorPassword.className = '';
        this.classList.remove('errorInput');
        this.classList.add('successInput');
    } else {
        this.classList.remove('successInput');
        this.classList.remove('errorInput');
    }
});