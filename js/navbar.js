document.addEventListener("DOMContentLoaded", () => {

    fetch("../navbar/navbar.html")
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el navbar");
            }
            return response.text();
        })
        .then(data => {
            document.body.insertAdjacentHTML("afterbegin", data);

            // Activar menú después de cargar el HTML
            const menuBtn = document.getElementById("menuBtn");
            const menu = document.getElementById("menu");

            if (menuBtn && menu) {
                menuBtn.addEventListener("click", () => {
                    menu.classList.toggle("activo");
                });
            }
        })
        .catch(error => console.error("Error cargando navbar:", error));

});