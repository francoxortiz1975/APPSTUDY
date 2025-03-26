document.querySelectorAll('.button').forEach(button => {
    button.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId.startsWith("#")) {
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 50, // Ajusta el desplazamiento
                    behavior: 'smooth' // Efecto de scroll suave
                });
            }
        }
    });
});

