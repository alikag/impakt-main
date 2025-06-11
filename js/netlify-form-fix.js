// Netlify Form Fix - Alternative approach
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    // Remove any existing submit handlers
    const newForm = contactForm.cloneNode(true);
    contactForm.parentNode.replaceChild(newForm, contactForm);
    
    // Add new submit handler
    newForm.addEventListener('submit', function(e) {
        // Don't prevent default - let form submit naturally
        const submitButton = this.querySelector('button[type="submit"]');
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        // Add a slight delay to show the loading state
        setTimeout(() => {
            // Form will submit naturally
        }, 100);
    });
});