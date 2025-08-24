# Adhigam - NGO Website

A modern, responsive website for Adhigam Youth Foundation, an NGO focused on empowering communities through education, awareness, and skill development.

## 🌟 Features

### 🎨 Design & User Experience
- **Modern, Responsive Design** - Works perfectly on all devices
- **Interactive Hero Slider** - Showcases key messages with beautiful imagery
- **Smooth Animations** - Engaging scroll animations and hover effects
- **Mobile-First Approach** - Optimized for mobile devices
- **Accessibility** - WCAG compliant design elements

### 📱 Navigation & Structure
- **Fixed Navigation Bar** - Easy access to all sections
- **Smooth Scrolling** - Seamless navigation between sections
- **Mobile Menu** - Hamburger menu for mobile devices
- **Section-based Layout** - Well-organized content structure

### 🎯 Content Sections
- **Hero Section** - Eye-catching slider with call-to-action buttons
- **About Section** - Vision, Mission, and Values (TATVAS)
- **Programs Section** - Detailed information about ongoing initiatives
- **Events Section** - Upcoming events with registration functionality
- **Gallery Section** - Photo gallery with lightbox functionality
- **Donation Section** - Integrated payment gateway
- **Contact Section** - Contact information and contact form

### 💳 Payment Integration
- **Razorpay Integration** - Secure payment processing
- **Donation Form** - Comprehensive form with validation
- **Payment Tracking** - Order creation and payment confirmation
- **Multiple Payment Options** - Cards, UPI, Net Banking, etc.

### 🎪 Interactive Features
- **Image Gallery** - Click to view larger images
- **Event Registration** - Registration buttons for events
- **Contact Forms** - Functional contact and donation forms
- **Notification System** - User-friendly notifications
- **Loading Animations** - Smooth loading experience

## 🚀 Quick Start

### Prerequisites
- A modern web browser
- Basic knowledge of HTML, CSS, and JavaScript
- Razorpay account (for payment integration)

### Installation

1. **Clone or Download** the project files
2. **Open** `adhigam.html` in your web browser
3. **Customize** the content as needed
4. **Deploy** to your web server

### File Structure
```
Adhigam/
├── adhigam.html          # Main HTML file
├── style.css             # Stylesheet
├── script.js             # JavaScript functionality
├── Adhigam_Logo.jpg      # Organization logo
└── README.md             # This file
```

## 💳 Razorpay Integration Setup

### 1. Get Razorpay Credentials
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Get your **Key ID** and **Key Secret**
3. Choose between **Test Mode** and **Live Mode**

### 2. Update Configuration
In `script.js`, replace the placeholder key:

```javascript
// Replace this line in the handleDonation function
key: 'rzp_test_YOUR_KEY_HERE', // Your Razorpay Key ID
```

### 3. Backend Integration (Optional)
For production, you'll need a backend to:
- Create orders securely
- Verify payments
- Store donation data

Example backend endpoint:
```javascript
// In createRazorpayOrder function
fetch('/api/create-order', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(donationData)
})
.then(response => response.json())
.then(order => resolve(order));
```

### 4. Payment Flow
1. User fills donation form
2. Form validation
3. Create Razorpay order
4. Open payment modal
5. Process payment
6. Handle success/failure
7. Store donation data

## 🎨 Customization

### Colors
The website uses a consistent color scheme:
- **Primary Blue**: `#136a8a`
- **Secondary Green**: `#267871`
- **Accent Gold**: `#ffd700`

### Content Updates
1. **Logo**: Replace `Adhigam_Logo.jpg`
2. **Images**: Update gallery and slider images
3. **Text**: Modify content in `adhigam.html`
4. **Contact Info**: Update contact details
5. **Events**: Add/remove events as needed

### Styling
- **CSS Variables**: Easy color customization
- **Responsive Breakpoints**: Mobile-first design
- **Animation Classes**: Reusable animation effects

## 📱 Responsive Design

The website is fully responsive with breakpoints:
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: 320px - 767px

## 🔧 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## 🚀 Deployment

### Static Hosting
1. **GitHub Pages**: Upload to GitHub repository
2. **Netlify**: Drag and drop files
3. **Vercel**: Connect GitHub repository
4. **Traditional Hosting**: Upload via FTP

### Domain Setup
1. Purchase domain name
2. Configure DNS settings
3. Set up SSL certificate
4. Update contact information

## 📊 Analytics & Tracking

### Google Analytics
Add Google Analytics tracking:

```html
<!-- Add to <head> section -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Razorpay Analytics
- Payment success rates
- Donation amounts
- User behavior
- Conversion tracking

## 🔒 Security Considerations

### Payment Security
- **HTTPS Required**: Always use SSL certificate
- **Input Validation**: Server-side validation
- **Payment Verification**: Verify payments on server
- **Data Protection**: Secure donor information

### General Security
- **XSS Prevention**: Sanitize user inputs
- **CSRF Protection**: Use tokens for forms
- **Content Security Policy**: Restrict resource loading
- **Regular Updates**: Keep dependencies updated

## 📞 Support & Maintenance

### Regular Updates
- **Content Updates**: Keep events and programs current
- **Security Patches**: Update dependencies
- **Performance Optimization**: Monitor loading times
- **Backup**: Regular backups of website and data

### Monitoring
- **Uptime Monitoring**: Ensure website availability
- **Performance Monitoring**: Track loading speeds
- **Error Tracking**: Monitor JavaScript errors
- **Payment Monitoring**: Track donation success rates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is created for Adhigam Youth Foundation. All rights reserved.

## 🙏 Acknowledgments

- **Font Awesome** - Icons
- **Google Fonts** - Typography
- **Unsplash** - Stock images
- **Razorpay** - Payment processing

---

**Built with ❤️ for empowering communities through education and awareness.**

For support or questions, contact: info@adhigam.org 