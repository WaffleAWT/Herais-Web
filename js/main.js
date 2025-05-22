// Main JavaScript for Herais Web

// DOM Elements
const loader = document.querySelector('.loader');
const body = document.body;
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');
const header = document.querySelector('header');
const cursorFollower = document.querySelector('.cursor-follower');
const scrollElements = document.querySelectorAll('.animate-in');
const navLinks = document.querySelectorAll('.nav-link');
const contactForm = document.getElementById('contact-form');
const currentYear = document.getElementById('current-year');
const scrollToTopBtn = document.getElementById('scrollToTop');

// Cookie Consent
const cookieConsent = document.getElementById('cookieConsent');
const acceptCookies = document.getElementById('acceptCookies');
const rejectCookies = document.getElementById('rejectCookies');

// Helper function to get section-specific offsets based on screen size
function getSectionOffset(targetId) {
    // Get window width for responsive offsets
    const windowWidth = window.innerWidth;
    
    // Mobile view (up to 767px)
    if (windowWidth <= 767) {
        // Mobile-specific offsets
        if (targetId === '#about') {
            return 80; // Increased offset for About section on mobile
        } else if (targetId === '#contact') {
            return 60;
        } else if (targetId === '#services') {
            return 70;
        } else if (targetId === '#process') {
            return 70;
        } else if (targetId === '#portfolio') {
            return 70;
        } else if (targetId === '#pricing') {
            return 70;
        } else if (targetId === '#values') {
            return 70;
        } else if (targetId === '#technologies') {
            return 70;
        }
        return 70; // Default mobile offset
    } 
    // Tablet view (768px - 1023px)
    else if (windowWidth <= 1023) {
        if (targetId === '#about') {
            return 30;
        }
        return 25;
    }
    // Desktop and larger screens
    else {
        if (targetId === '#about') {
            return 25;
        }
        return 20;
    }
}

// Init function - Called when the page loads
function init() {
    // Set current year in footer
    currentYear.textContent = new Date().getFullYear();
    
    // Force dark theme
    document.documentElement.classList.remove('light-mode');
    body.classList.remove('light-mode');
    
    // Simulate loading
    setTimeout(() => {
        body.classList.add('loaded');
        animateHeroElements();
        
        const heroSection = document.getElementById('home');
        if (heroSection) {
            window.scrollTo({
                top: heroSection.offsetTop,
                behavior: 'auto'
            });
        }
        
        if (window.location.hash) {
            setTimeout(() => {
                const hash = window.location.hash;
                const targetElement = document.querySelector(hash);
                if (targetElement) {
                    const offset = getSectionOffset(hash);
                    const targetPosition = targetElement.offsetTop - offset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 500);
        }
    }, 2000);
    
    // Add event listeners
    addEventListeners();
    
    // Initialize WebGL background
    initHeroCanvas();
    
    // Initialize other components
    checkScrollPosition();
    initScrollObserver();
    initPricingTabs();
}

// Event Listeners
function addEventListeners() {
    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }
    
    // Mouse movement for cursor follower - only on desktop
    if (cursorFollower && window.innerWidth > 1023) {
        document.addEventListener('mousemove', moveCursor);
        
        // Links and buttons for cursor effect
        const interactiveElements = document.querySelectorAll('a, button, .btn, .card-inner, .portfolio-item, .pricing-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursorFollower.classList.add('active'));
            el.addEventListener('mouseleave', () => cursorFollower.classList.remove('active'));
        });
    }
    
    // Navigation link clicks
    if (navLinks) {
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavClick);
        });
    }
    
    // Window scroll event
    window.addEventListener('scroll', throttle(onScroll, 100));
    
    // Window resize event
    window.addEventListener('resize', throttle(handleResize, 200));
    
    // Contact form submission
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Scroll to top button
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', scrollToTop);
    }
}

// Toggle Mobile Menu
function toggleMenu() {
    menuToggle.classList.toggle('menu-open');
    nav.classList.toggle('open');
    body.classList.toggle('menu-active');

    // Animate nav items with shorter delays
    const navItems = nav.querySelectorAll('li');
    navItems.forEach((item, index) => {
        if (nav.classList.contains('open')) {
            item.style.transitionDelay = `${index * 0.05}s`;
        } else {
            item.style.transitionDelay = '0s';
        }
    });
}

