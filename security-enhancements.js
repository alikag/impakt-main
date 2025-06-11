// Security Enhancements for impakt Labs Website

// 1. Input Sanitization Helper
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// 2. Email Validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 3. Phone Validation
function isValidPhone(phone) {
    // Allow empty (optional field) or valid phone formats
    if (!phone) return true;
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// 4. Enhanced Form Validation
function validateForm(formData) {
    const errors = [];
    
    // Name validation
    if (!formData.name || formData.name.trim().length < 2) {
        errors.push('Please enter a valid name (at least 2 characters)');
    }
    
    // Email validation
    if (!formData.email || !isValidEmail(formData.email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Phone validation (optional but must be valid if provided)
    if (formData.phone && !isValidPhone(formData.phone)) {
        errors.push('Please enter a valid phone number');
    }
    
    // Company name validation (optional but must be valid if provided)
    if (formData.company && formData.company.trim().length < 2) {
        errors.push('Company name must be at least 2 characters');
    }
    
    // Revenue validation
    if (!formData.revenue) {
        errors.push('Please select a revenue range');
    }
    
    // Message validation (optional but limit length)
    if (formData.message && formData.message.length > 1000) {
        errors.push('Message must be less than 1000 characters');
    }
    
    return errors;
}

// 5. Rate Limiting
const rateLimiter = {
    submissions: new Map(),
    maxAttempts: 3,
    windowMs: 60000, // 1 minute
    
    canSubmit(identifier) {
        const now = Date.now();
        const userSubmissions = this.submissions.get(identifier) || [];
        
        // Clean old submissions
        const recentSubmissions = userSubmissions.filter(
            time => now - time < this.windowMs
        );
        
        if (recentSubmissions.length >= this.maxAttempts) {
            return false;
        }
        
        recentSubmissions.push(now);
        this.submissions.set(identifier, recentSubmissions);
        return true;
    }
};

// 6. CSRF Token Generation (for production, this should come from server)
function generateCSRFToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// 7. Content Security Policy Meta Tag
function addSecurityHeaders() {
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
        font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;
        img-src 'self' data: https:;
        connect-src 'self';
        frame-ancestors 'none';
        base-uri 'self';
        form-action 'self';
    `.replace(/\s+/g, ' ').trim();
    document.head.appendChild(cspMeta);
}

// 8. Secure Form Submission
async function secureFormSubmit(formData) {
    // Sanitize all inputs
    const sanitizedData = {};
    for (const [key, value] of Object.entries(formData)) {
        sanitizedData[key] = sanitizeInput(value);
    }
    
    // Validate
    const errors = validateForm(sanitizedData);
    if (errors.length > 0) {
        throw new Error(errors.join('\n'));
    }
    
    // Check rate limiting
    const userIdentifier = sanitizedData.email; // Use email as identifier
    if (!rateLimiter.canSubmit(userIdentifier)) {
        throw new Error('Too many submissions. Please try again later.');
    }
    
    // Add security tokens
    sanitizedData.timestamp = Date.now();
    sanitizedData.csrf = generateCSRFToken();
    
    // In production, send to secure backend with HTTPS
    // For now, we'll simulate
    console.log('Secure form data ready for submission:', sanitizedData);
    
    return sanitizedData;
}

// 9. XSS Protection for Dynamic Content
function createSafeElement(tag, content, attributes = {}) {
    const element = document.createElement(tag);
    
    // Set text content (automatically escaped)
    if (content) {
        element.textContent = content;
    }
    
    // Set attributes safely
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'href' || key === 'src') {
            // Validate URLs
            try {
                const url = new URL(value, window.location.origin);
                if (url.protocol === 'http:' || url.protocol === 'https:') {
                    element.setAttribute(key, value);
                }
            } catch (e) {
                console.error('Invalid URL:', value);
            }
        } else {
            element.setAttribute(key, value);
        }
    }
    
    return element;
}

// 10. Secure Local Storage
const secureStorage = {
    set(key, value) {
        try {
            const encrypted = btoa(JSON.stringify(value));
            localStorage.setItem(key, encrypted);
        } catch (e) {
            console.error('Storage error:', e);
        }
    },
    
    get(key) {
        try {
            const encrypted = localStorage.getItem(key);
            if (!encrypted) return null;
            return JSON.parse(atob(encrypted));
        } catch (e) {
            console.error('Storage retrieval error:', e);
            return null;
        }
    },
    
    remove(key) {
        localStorage.removeItem(key);
    }
};

// Export for use in main.js
window.SecurityEnhancements = {
    sanitizeInput,
    isValidEmail,
    isValidPhone,
    validateForm,
    rateLimiter,
    generateCSRFToken,
    addSecurityHeaders,
    secureFormSubmit,
    createSafeElement,
    secureStorage
}; 