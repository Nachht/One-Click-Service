document.addEventListener("DOMContentLoaded", () => {

    const footer = document.getElementById("footer-container");
    if (!footer) return;

    fetch("../footer/footer_admin.html")
        .then(res => res.text())
        .then(data => {
            footer.innerHTML = data;
        })
        .catch(() => {
            fetch("../../footer/footer_admin.html")
                .then(res => res.text())
                .then(data => {
                    footer.innerHTML = data;
                });
        });

});