// Handle navigation clicks
function handleNavClick(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    
    // Check if we're navigating to index.html with a hash
    if (targetId.startsWith('index.html#')) {
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage !== 'index.html' && currentPage !== '') {
            // If on a different page, navigate to index.html with the hash
            window.location.href = targetId;
            return;
        }
        // If already on index.html, just scroll to the section
        const sectionId = '#' + targetId.split('#')[1];
        const targetElement = document.querySelector(sectionId);
        if (targetElement) {
            const offset = getSectionOffset(sectionId);
            const targetPosition = targetElement.offsetTop - offset;
            
            // If on mobile and menu is open
            if (window.innerWidth <= 768 && nav.classList.contains('open')) {
                toggleMenu();
                // Increased timeout for mobile to ensure menu is fully closed
                setTimeout(() => {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    // Additional check to ensure we reached the right position
                    setTimeout(() => {
                        const currentPosition = window.scrollY;
                        if (Math.abs(currentPosition - targetPosition) > 50) {
                            window.scrollTo({
                                top: targetPosition,
                                behavior: 'auto'
                            });
                        }
                    }, 500);
                }, 400);
            } else {
                // Desktop or menu closed
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    } else {
        // Regular link, just navigate
        window.location.href = targetId;
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (nav && nav.classList.contains('open') && 
        !nav.contains(e.target) && 
        !menuToggle.contains(e.target)) {
        toggleMenu();
    }
});

// Close mobile menu when window is resized to desktop size
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && nav && nav.classList.contains('open')) {
        toggleMenu();
    }
});

// Custom cursor movement
function moveCursor(e) {
    cursorFollower.style.left = `${e.clientX}px`;
    cursorFollower.style.top = `${e.clientY}px`;
}

// Handle scroll events
function onScroll() {
    checkScrollPosition();
    
    // Parallax effect for certain elements
    const scrollY = window.scrollY;
    
    // Add parallax effects to specific elements
    document.querySelectorAll('.floating-element').forEach((el, index) => {
        const speed = 0.1 + (index * 0.05);
        el.style.transform = `translateY(${scrollY * speed}px)`;
    });
    
    // Show/hide scroll to top button
    if (scrollY > 500) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
}

// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Check scroll position for header styling
function checkScrollPosition() {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// Initialize Intersection Observer for scroll animations
function initScrollObserver() {
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, options);
    
    // Observe all elements with animation classes
    document.querySelectorAll('.animate-in, .fade-up, .fade-left, .fade-right, .scale-in, .from-left, .from-right, .from-bottom, .from-top, .scale-up').forEach(el => {
        observer.observe(el);
    });
    
    // Observe staggered animation containers
    document.querySelectorAll('.stagger-container').forEach(container => {
        observer.observe(container);
    });
}

// Animate hero section elements
function animateHeroElements() {
    // Add is-visible class to hero section elements with animation classes
    document.querySelectorAll('.hero .animate-in').forEach(el => {
        el.classList.add('is-visible');
    });
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    
    // Send form data to send-email.php
    fetch('send-email.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
    showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
    contactForm.reset();
        } else {
            throw new Error('Failed to send message');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Failed to send message. Please try again later.', 'error');
    });
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        ${message}
        <span class="notification-close">&times;</span>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Add close event
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 500);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }
    }, 5000);
}

// Initialize WebGL canvas for hero section
function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Create particles with dark theme colors
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 5;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Materials - Always use dark theme colors
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.005,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
    });
    
    // Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Position camera
    camera.position.z = 2;
    
    // Mouse move effect
    let mouseX = 0;
    let mouseY = 0;
    
    function onMouseMove(event) {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    window.addEventListener('mousemove', onMouseMove);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        particlesMesh.rotation.x += 0.0005;
        particlesMesh.rotation.y += 0.0003;
        
        // Responsive to mouse movement
        particlesMesh.rotation.x += mouseY * 0.0005;
        particlesMesh.rotation.y += mouseX * 0.0005;
        
        renderer.render(scene, camera);
    }
    
    animate();
}

// Utility: Throttle function for performance
function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = new Date().getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return func(...args);
    };
}

// Add text split animation to elements with class 'split-text'
function initSplitText() {
    document.querySelectorAll('.split-text').forEach(text => {
        const content = text.textContent;
        text.textContent = '';
        
        // Create spans for each character
        for (let i = 0; i < content.length; i++) {
            const span = document.createElement('span');
            span.textContent = content[i];
            span.style.animationDelay = `${i * 0.05}s`;
            text.appendChild(span);
        }
    });
}

