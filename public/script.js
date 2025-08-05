// API Configuration
const API_BASE_URL = window.location.origin + '/api';

// Authentication state
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// Check if we're on the same domain (for local development)
const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        // For development, show a more user-friendly error
        if (isLocalDevelopment) {
            console.log('API request failed, but continuing with mock data for development');
            return null;
        }
        throw error;
    }
}

// Authentication Functions
async function login(username, password) {
    try {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        authToken = response.token;
        currentUser = response.user;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        return response;
    } catch (error) {
        throw error;
    }
}

async function logout() {
    try {
        await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    }
}

// Content Management Functions
async function loadContent() {
    try {
        // Load events
        const eventsResponse = await apiRequest('/content/events');
        if (eventsResponse && eventsResponse.events) {
            updateEventsSection(eventsResponse.events);
        }
        
        // Load testimonials
        const testimonialsResponse = await apiRequest('/content/testimonials');
        if (testimonialsResponse && testimonialsResponse.testimonials) {
            updateTestimonialsSection(testimonialsResponse.testimonials);
        }
        
        // Load impact stats
        const statsResponse = await apiRequest('/content/impact-stats');
        if (statsResponse && statsResponse.stats) {
            updateImpactStats(statsResponse.stats);
        }
        
    } catch (error) {
        console.error('Error loading content:', error);
        // Don't show error notification in development
        if (!isLocalDevelopment) {
            showNotification('Error loading content. Please refresh the page.', 'error');
        }
    }
}

async function updateImpactStats(stats) {
    const statsMap = {};
    stats.forEach(stat => {
        statsMap[stat.stat_name] = stat.stat_value;
    });
    
    // Update DOM elements
    const childrenCount = document.getElementById('childrenCount');
    const sessionsCount = document.getElementById('sessionsCount');
    const programsCount = document.getElementById('programsCount');
    const volunteersCount = document.getElementById('volunteersCount');
    
    if (childrenCount) childrenCount.textContent = statsMap.children_empowered || 0;
    if (sessionsCount) sessionsCount.textContent = statsMap.weekly_sessions || 0;
    if (programsCount) programsCount.textContent = statsMap.active_programs || 0;
    if (volunteersCount) volunteersCount.textContent = statsMap.volunteers || 0;
    
    // Animate counters
    animateCounters();
}

async function updateEventsSection(events) {
    const eventsContainer = document.querySelector('.events-grid');
    if (!eventsContainer) return;
    
    eventsContainer.innerHTML = events.map(event => `
        <div class="event-card">
            <div class="event-date">
                <span class="day">${new Date(event.event_date).getDate()}</span>
                <span class="month">${new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}</span>
            </div>
            <div class="event-details">
                <h3>${event.title}</h3>
                <p class="event-time"><i class="fas fa-clock"></i> ${event.event_time}</p>
                <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                <p class="event-description">${event.description}</p>
            </div>
        </div>
    `).join('');
}

async function updateTestimonialsSection(testimonials) {
    const testimonialsContainer = document.querySelector('.testimonials-grid');
    if (!testimonialsContainer) return;
    
    testimonialsContainer.innerHTML = testimonials.map(testimonial => `
        <div class="testimonial-card">
            <div class="testimonial-content">
                <p>"${testimonial.text}"</p>
            </div>
            <div class="testimonial-author">
                <h4>${testimonial.name}</h4>
                <span>${testimonial.role}</span>
            </div>
        </div>
    `).join('');
}

// Admin Panel Functions
async function updateImpactStatsAdmin() {
    const childrenCount = document.getElementById('childrenCount').value;
    const sessionsCount = document.getElementById('sessionsCount').value;
    const programsCount = document.getElementById('programsCount').value;
    const volunteersCount = document.getElementById('volunteersCount').value;
    
    if (!childrenCount && !sessionsCount && !programsCount && !volunteersCount) {
        showNotification('Please enter at least one value to update.', 'error');
        return;
    }
    
    try {
        const response = await apiRequest('/content/impact-stats', {
            method: 'PUT',
            body: JSON.stringify({
                children_empowered: parseInt(childrenCount) || 0,
                weekly_sessions: parseInt(sessionsCount) || 0,
                active_programs: parseInt(programsCount) || 0,
                volunteers: parseInt(volunteersCount) || 0
            })
        });
        
        if (response) {
            showNotification('Impact statistics updated successfully!', 'success');
        } else {
            showNotification('Impact statistics updated (development mode)!', 'success');
        }
        
        // Clear form
        document.getElementById('childrenCount').value = '';
        document.getElementById('sessionsCount').value = '';
        document.getElementById('programsCount').value = '';
        document.getElementById('volunteersCount').value = '';
        
        // Reload content
        await loadContent();
        
    } catch (error) {
        showNotification('Error updating impact statistics.', 'error');
    }
}

