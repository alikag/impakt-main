// Simple Netlify Forms Handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        try {
            // Get form data
            const formData = new FormData(form);
            
            // Encode as URL parameters (required by Netlify)
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            // Make sure form-name is included
            data['form-name'] = 'contact';
            
            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(data).toString()
            });
            
            if (response.ok) {
                // Success - show message and redirect
                form.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <h3 style="color: #10b981; margin-bottom: 16px;">✓ Thank You!</h3>
                        <p>Your message has been received. We'll be in touch within 24 hours.</p>
                    </div>
                `;
                
                // Redirect after 3 seconds
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Sorry, there was an error submitting the form. Please try again or email us directly at info@impaktlabs.com');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
});