// Handle window resize
function handleResize() {
    // If we're on a section (not at the top of the page)
    if (window.location.hash) {
        const hash = window.location.hash;
        const targetElement = document.querySelector(hash);
        
        if (targetElement) {
            // Use requestAnimationFrame to ensure DOM is updated
            requestAnimationFrame(() => {
                const offset = getSectionOffset(hash);
                const targetPosition = targetElement.offsetTop - offset;
                
                // Use scrollTo without smooth behavior to avoid jumpy experience during resize
                window.scrollTo({
                    top: targetPosition
                });
            });
        }
    }
}

// Initialize pricing tabs functionality
function initPricingTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Hide all tab content
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Show the selected tab content
            const targetId = button.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Detect if the user is on a Mac or iOS device
function detectAppleDevice() {
    // Only add the mac class for styling purposes, don't force light theme
    const isAppleDevice = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform) || 
                       (navigator.userAgent.includes('Mac') && 'ontouchend' in document) ||
                       navigator.userAgent.includes('Macintosh') ||
                       navigator.platform.toUpperCase().indexOf('MAC') >= 0 ||
                       /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isAppleDevice) {
        document.body.classList.add('mac');
        document.documentElement.classList.add('mac');
        
        // Direct style application for services container
        const servicesContainers = document.querySelectorAll('.services-container');
        servicesContainers.forEach(container => {
            container.style.gridTemplateColumns = 'repeat(2, 1fr)';
        });
    }
}

function setInitialLoaderTheme() {
    const savedTheme = localStorage.getItem('theme');
    const loader = document.querySelector('.loader');
    
    if (loader) {
        if (savedTheme === 'light') {
            loader.style.backgroundColor = 'var(--background-light)';
            const subtitle = loader.querySelector('.loader-subtitle');
            if (subtitle) {
                subtitle.style.color = 'var(--text-dark)';
            }
            const progress = loader.querySelector('.loader-progress');
            if (progress) {
                progress.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            }
        } else {
            loader.style.backgroundColor = 'var(--background-dark)';
            const subtitle = loader.querySelector('.loader-subtitle');
            if (subtitle) {
                subtitle.style.color = 'var(--text-light)';
            }
            const progress = loader.querySelector('.loader-progress');
            if (progress) {
                progress.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }
        }
    }
}

// Call setInitialLoaderTheme immediately
document.addEventListener('DOMContentLoaded', setInitialLoaderTheme);

// Initialize on page load
window.addEventListener('load', init);
window.addEventListener('load', initSplitText);
window.addEventListener('load', detectAppleDevice);

// Check if user has already made a cookie choice
function checkCookieConsent() {
    const cookieChoice = localStorage.getItem('cookieConsent');
    if (!cookieChoice) {
        setTimeout(() => {
            cookieConsent.classList.add('show');
        }, 2000);
    }
}

// Handle cookie acceptance
function acceptAllCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    cookieConsent.classList.remove('show');
    
    // Here you can initialize analytics and other cookie-dependent features
    initializeAnalytics();
}

// Handle cookie rejection
function rejectNonEssentialCookies() {
    localStorage.setItem('cookieConsent', 'rejected');
    cookieConsent.classList.remove('show');
    
    // Only load essential cookies/features
    // You might want to disable analytics and other tracking here
}

// Initialize analytics (only if cookies are accepted)
function initializeAnalytics() {
    // Add your analytics initialization code here
    // Example: Google Analytics, Hotjar, etc.
}

// Add event listeners for cookie consent buttons
if (acceptCookies) {
    acceptCookies.addEventListener('click', acceptAllCookies);
}
if (rejectCookies) {
    rejectCookies.addEventListener('click', rejectNonEssentialCookies);
}

// Check cookie consent on page load
document.addEventListener('DOMContentLoaded', checkCookieConsent);

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only update theme if user hasn't set a preference
    if (!localStorage.getItem('theme')) {
        const isLight = !e.matches;
        if (isLight) {
            document.documentElement.classList.add('light-mode');
            body.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
            body.classList.remove('light-mode');
        }
        updateThemeElements();
    }
}); 

// Initialize globe
const globeContainer = document.getElementById('globeContainer');
if (globeContainer) {
    const globe = new Globe(globeContainer);
} 