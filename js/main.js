// Main JavaScript file for impakt Labs website

// Mobile Navigation Toggle
const mobileToggle = document.querySelector('.mobile-toggle');
const navMenu = document.querySelector('.nav-menu');

mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileToggle.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Close menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Improve mobile scroll performance
let ticking = false;
function updateNavbarOnScroll() {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
            }
            
            ticking = false;
        });
        ticking = true;
    }
}

// Smooth Scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

// Use the optimized scroll function for mobile
window.addEventListener('scroll', updateNavbarOnScroll, { passive: true });

// Form Handling with Security
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Show loading state
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    try {
        // Use secure form submission if available
        if (window.SecurityEnhancements) {
            const secureData = await window.SecurityEnhancements.secureFormSubmit(data);
            // In production, send secureData to your backend with HTTPS
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            // Fallback to basic submission
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Show success message
        showNotification('Thank you! We\'ll be in touch within 24 hours.', 'success');
        contactForm.reset();
    } catch (error) {
        // Show error message
        showNotification(error.message || 'Something went wrong. Please try again.', 'error');
    } finally {
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
});

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.about-card, .criteria-item, .process-step, .faq-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

// Add animation class styles
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(animationStyle);

// Add loading animation to stats
const stats = document.querySelectorAll('.stat-number');
stats.forEach(stat => {
    const finalValue = stat.textContent;
    const isDecimal = finalValue.includes('.');
    const numericValue = parseFloat(finalValue.replace(/[^0-9.]/g, ''));
    const prefix = finalValue.match(/[^0-9.]*/)[0];
    const suffix = finalValue.match(/[^0-9.]*$/)[0];
    
    stat.textContent = prefix + '0' + suffix;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateValue(stat, 0, numericValue, 2000, prefix, suffix, isDecimal);
                observer.unobserve(entry.target);
            }
        });
    });
    
    observer.observe(stat);
});

// Animate numeric values
function animateValue(element, start, end, duration, prefix, suffix, isDecimal) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        
        const displayValue = isDecimal ? current.toFixed(1) : Math.floor(current);
        element.textContent = prefix + displayValue + suffix;
    }, 16);
}

// Add hover effect to mobile toggle
mobileToggle.addEventListener('click', function() {
    this.classList.toggle('active');
});

// Add active state styles for mobile toggle
const mobileToggleStyle = document.createElement('style');
mobileToggleStyle.textContent = `
    .mobile-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .mobile-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .mobile-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
`;
document.head.appendChild(mobileToggleStyle);

// Dark mode is now the default - no toggle needed

// Mobile Touch Improvements
let touchStartX = 0;
let touchEndX = 0;

// Swipe to close mobile menu
navMenu.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

navMenu.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    if (touchEndX > touchStartX + 50) { // Swipe right
        navMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Improve form input experience on mobile
const formInputs = document.querySelectorAll('input, select, textarea');
formInputs.forEach(input => {
    // Prevent zoom on focus for iOS
    input.addEventListener('focus', () => {
        if (window.innerWidth < 768) {
            document.querySelector('meta[name="viewport"]').setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
    });
    
    input.addEventListener('blur', () => {
        document.querySelector('meta[name="viewport"]').setAttribute('content', 
            'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
    });
});

// Add loading state for mobile
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Detect if user prefers reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
    document.documentElement.style.setProperty('--transition-base', '0ms');
    document.documentElement.style.setProperty('--transition-fast', '0ms');
    document.documentElement.style.setProperty('--transition-slow', '0ms');
} 