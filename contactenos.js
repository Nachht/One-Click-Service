const formulario = document.getElementById("formulario");

const nombre = document.getElementById("nombre");
const correo = document.getElementById("correo");
const telefono = document.getElementById("telefono");
const mensaje = document.getElementById("mensaje");

const errorNombre = document.getElementById("errorNombre");
const errorCorreo = document.getElementById("errorCorreo");
const errorTelefono = document.getElementById("errorTelefono");
const errorMensaje = document.getElementById("errorMensaje");

formulario.addEventListener("submit", function(e){
e.preventDefault();

let valido = true;

// NOMBRE
if(!/^[a-zA-ZÀ-ÿ\s]+$/.test(nombre.value.trim())){
errorNombre.textContent = "❌ Solo letras";
nombre.classList.add("errorInput");
valido = false;
} else {
errorNombre.textContent = "✔ Correcto";
nombre.classList.add("successInput");
}

// CORREO
const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if(!regex.test(correo.value)){
errorCorreo.textContent = "❌ Correo inválido";
correo.classList.add("errorInput");
valido = false;
} else {
errorCorreo.textContent = "✔ Correcto";
correo.classList.add("successInput");
}

// TELEFONO
if(!/^\d{7,10}$/.test(telefono.value)){
errorTelefono.textContent = "❌ Solo números";
telefono.classList.add("errorInput");
valido = false;
} else {
errorTelefono.textContent = "✔ Correcto";
telefono.classList.add("successInput");
}

// MENSAJE
if(mensaje.value.trim().length < 10){
errorMensaje.textContent = "❌ Mínimo 10 caracteres";
mensaje.classList.add("errorInput");
valido = false;
} else {
errorMensaje.textContent = "✔ Correcto";
mensaje.classList.add("successInput");
}

// ENVIAR
if(valido){
alert("Mensaje enviado correctamente");
formulario.reset();

document.querySelectorAll("input, textarea").forEach(el=>{
el.classList.remove("errorInput","successInput");
});

document.querySelectorAll("small").forEach(el=>{
el.textContent="";
});
}
});

/* MENÚ */
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

menuBtn.addEventListener("click", ()=>{
menu.classList.toggle("activo");
});