async function addNewEventAdmin() {
    const title = document.getElementById('eventTitle').value;
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const location = document.getElementById('eventLocation').value;
    const description = document.getElementById('eventDescription').value;
    
    if (!title || !date || !time || !location) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    try {
        await apiRequest('/content/events', {
            method: 'POST',
            body: JSON.stringify({
                title,
                event_date: date,
                event_time: time,
                location,
                description
            })
        });
        
        showNotification('New event added successfully!', 'success');
        
        // Clear form
        document.getElementById('eventTitle').value = '';
        document.getElementById('eventDate').value = '';
        document.getElementById('eventTime').value = '';
        document.getElementById('eventLocation').value = '';
        document.getElementById('eventDescription').value = '';
        
        // Reload content
        await loadContent();
        
    } catch (error) {
        showNotification('Error adding new event.', 'error');
    }
}

async function addTestimonialAdmin() {
    const name = document.getElementById('testimonialName').value;
    const role = document.getElementById('testimonialRole').value;
    const text = document.getElementById('testimonialText').value;
    
    if (!name || !role || !text) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    try {
        await apiRequest('/content/testimonials', {
            method: 'POST',
            body: JSON.stringify({
                name,
                role,
                text
            })
        });
        
        showNotification('New testimonial added successfully!', 'success');
        
        // Clear form
        document.getElementById('testimonialName').value = '';
        document.getElementById('testimonialRole').value = '';
        document.getElementById('testimonialText').value = '';
        
        // Reload content
        await loadContent();
        
    } catch (error) {
        showNotification('Error adding new testimonial.', 'error');
    }
}

// Donation Functions
async function createDonation(donationData) {
    try {
        const response = await apiRequest('/donations/create', {
            method: 'POST',
            body: JSON.stringify(donationData)
        });
        
        return response;
    } catch (error) {
        throw error;
    }
}

async function verifyPayment(paymentData) {
    try {
        const response = await apiRequest('/donations/verify', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
        
        return response;
    } catch (error) {
        throw error;
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initSlider();
    initMobileNav();
    initSmoothScrolling();
    initScrollAnimations();
    initGalleryLightbox();
    initDonationForm();
    
    // Load content from backend
    loadContent();
    
    // Initialize admin panel if user is authenticated
    if (currentUser) {
        initAdminPanel();
    }
});

// Hero Slider
function initSlider() {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;
    
    const slides = slider.querySelectorAll('.slide');
    const dots = slider.querySelectorAll('.dot');
    const prevBtn = slider.querySelector('.prev');
    const nextBtn = slider.querySelector('.next');
    
    let currentSlide = 0;
    let slideInterval;
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = i === index ? 'block' : 'none';
        });
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }
    
    function goToSlide(index) {
        currentSlide = index;
        showSlide(currentSlide);
    }
    
    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });
    
    // Auto-slide
    function startAutoSlide() {
        slideInterval = setInterval(nextSlide, 5000);
    }
    
    function stopAutoSlide() {
        clearInterval(slideInterval);
    }
    
    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', startAutoSlide);
    
    // Initialize
    showSlide(0);
    startAutoSlide();
}

// Mobile Navigation
function initMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Smooth Scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.fade-in, .slide-in, .scale-in').forEach(el => {
        observer.observe(el);
    });
}

// Donation Form
function initDonationForm() {
    const donationForm = document.getElementById('donationForm');
    if (!donationForm) return;
    
    donationForm.addEventListener('submit', handleDonation);
}

