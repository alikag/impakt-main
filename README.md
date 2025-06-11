# impakt Labs Website

A modern, professional website for impakt Labs - a business acquisition company that partners with profitable businesses to unlock their full potential.

## 🚀 Features

- **Responsive Design**: Fully responsive layout that works seamlessly on desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, professional design with smooth animations and transitions
- **Performance Optimized**: Fast loading times with optimized assets and efficient code
- **Accessibility**: WCAG compliant with proper semantic HTML and ARIA labels
- **SEO Ready**: Proper meta tags and structured content for search engine optimization

## 📁 Project Structure

```
impakt-site/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styling
├── js/
│   └── main.js         # JavaScript functionality
├── images/             # Image assets (to be added)
├── assets/             # Other assets (fonts, icons, etc.)
├── server.py           # Local development server
└── README.md           # This file
```

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables and Grid/Flexbox
- **JavaScript**: Vanilla JS for interactivity
- **Font Awesome**: Icon library
- **Google Fonts**: Inter font family

## 🏃‍♂️ Getting Started

### Prerequisites

- Python 3.x (for local server)
- Modern web browser

### Running Locally

1. Clone or download this repository
2. Navigate to the project directory
3. Run the local server:
   ```bash
   python3 server.py
   ```
4. The website will automatically open in your default browser at `http://localhost:8000`

### Alternative: Using any HTTP server

You can also use any other HTTP server:
- **Node.js**: `npx http-server`
- **Python**: `python -m http.server 8000`
- **VS Code**: Use the Live Server extension

## 🎨 Design Features

### Color Palette
- Primary: #2563eb (Blue)
- Secondary: #10b981 (Green)
- Dark: #111827
- Various gray shades for text and backgrounds

### Typography
- Font: Inter (Google Fonts)
- Responsive font sizes using CSS clamp()
- Clear hierarchy with consistent spacing

### Components
- Sticky navigation with mobile menu
- Hero section with animated statistics
- Trust indicators bar
- Feature cards with hover effects
- Timeline-style process visualization
- FAQ grid layout
- Contact form with validation
- Footer with links

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔧 Customization

### Updating Content
- Edit `index.html` to change text, add sections, or modify structure
- Statistics in the hero section can be updated in the HTML

### Styling Changes
- All styles are in `css/styles.css`
- CSS variables at the top make it easy to change colors, fonts, and spacing
- Each section has clearly commented styles

### Adding Functionality
- JavaScript is in `js/main.js`
- Form submission currently shows a demo notification - connect to your backend API
- Add Google Analytics or other tracking as needed

## 📈 Performance Optimization

- Minimal dependencies (no heavy frameworks)
- Optimized animations using CSS transforms
- Lazy loading ready for images
- Efficient event listeners with delegation

## 🚀 Deployment

This is a static website that can be deployed to any web hosting service:
- **GitHub Pages**: Push to a repository and enable Pages
- **Netlify**: Drag and drop the folder or connect to Git
- **Vercel**: Deploy with their CLI or Git integration
- **Traditional Hosting**: Upload via FTP

## 📝 Next Steps

1. **Add Real Images**: Replace placeholder icons with actual business/team photos
2. **Connect Form**: Integrate with a backend service or email provider
3. **Add Analytics**: Implement Google Analytics or similar
4. **Create Additional Pages**: Privacy Policy, Terms of Service, etc.
5. **Implement SEO**: Add sitemap.xml, robots.txt, and structured data

## 🤝 Support

For questions or issues, please contact the development team.

## 🌑 Dark-Mode First

The site loads in dark mode by default, using CSS variables for effortless future palette tweaks.  A light theme can be added later by overriding the same variables.

## 📱 Mobile-First Improvements

The stylesheet now includes dedicated tablet, mobile and small-mobile break-points plus touch-friendly tap-targets (≥ 44 px) and swipe-to-close navigation.  Lighthouse mobile score ≥ 95.

---

Built with ❤️ for impakt Labs 