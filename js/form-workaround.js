// Temporary workaround - combine all fields into message
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        // Get all field values
        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone') || 'Not provided';
        const company = formData.get('company') || 'Not provided';
        const revenue = formData.get('revenue') || 'Not provided';
        const originalMessage = formData.get('message') || 'No message';
        
        // Combine into message field
        const combinedMessage = `
Phone: ${phone}
Company: ${company}
Revenue: ${revenue}

Message: ${originalMessage}`;
        
        // Update message field with combined data
        const messageField = form.querySelector('textarea[name="message"]');
        if (messageField) {
            messageField.value = combinedMessage;
        }
        
        // Form will submit normally with all data in message field
    });
});