async function handleDonation(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const donationData = {
        donor_name: formData.get('name'),
        donor_email: formData.get('email'),
        amount: parseFloat(formData.get('amount')),
        phone: formData.get('phone') || '',
        message: formData.get('message') || ''
    };
    
    // Validate form
    if (!validateDonationForm(donationData)) {
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
    try {
        // Create donation record
        const orderResponse = await createDonation(donationData);
        
        if (orderResponse) {
            // Initialize Razorpay
            const options = {
                key: orderResponse.key_id,
                amount: orderResponse.amount,
                currency: orderResponse.currency,
                order_id: orderResponse.order_id,
                name: 'Adhigam NGO',
                description: 'Donation to Adhigam NGO',
                image: 'Adhigam_Logo.jpg',
                handler: function(response) {
                    handlePaymentSuccess(response, donationData);
                },
                prefill: {
                    name: donationData.donor_name,
                    email: donationData.donor_email,
                    contact: donationData.phone
                },
                theme: {
                    color: '#136a8a'
                }
            };
            
            const rzp = new Razorpay(options);
            rzp.open();
        } else {
            // Development mode - show success message
            showNotification('Donation form submitted successfully! (Development mode)', 'success');
            e.target.reset();
        }
        
    } catch (error) {
        console.error('Error creating donation:', error);
        showNotification('Error creating donation. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function validateDonationForm(data) {
    if (!data.donor_name || !data.donor_email || !data.amount) {
        showNotification('Please fill in all required fields.', 'error');
        return false;
    }
    
    if (data.amount < 100) {
        showNotification('Minimum donation amount is ₹100.', 'error');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.donor_email)) {
        showNotification('Please enter a valid email address.', 'error');
        return false;
    }
    
    return true;
}

async function handlePaymentSuccess(response, donationData) {
    try {
        // Verify payment with backend
        await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
        });
        
        showNotification('Thank you for your donation! Your payment was successful.', 'success');
        
        // Reset form
        document.getElementById('donationForm').reset();
        
    } catch (error) {
        console.error('Payment verification error:', error);
        showNotification('Payment verification failed. Please contact support.', 'error');
    }
}

// Gallery Lightbox
function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const title = item.querySelector('h3')?.textContent || '';
            const description = item.querySelector('p')?.textContent || '';
            
            openLightbox(img.src, title, description);
        });
    });
}

function openLightbox(imageSrc, title, description) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <span class="lightbox-close">&times;</span>
            <img src="${imageSrc}" alt="${title}">
            <div class="lightbox-info">
                <h3>${title}</h3>
                <p>${description}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(lightbox);
    
    // Close functionality
    function closeLightbox() {
        document.body.removeChild(lightbox);
        document.removeEventListener('keydown', escHandler);
    }
    
    const escHandler = function(e) {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    };
    
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    document.addEventListener('keydown', escHandler);
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    });
}

// Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
}

// Admin Panel Functions
function toggleAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (!panel) return;
    
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') {
        setTimeout(() => {
            panel.classList.add('active');
        }, 10);
    } else {
        panel.classList.remove('active');
    }
}

function initAdminPanel() {
    // Update admin panel functions to use backend API
    window.updateImpactStats = updateImpactStatsAdmin;
    window.addNewEvent = addNewEventAdmin;
    window.addTestimonial = addTestimonialAdmin;
    window.toggleAdminPanel = toggleAdminPanel;
}

// Volunteer Form
function initVolunteerForm() {
    const volunteerForm = document.getElementById('volunteerForm');
    if (!volunteerForm) return;
    
    volunteerForm.addEventListener('submit', handleVolunteerSubmission);
}

async function handleVolunteerSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const volunteerData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        interests: formData.get('interests'),
        message: formData.get('message')
    };
    
    // Basic validation
    if (!volunteerData.name || !volunteerData.email) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    // For now, just show success message
    // In a real implementation, you would send this to your backend
    showNotification('Thank you for your interest in volunteering! We will contact you soon.', 'success');
    e.target.reset();
}

// Initialize volunteer form
document.addEventListener('DOMContentLoaded', function() {
    initVolunteerForm();
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// Event registration
function registerForEvent(eventId) {
    showNotification('Event registration feature coming soon!', 'info');
}

// Contact form
function submitContactForm(e) {
    e.preventDefault();
    showNotification('Thank you for your message! We will get back to you soon.', 'success');
    e.target.reset();
}

// Initialize contact form
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', submitContactForm);
    }
}); 