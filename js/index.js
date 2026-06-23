/* ================= FOOTER LOAD ================= */

document.addEventListener("DOMContentLoaded", () => {
  fetch("../footer/footer.html")
    .then(res => {
      if (!res.ok) throw new Error("No se pudo cargar footer.html");
      return res.text();
    })
    .then(data => {
      document.getElementById("footer-container").innerHTML = data;
    })
    .catch(err => console.error("ERROR FOOTER:", err));
});


/* ================= CARRUSEL ================= */

let index = 0;

function showSlide() {
  const slides = document.querySelectorAll(".slide");

  if (slides.length === 0) return;

  slides.forEach(slide => slide.classList.remove("active"));

  index++;

  if (index >= slides.length) {
    index = 0;
  }

  slides[index].classList.add("active");
}

/* cambia cada 3 segundos */
setInterval(showSlide, 3000);