// Gestion du menu et sous-menus
document.addEventListener('DOMContentLoaded', function() {
    // Afficher/masquer les sous-menus au clic
    const menuItems = document.querySelectorAll('.has-submenu > a');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const parent = this.parentElement;
            parent.classList.toggle('active');
            
            // Si on est en mode mobile, on ajuste le scroll
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    parent.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        });
    });
   // Gestion du formulaire de contact avec l'API Vercel
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Simuler l'envoi du formulaire
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        submitButton.textContent = 'Envoi en cours...';
        submitButton.disabled = true;
        
        // Récupérer les valeurs du formulaire
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };
        
        // Envoi des données à l'API
        fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Afficher un message de succès
                const formContainer = contactForm.parentElement;
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.innerHTML = '<h3>Message envoyé !</h3><p>Merci pour votre message. Nous vous répondrons dans les plus brefs délais.</p>';
                
                // Remplacer le formulaire par le message de succès
                formContainer.innerHTML = '';
                formContainer.appendChild(successMessage);
                
                // Réinitialiser le formulaire (pour référence future)
                contactForm.reset();
            } else {
                throw new Error(data.error || 'Une erreur s\'est produite');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            alert('Une erreur s\'est produite lors de l\'envoi de votre message. Veuillez réessayer.');
        });
    });
}
    // Adaptation mobile pour la sidebar
    function adjustSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const container = document.querySelector('.container');
        
        if (window.innerWidth <= 768) {
            sidebar.style.height = 'auto';
            container.style.minHeight = 'auto';
        } else {
            sidebar.style.height = '100vh';
            container.style.minHeight = '100vh';
        }
    }
    
    // Ajuster la sidebar au chargement et au redimensionnement
    window.addEventListener('resize', adjustSidebar);
    adjustSidebar();

    
});