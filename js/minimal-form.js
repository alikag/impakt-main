// Minimal Netlify Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const myForm = e.target;
        const formData = new FormData(myForm);
        
        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString()
        })
        .then(() => {
            console.log("Form successfully submitted");
            // Show success message
            document.getElementById('contactForm').innerHTML = '<div style="padding: 40px; text-align: center;"><h3>Thank you!</h3><p>We will be in touch soon.</p></div>';
        })
        .catch((error) => {
            console.error(error);
            alert('Error: ' + error);
        });
    });
});