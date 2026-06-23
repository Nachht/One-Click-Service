document.addEventListener("DOMContentLoaded", () => {

  fetch("../footer/footer.html")
    .then(res => res.text())
    .then(data => {
      document.body.insertAdjacentHTML("beforeend", data);
    });

});