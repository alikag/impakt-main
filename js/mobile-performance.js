// Mobile Performance Enhancements

(function() {
    'use strict';
    
    // Detect if user is on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isMobile || isTouchDevice) {
        // Add mobile class to body
        document.body.classList.add('is-mobile');
        
        // Disable hover effects on mobile
        document.body.classList.add('no-hover');
        
        // Optimize scroll performance
        optimizeScrollPerformance();
        
        // Lazy load images
        implementLazyLoading();
        
        // Optimize touch interactions
        optimizeTouchInteractions();
        
        // Reduce motion for battery saving
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduce-motion');
        }
    }
    
    function optimizeScrollPerformance() {
        let scrolling = false;
        let scrollTimeout;
        
        window.addEventListener('scroll', function() {
            if (!scrolling) {
                document.body.classList.add('is-scrolling');
                scrolling = true;
            }
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function() {
                document.body.classList.remove('is-scrolling');
                scrolling = false;
            }, 100);
        }, { passive: true });
        
        // Optimize scroll for iOS
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            document.addEventListener('touchmove', function() {}, { passive: true });
        }
    }
    
    function implementLazyLoading() {
        // Native lazy loading for modern browsers
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('loading' in HTMLImageElement.prototype) {
            // Browser supports native lazy loading
            images.forEach(img => {
                img.loading = 'lazy';
            });
        } else {
            // Fallback for older browsers
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
    }
    
    function optimizeTouchInteractions() {
        // Fast click for touch devices
        let touchStartTime;
        let touchStartX;
        let touchStartY;
        
        document.addEventListener('touchstart', function(e) {
            touchStartTime = Date.now();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', function(e) {
            const touchEndTime = Date.now();
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            // Check if it's a tap (not a swipe)
            const deltaX = Math.abs(touchEndX - touchStartX);
            const deltaY = Math.abs(touchEndY - touchStartY);
            const deltaTime = touchEndTime - touchStartTime;
            
            if (deltaX < 10 && deltaY < 10 && deltaTime < 200) {
                // It's a tap - add visual feedback
                const target = e.target;
                if (target.classList.contains('btn') || target.classList.contains('card')) {
                    target.classList.add('tapped');
                    setTimeout(() => target.classList.remove('tapped'), 200);
                }
            }
        }, { passive: true });
        
        // Prevent double-tap zoom on buttons and links
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(e) {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
    
    // Optimize font loading for mobile
    if ('fonts' in document) {
        Promise.all([
            document.fonts.load('400 1em Inter'),
            document.fonts.load('600 1em Inter'),
            document.fonts.load('700 1em Inter')
        ]).then(() => {
            document.body.classList.add('fonts-loaded');
        });
    }
    
    // Detect connection speed and adjust accordingly
    if ('connection' in navigator) {
        const connection = navigator.connection;
        
        if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            document.body.classList.add('save-data');
            
            // Disable non-essential features
            const videos = document.querySelectorAll('video');
            videos.forEach(video => {
                video.preload = 'none';
                video.autoplay = false;
            });
            
            // Reduce image quality
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                if (img.dataset.lowSrc) {
                    img.src = img.dataset.lowSrc;
                }
            });
        }
    }
    
    // Viewport height fix for mobile browsers
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
})();