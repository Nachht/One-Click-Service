document.addEventListener("DOMContentLoaded", function() {

    // =========================
    // ELEMENTOS DEL DOM
    // =========================
    const formulario = document.getElementById("formulario");
    const mensaje = document.getElementById("mensajeFormulario");
    const fotoInput = document.getElementById("foto");
    const preview = document.getElementById("previewFoto");
    const tipoUsuario = document.getElementById("tipoUsuario");
    const servicioGroup = document.getElementById("servicioGroup");
    const servicioSelect = document.getElementById("servicio");

    // =========================
    // MOSTRAR/OCULTAR SERVICIO SEGÚN TIPO DE USUARIO
    // =========================
    tipoUsuario.addEventListener("change", function() {
        if (this.value === "empleado") {
            servicioGroup.style.display = "block";
            servicioSelect.required = true;
            if (servicioSelect.value) {
                validarCampo('servicio');
            }
        } else {
            servicioGroup.style.display = "none";
            servicioSelect.required = false;
            servicioSelect.value = "";
            const errorServicio = document.getElementById("error-servicio");
            const exitoServicio = document.getElementById("exito-servicio");
            const iconoServicio = document.getElementById("icono-servicio");
            if (errorServicio) {
                errorServicio.classList.remove("visible");
                errorServicio.textContent = "";
            }
            if (exitoServicio) {
                exitoServicio.classList.remove("visible");
            }
            if (iconoServicio) {
                iconoServicio.classList.remove("visible");
                iconoServicio.textContent = "";
            }
            servicioSelect.classList.remove("successInput", "errorInput");
        }
        validarCampo('tipoUsuario');
        actualizarBotonSubmit();
    });

    // =========================
    // VARIABLES GLOBALES
    // =========================
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    let editIndex = localStorage.getItem("usuarioEditar");
    editIndex = editIndex !== null ? Number(editIndex) : null;
    let fotoBase64 = "";

    console.log("Editando índice:", editIndex);
    console.log("Usuarios actuales:", usuarios);

    // =========================
    // CONFIGURACIÓN DE VALIDACIONES POR TIPO DE DOCUMENTO
    // =========================
    const validacionesDocumento = {
        cedula: {
            regex: /^\d+$/,
            min: 5,
            max: 10,
            mensaje: "La cédula debe tener entre 5 y 10 dígitos numéricos"
        },
        extranjeria: {
            regex: /^[A-Za-z0-9]+$/,
            min: 6,
            max: 11,
            mensaje: "La cédula de extranjería debe tener entre 6 y 11 caracteres alfanuméricos"
        },
        pasaporte: {
            regex: /^[A-Za-z0-9]+$/,
            min: 6,
            max: 20,
            mensaje: "El pasaporte debe tener entre 6 y 20 caracteres alfanuméricos"
        },
        extranjero: {
            regex: /^[A-Za-z0-9]+$/,
            min: 6,
            max: 20,
            mensaje: "El documento extranjero debe tener entre 6 y 20 caracteres alfanuméricos"
        }
    };

    // =========================
    // CONFIGURACIÓN DE VALIDACIONES GENERALES
    // =========================
    const validaciones = {
        tipoDocumento: {
            validar: (valor) => valor !== "",
            mensaje: "Seleccione un tipo de documento válido"
        },
        tipoUsuario: {
            validar: (valor) => valor !== "",
            mensaje: "Seleccione un tipo de usuario"
        },
        servicio: {
            validar: (valor) => {
                const tipo = document.getElementById("tipoUsuario").value;
                if (tipo === "empleado") {
                    return valor !== "";
                }
                return true;
            },
            mensaje: "Seleccione un servicio"
        },
        nombres: {
            regex: /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/,
            min: 3,
            max: 15,
            mensaje: "Los nombres deben tener entre 3 y 15 caracteres y solo letras"
        },
        apellidos: {
            regex: /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/,
            min: 5,
            max: 125,
            mensaje: "Los apellidos deben tener entre 5 y 125 caracteres y solo letras"
        },
        celular: {
            regex: /^\d+$/,
            min: 7,
            max: 10,
            mensaje: "El celular debe tener entre 7 y 10 dígitos numéricos"
        },
        direccion: {
            regex: /^[A-Za-z0-9ÁÉÍÓÚáéíóúñÑ#\-\s,.]+$/,
            min: 5,
            max: 100,
            mensaje: "Ingrese una dirección válida (ej: Calle 123 #45-67)"
        },
        correo: {
            regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            min: 5,
            max: 100,
            mensaje: "El correo debe tener @ y una extensión válida"
        },
        ciudad: {
            regex: /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/,
            min: 3,
            max: 30,
            mensaje: "La ciudad debe tener entre 3 y 30 caracteres y solo letras"
        },
        password: {
            regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            min: 8,
            max: 100,
            mensaje: "Mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolos"
        }
    };

    // =========================
    // REFERENCIAS DE CAMPOS
    // =========================
    const campos = {};
    document.querySelectorAll("input, select").forEach(input => {
        const id = input.id;
        if (id && (validaciones[id] || id === 'documento' || id === 'tipoDocumento')) {
            campos[id] = {
                input: input,
                error: document.getElementById(`error-${id}`),
                exito: document.getElementById(`exito-${id}`),
                icono: document.getElementById(`icono-${id}`)
            };
        }
    });

    // =========================
    // ACTUALIZAR BOTÓN SUBMIT
    // =========================
    function actualizarBotonSubmit() {
        const boton = formulario.querySelector('button[type="submit"]');
        let todoValido = true;
        
        Object.keys(campos).forEach(id => {
            const valor = campos[id].input.value.trim();
            if (id === 'servicio') {
                const tipo = document.getElementById("tipoUsuario").value;
                if (tipo === "empleado" && valor === "") {
                    todoValido = false;
                }
            } else if (id === 'tipoUsuario') {
                if (valor === "") {
                    todoValido = false;
                }
            } else if (id === 'tipoDocumento') {
                if (valor === "") {
                    todoValido = false;
                }
            } else if (valor === "") {
                todoValido = false;
            }
        });

        if (boton) {
            boton.disabled = !todoValido;
        }
    }

    // =========================
    // FUNCIÓN DE VALIDACIÓN
    // =========================
    function validarCampo(id) {
        const campo = campos[id];
        if (!campo) return false;

        const valor = campo.input.value.trim();
        let esValido = true;
        let mensajeError = "";

        if (id === 'tipoDocumento') {
            esValido = valor !== "";
            mensajeError = esValido ? "" : "Seleccione un tipo de documento válido";
        }
        else if (id === 'tipoUsuario') {
            esValido = valor !== "";
            mensajeError = esValido ? "" : "Seleccione un tipo de usuario";
            if (valor === "empleado") {
                servicioGroup.style.display = "block";
                servicioSelect.required = true;
            } else {
                servicioGroup.style.display = "none";
                servicioSelect.required = false;
                servicioSelect.value = "";
                const errorServicio = document.getElementById("error-servicio");
                const exitoServicio = document.getElementById("exito-servicio");
                const iconoServicio = document.getElementById("icono-servicio");
                if (errorServicio) {
                    errorServicio.classList.remove("visible");
                    errorServicio.textContent = "";
                }
                if (exitoServicio) {
                    exitoServicio.classList.remove("visible");
                }
                if (iconoServicio) {
                    iconoServicio.classList.remove("visible");
                    iconoServicio.textContent = "";
                }
                servicioSelect.classList.remove("successInput", "errorInput");
            }
        }
        else if (id === 'servicio') {
            const tipo = document.getElementById("tipoUsuario").value;
            if (tipo === "empleado") {
                esValido = valor !== "";
                mensajeError = esValido ? "" : "Seleccione un servicio";
            } else {
                esValido = true;
                mensajeError = "";
            }
        }
        else if (id === 'documento') {
            const tipoSeleccionado = document.getElementById("tipoDocumento").value;
            if (!tipoSeleccionado) {
                esValido = false;
                mensajeError = "Seleccione primero un tipo de documento";
            } else {
                const config = validacionesDocumento[tipoSeleccionado];
                if (!config) {
                    esValido = false;
                    mensajeError = "Tipo de documento no válido";
                } else if (valor.length === 0) {
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
            }
        }
        else {
            const config = validaciones[id];
            if (!config) return false;

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
        }

        const input = campo.input;
        const errorEl = campo.error;
        const exitoEl = campo.exito;
        const iconoEl = campo.icono;

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
                errorEl.textContent = mensajeError || "Campo inválido";
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

        actualizarBotonSubmit();
        return esValido;
    }

    // =========================
    // EVENTOS DE VALIDACIÓN
    // =========================
    Object.keys(campos).forEach(id => {
        const input = campos[id].input;
        input.addEventListener("input", function() {
            validarCampo(id);
            if (id === 'tipoDocumento') {
                const docInput = document.getElementById("documento");
                if (docInput.value.trim()) {
                    validarCampo('documento');
                }
            }
            if (id === 'tipoUsuario') {
                if (this.value === "empleado") {
                }
            }
            actualizarBotonSubmit();
        });
        input.addEventListener("blur", function() {
            validarCampo(id);
            actualizarBotonSubmit();
        });
        input.addEventListener("change", function() {
            validarCampo(id);
            if (id === 'tipoUsuario') {
                if (this.value === "empleado") {
                    if (servicioSelect.value) {
                        validarCampo('servicio');
                    }
                }
            }
            actualizarBotonSubmit();
        });
    });

    // =========================
    // CARGAR DATOS PARA EDITAR
    // =========================
    if (editIndex !== null && usuarios[editIndex]) {
        const u = usuarios[editIndex];
        document.getElementById("tipoDocumento").value = u.tipoDocumento || "";
        document.getElementById("documento").value = u.documento || "";
        document.getElementById("nombres").value = u.nombres || "";
        document.getElementById("apellidos").value = u.apellidos || "";
        document.getElementById("celular").value = u.celular || "";
        document.getElementById("direccion").value = u.direccion || "";
        document.getElementById("correo").value = u.correo || "";
        document.getElementById("ciudad").value = u.ciudad || "";
        document.getElementById("tipoUsuario").value = u.tipoUsuario || "";
        document.getElementById("servicio").value = u.servicio || "";
        document.getElementById("password").value = u.password || "";
        
        if (u.tipoUsuario === "empleado") {
            servicioGroup.style.display = "block";
        }
        
        if (u.foto) {
            preview.src = u.foto;
            fotoBase64 = u.foto;
        }
        setTimeout(() => {
            Object.keys(campos).forEach(id => {
                if (campos[id].input.value) validarCampo(id);
            });
            actualizarBotonSubmit();
        }, 100);
    }

    // =========================
    // FOTO - CON COMPRESIÓN
    // =========================
    fotoInput.addEventListener("change", function(e) {
        const file = this.files[0];
        const mensajeFoto = document.getElementById("mensajeFoto");
        
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                mensajeFoto.textContent = "⚠️ La imagen no debe superar los 2MB";
                mensajeFoto.style.color = "#e53935";
                this.value = "";
                preview.src = "";
                fotoBase64 = "";
                return;
            }
            
            const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
            if (!tiposPermitidos.includes(file.type)) {
                mensajeFoto.textContent = "⚠️ Solo se permiten JPG, PNG o WEBP";
                mensajeFoto.style.color = "#e53935";
                this.value = "";
                preview.src = "";
                fotoBase64 = "";
                return;
            }
            
            mensajeFoto.textContent = "⏳ Procesando imagen...";
            mensajeFoto.style.color = "#6C2BD9";

            comprimirImagen(file, 300, 300, 0.7, function(imagenComprimida) {
                fotoBase64 = imagenComprimida;
                preview.src = imagenComprimida;
                mensajeFoto.textContent = "✅ Imagen válida y comprimida";
                mensajeFoto.style.color = "#43a047";
                console.log("✅ Imagen comprimida y guardada en base64");
            });
        }
    });

    // =========================
    // FUNCIÓN PARA COMPRIMIR IMAGEN
    // =========================
    function comprimirImagen(file, maxWidth, maxHeight, quality, callback) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const imagenComprimida = canvas.toDataURL('image/jpeg', quality);
                callback(imagenComprimida);
            };
        };
    }

    // =========================
    // GUARDAR DATOS
    // =========================
    function guardarDatos() {
        let todoValido = true;
        Object.keys(campos).forEach(id => {
            if (!validarCampo(id)) {
                todoValido = false;
            }
        });

        const tipo = document.getElementById("tipoUsuario").value;
        if (tipo === "empleado") {
            const servicio = document.getElementById("servicio").value;
            if (!servicio) {
                todoValido = false;
                const errorServicio = document.getElementById("error-servicio");
                if (errorServicio) {
                    errorServicio.textContent = "Seleccione un servicio";
                    errorServicio.classList.add("visible");
                }
            }
        }

        if (!todoValido) {
            mensaje.textContent = "❌ Por favor, corrija los campos marcados en rojo";
            mensaje.className = "error";
            mensaje.style.display = "block";
            return false;
        }

        const usuario = {
            tipoDocumento: document.getElementById("tipoDocumento").value,
            documento: document.getElementById("documento").value,
            nombres: document.getElementById("nombres").value,
            apellidos: document.getElementById("apellidos").value,
            celular: document.getElementById("celular").value,
            direccion: document.getElementById("direccion").value,
            correo: document.getElementById("correo").value,
            ciudad: document.getElementById("ciudad").value,
            tipoUsuario: document.getElementById("tipoUsuario").value,
            servicio: document.getElementById("servicio").value,
            password: document.getElementById("password").value,
            foto: fotoBase64
        };

        console.log("Datos a guardar:", usuario);

        const existe = usuarios.some((u, i) => 
            u.documento === usuario.documento && i !== parseInt(editIndex)
        );

        if (existe) {
            mensaje.textContent = "⚠️ Ya existe un usuario con este número de documento";
            mensaje.className = "error";
            mensaje.style.display = "block";
            return false;
        }

        const mensajeConfirmacion = `¿Desea guardar estos datos?\n\n` +
            `📋 Tipo: ${usuario.tipoDocumento}\n` +
            `📄 Documento: ${usuario.documento}\n` +
            `👤 Nombres: ${usuario.nombres}\n` +
            `👤 Apellidos: ${usuario.apellidos}\n` +
            `📱 Celular: ${usuario.celular}\n` +
            `🏠 Dirección: ${usuario.direccion}\n` +
            `📧 Correo: ${usuario.correo}\n` +
            `🏙️ Ciudad: ${usuario.ciudad}\n` +
            `👥 Tipo: ${usuario.tipoUsuario === 'cliente' ? '👤 Cliente' : '👔 Empleado'}\n` +
            `${usuario.tipoUsuario === 'empleado' ? `🔧 Servicio: ${usuario.servicio.charAt(0).toUpperCase() + usuario.servicio.slice(1)}` : ''}\n` +
            `🖼️ Foto: ${fotoBase64 ? '✅ Seleccionada' : '❌ Sin foto'}`;

        if (!confirm(mensajeConfirmacion)) {
            return false;
        }

        if (editIndex !== null) {
            usuarios[editIndex] = usuario;
            localStorage.removeItem("usuarioEditar");
        } else {
            usuarios.push(usuario);
        }

        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        
        const verificar = JSON.parse(localStorage.getItem("usuarios"));
        console.log("✅ Datos guardados en localStorage:", verificar);

        mensaje.textContent = "✅ Datos guardados correctamente";
        mensaje.className = "exito";
        mensaje.style.display = "block";

        setTimeout(() => {
            window.location.href = "perfil_administrador.html";
        }, 1500);

        return true;
    }

    // =========================
    // EVENTO SUBMIT
    // =========================
    formulario.addEventListener("submit", function(e) {
        e.preventDefault();
        console.log("✅ Formulario enviado");
        guardarDatos();
    });

    // =========================
    // BOTÓN ELIMINAR (en el formulario)
    // =========================
    const eliminarBtn = document.getElementById("eliminarUsuario");
    if (eliminarBtn) {
        eliminarBtn.addEventListener("click", function(e) {
            e.preventDefault();
            if (editIndex === null) {
                alert("No hay usuario seleccionado para eliminar");
                return;
            }
            const usuario = usuarios[editIndex];
            const nombreUsuario = `${usuario.nombres} ${usuario.apellidos}`;
            
            // Confirmación doble para eliminar desde el formulario
            if (confirm(`⚠️ ¿Desea eliminar el usuario "${nombreUsuario}"?\n\nEsta acción eliminará permanentemente todos sus datos.`)) {
                if (confirm(`❌ ¿Está SEGURO de eliminar a "${nombreUsuario}"?\n\nEsta acción NO se puede deshacer.`)) {
                    usuarios.splice(editIndex, 1);
                    localStorage.setItem("usuarios", JSON.stringify(usuarios));
                    localStorage.removeItem("usuarioEditar");
                    formulario.reset();
                    preview.src = "";
                    fotoBase64 = "";
                    servicioGroup.style.display = "none";
                    mensaje.textContent = `✅ Usuario "${nombreUsuario}" eliminado correctamente`;
                    mensaje.className = "exito";
                    mensaje.style.display = "block";
                    setTimeout(() => {
                        window.location.href = "perfil_administrador.html";
                    }, 1500);
                } else {
                    alert(`❌ Eliminación cancelada para "${nombreUsuario}"`);
                }
            } else {
                alert(`❌ Eliminación cancelada para "${nombreUsuario}"`);
            }
        });
    }

    // =========================
    // BOTÓN VOLVER CON CONFIRMACIÓN
    // =========================
    const volverBtn = document.querySelector(".volver");
    if (volverBtn) {
        volverBtn.addEventListener("click", function(e) {
            e.preventDefault();
            if (confirm("⚠️ ¿Desea cancelar y perder los cambios realizados?")) {
                localStorage.removeItem("usuarioEditar");
                window.location.href = "perfil_administrador.html";
            }
        });
    }

});