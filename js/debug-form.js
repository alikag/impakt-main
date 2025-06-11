// Debug Form Handler - Logs everything for troubleshooting
document.addEventListener('DOMContentLoaded', function() {
    console.log('Debug form handler loaded');
    
    const form = document.getElementById('contactForm');
    if (!form) {
        console.error('Form not found!');
        return;
    }
    
    console.log('Form found:', form);
    console.log('Form name:', form.getAttribute('name'));
    console.log('Form method:', form.method);
    console.log('Form has netlify attribute:', form.hasAttribute('netlify'));
    
    // Log all form inputs
    const inputs = form.querySelectorAll('input, select, textarea');
    console.log('Form inputs:', inputs.length);
    inputs.forEach(input => {
        console.log(`- ${input.name}: ${input.type}`);
    });
    
    form.addEventListener('submit', function(e) {
        console.log('Form submit event triggered');
        e.preventDefault();
        
        const formData = new FormData(form);
        console.log('FormData created');
        
        // Log all form data
        console.log('Form data contents:');
        for (let [key, value] of formData.entries()) {
            console.log(`  ${key}: ${value}`);
        }
        
        // Create URLSearchParams
        const params = new URLSearchParams();
        for (let [key, value] of formData.entries()) {
            params.append(key, value);
        }
        
        console.log('URLSearchParams:', params.toString());
        
        console.log('Sending fetch request...');
        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString()
        })
        .then(response => {
            console.log('Response received');
            console.log('Status:', response.status);
            console.log('Status Text:', response.statusText);
            console.log('Headers:', response.headers);
            console.log('URL:', response.url);
            console.log('Redirected:', response.redirected);
            
            return response.text();
        })
        .then(text => {
            console.log('Response body:', text.substring(0, 200) + '...');
            alert('Check console for detailed logs');
        })
        .catch(error => {
            console.error('Fetch error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
        });
    });
});