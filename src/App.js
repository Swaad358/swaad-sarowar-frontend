import './App.css';
import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import RequireAdminAuth from './RequireAdminAuth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const sampleReviews = [
  { name: 'Rahul Kumar', rating: 5, comment: 'Amazing food! The burgers are delicious and the service is quick. Highly recommended!' },
  { name: 'Priya Sharma', rating: 5, comment: 'Best street food in the area. Love their Chinese dishes and the rooftop seating is perfect.' },
  { name: 'Amit Patel', rating: 4, comment: 'Great variety of menu items. The tandoor dishes are my favorite. Will definitely visit again!' },
  { name: 'Neha Singh', rating: 5, comment: 'Excellent quality food at reasonable prices. The staff is very friendly and helpful.' },
];

// Use only 3 images for the hero/banner slideshow
const heroGallery = [
  '/IMG_20250628_233524029.jpg',
  '/IMG_20250628_233128791.jpg',
  '/WhatsApp%20Image%202025-06-28%20at%2023.24.44_3425cdc3.jpg',
];

// Fallback image for missing dish photos
const fallbackFoodImg = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';

// Image mapping for Global Flavours (Continental) - Veg dishes
const dishImages = {
  // Global Flavours (Continental) - Veg
  "Mac aloo tikki Burger": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80",
  "Veg cheese Burger": "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=400&q=80",
  "Paneer cheese Burger": "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80",
  "Veg Sandwich cold glow": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80",
  "Veg grilled Sandwich": "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
  "Cheese grilled Sandwich": "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=400&q=80",
  "Veg club Sandwich": "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80",
  "Red sauce Pasta": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
  "White sauce Pasta": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80",
  "Margherita Pizza(M)": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=400&q=80",
  "Farm house Pizza(M)": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80",
};

function HeroCarousel({ images }) {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);
  const SLIDE_INTERVAL = 4000;

  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    timeoutRef.current = setTimeout(nextSlide, SLIDE_INTERVAL);
    return () => clearTimeout(timeoutRef.current);
  }, [current, nextSlide]);

  return (
    <div className="hero-carousel">
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`hero-slide${idx === current ? ' active' : ''}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
      <button className="hero-arrow left" onClick={prevSlide} aria-label="Previous slide">&#8592;</button>
      <button className="hero-arrow right" onClick={nextSlide} aria-label="Next slide">&#8594;</button>
      <div className="hero-indicators">
        {images.map((_, idx) => (
          <span
            key={idx}
            className={`hero-indicator${idx === current ? ' active' : ''}`}
            onClick={() => setCurrent(idx)}
          />
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  const [menuItems, setMenuItems] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const navigate = useNavigate();
  const [userReviews, setUserReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: '', comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetch(`${API_URL}/api/menu`)
      .then(res => res.json())
      .then(data => { setMenuItems(data); })
      .catch(() => setMenuItems([]));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/reviews`)
      .then(res => res.json())
      .then(data => setUserReviews(data))
      .catch(() => setUserReviews([]));
  }, []);

  // Fetch gallery images from backend
  useEffect(() => {
    fetch(`${API_URL}/api/gallery`)
      .then(res => res.json())
      .then(data => {
        console.log('Fetched gallery images:', data);
        setGalleryImages(data);
        setGalleryLoading(false);
      })
      .catch(err => {
        console.error('Gallery fetch error:', err);
        setGalleryImages([]);
        setGalleryLoading(false);
      });
  }, []);

  useEffect(() => {
    if (location.state?.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  // Show a preview of 6 menu items
  const menuPreview = menuItems.slice(0, 6);

  const openLightbox = idx => {
    setLightboxIdx(idx);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const prevImg = e => {
    e.stopPropagation();
    setLightboxIdx((lightboxIdx - 1 + galleryImages.length) % galleryImages.length);
  };
  const nextImg = e => {
    e.stopPropagation();
    setLightboxIdx((lightboxIdx + 1) % galleryImages.length);
  };

  const handleReviewChange = e => {
    setReviewForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleReviewSubmit = async e => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      setReviewError('Name and comment are required.');
      return;
    }
    const res = await fetch(`${API_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewForm)
    });
    if (res.ok) {
      const newReview = await res.json();
      setUserReviews(r => [newReview, ...r]);
      setReviewForm({ name: '', comment: '' });
      setReviewSuccess('Thank you for your review!');
      setTimeout(() => setReviewSuccess(''), 2000);
    } else {
      setReviewError('Failed to submit review.');
    }
  };

  return (
    <>
      {/* Gold Shiny Bar above Hero Banner */}
      <div className="gold-shiny-bar"></div>
      {/* Hero Section Title Above Banner */}
      <div className="hero-title-above">
        <h1>SWAAD SAROWAR</h1>
      </div>
      {/* Hero Section as Carousel */}
      <section className="hero-section" id="home">
        <div className="hero-glitter" />
        <HeroCarousel images={heroGallery} />
      </section>

      {/* Hero Subtitle Section */}
      <section className="hero-subtitle-section">
        <div className="container">
          <h2 className="hero-subtitle-main">A Fusion of Tradition and Culture</h2>
          <p className="hero-subtitle-desc">Delicious Street Food & Continental Cuisine</p>
        </div>
      </section>

      {/* Menu Preview Section */}
      <section className="menu-preview-section" id="menu">
        <div className="section-glitter" />
        <div className="container">
          <h2>Popular Dishes</h2>
          <div className="menu-preview-grid">
            {menuPreview.slice(0, 5).map(item => (
              <div key={item._id || item.name} className="menu-preview-card">
                <img
                  src={item.imageUrl || fallbackFoodImg}
                  alt={item.name}
                  className="menu-preview-photo"
                  onError={e => { e.target.onerror = null; e.target.src = fallbackFoodImg; }}
                  title={item.name}
                />
                <div className="menu-preview-info">
                  <span className="menu-preview-name">{item.name}</span>
                  <span className="menu-preview-price">{item.price} ₹</span>
                </div>
              </div>
            ))}
          </div>
          <div className="menu-preview-cta">
            <button className="see-more-btn" onClick={() => navigate('/menu')}>View Full Menu</button>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section" id="gallery">
        <div className="section-glitter" />
        <div className="container">
          <h2>Our Food Cart & Ambience</h2>
          {galleryLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading gallery images...</p>
            </div>
          ) : galleryImages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No gallery images available yet.</p>
            </div>
          ) : (
            <div className="gallery-grid">
              {galleryImages.map((img, idx) => (
                <img
                  key={img._id || idx}
                  src={img.imageUrl.startsWith('http') ? img.imageUrl : API_URL + img.imageUrl}
                  alt={`Cart view ${idx + 1}`}
                  className="gallery-photo"
                  onClick={() => openLightbox(idx)}
                  style={{ cursor: 'pointer' }}
                  onError={(e) => {
                    console.error('Failed to load image:', img.imageUrl);
                    e.target.style.display = 'none';
                  }}
                />
              ))}
            </div>
          )}
          {lightboxOpen && galleryImages.length > 0 && (
            <div className="lightbox-overlay" onClick={closeLightbox}>
              <button className="lightbox-close" onClick={closeLightbox}>&times;</button>
              <button className="lightbox-prev" onClick={prevImg}>&#8592;</button>
              <img 
                src={galleryImages[lightboxIdx]?.imageUrl.startsWith('http') ? galleryImages[lightboxIdx].imageUrl : API_URL + galleryImages[lightboxIdx].imageUrl} 
                alt="Large view" 
                className="lightbox-img" 
              />
              <button className="lightbox-next" onClick={nextImg}>&#8594;</button>
            </div>
          )}
        </div>
      </section>

      {/* Location Section */}
      <section className="location-section" id="location">
        <div className="section-glitter" />
        <div className="container">
          <h2>Find Us</h2>
          <div className="location-content">
            <div className="location-info">
              <h3>📍 Our Location</h3>
              <p><strong>Address:</strong> Near by alakhnanda, Golf city ghuswal kalan Lucknow Uttar Pradesh 226002</p>
              <button className="directions-btn" onClick={() => window.open('https://www.google.com/maps?q=26.770778,80.989194', '_blank')}>Get Directions</button>
            </div>
            <div className="map-container">
              <iframe
                title="Swaad Sarowar Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.8147830657387!2d80.98919399999999!3d26.770778!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDQ2JzE0LjgiTiA4MMKwNTknMjEuMSJF!5e0!3m2!1sen!2sin!4v1643000000000!5m2!1sen!2sin"
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section shimmer-blue" id="about">
        <div className="section-glitter" />
        <div className="container">
          <h2>About Swaad Sarowar</h2>
          <div className="about-content">
            <div className="about-text">
              <p>Welcome to <strong>Swaad Sarowar</strong> – your ultimate destination for delicious fusion food on wheels! We bring you the perfect blend of traditional Indian flavors and modern continental cuisine.</p>
              <p>Our unique rooftop seating offers a perfect dining experience with a vibrant ambience. Located in the heart of Ghuswal Kalan, Uttar Pradesh, we serve fresh, hot, and delicious food made with love and the finest ingredients.</p>
              <div className="features">
                <div className="feature">
                  <span className="feature-icon">🍔</span>
                  <h4>Fresh Ingredients</h4>
                  <p>We use only the freshest ingredients for all our dishes</p>
                </div>
                <div className="feature">
                  <span className="feature-icon">⚡</span>
                  <h4>Quick Service</h4>
                  <p>Fast and efficient service to satisfy your hunger quickly</p>
                </div>
                <div className="feature">
                  <span className="feature-icon">🌟</span>
                  <h4>Best Quality</h4>
                  <p>Maintaining the highest quality standards in every dish</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="reviews-section">
        <div className="section-glitter" />
        <div className="container">
          <h2>What Our Customers Say</h2>
          <div className="reviews-grid">
            {[...sampleReviews, ...userReviews].map((review, idx) => (
              <div key={idx} className="review-card">
                <div className="review-stars">
                  {[...Array(review.rating || 5)].map((_, i) => (
                    <span key={i} className="star">⭐</span>
                  ))}
                </div>
                <p className="review-comment">"{review.comment}"</p>
                <h4 className="review-author">- {review.name}</h4>
              </div>
            ))}
          </div>
          <form className="review-form" onSubmit={handleReviewSubmit} style={{ marginTop: 32, maxWidth: 400 }}>
            <h3>Leave a Review</h3>
            <input
              name="name"
              placeholder="Your Name"
              value={reviewForm.name}
              onChange={handleReviewChange}
              required
              style={{ marginBottom: 8, width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }}
            />
            <textarea
              name="comment"
              placeholder="Your Review"
              value={reviewForm.comment}
              onChange={handleReviewChange}
              required
              rows={3}
              style={{ marginBottom: 8, width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }}
            />
            <button type="submit" style={{ background: '#3182ce', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Submit Review</button>
            {reviewError && <div style={{ color: '#e53e3e', marginTop: 8 }}>{reviewError}</div>}
            {reviewSuccess && <div style={{ color: '#38a169', marginTop: 8 }}>{reviewSuccess}</div>}
          </form>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section" id="contact">
        <div className="section-glitter" />
        <div className="container">
          <h2>Timing & Pay Methods</h2>
          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">🕒</span>
                <div>
                  <h4>Opening Hours</h4>
                  <p>Monday - Sunday: 4:00 PM – 12:00 AM</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">💳</span>
                <div>
                  <h4>Payment Methods</h4>
                  <p>Cash, UPI, Card Payments Accepted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="section-glitter" />
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item shimmer-blue">
              <h4>What are your peak hours?</h4>
              <p>Our busiest hours are 7:00 PM - 9:00 PM. We recommend ordering early for faster service.</p>
            </div>
            <div className="faq-item shimmer-blue">
              <h4>Do you have vegetarian options?</h4>
              <p>Yes, we have a wide variety of vegetarian dishes including burgers, sandwiches, Chinese, and more.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="section-glitter" />
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>SWAAD SAROWAR</h3>
              <p>A fusion of tradition and culture, serving delicious street food and continental cuisine in Ghuswal Kalan.</p>
              <div className="social-links">
                <a href="https://www.instagram.com/swaad.sarowar?igsh=bTY0OGpnamk2NXVv" className="social-link" target="_blank" rel="noopener noreferrer">
                  <span role="img" aria-label="Instagram">📷</span> Instagram
                </a>
              </div>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <Link to="/">Home</Link>
              <Link to="/menu">Menu</Link>
              <a href="#gallery">Gallery</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="footer-section">
              <h4>Contact Info</h4>
              <p>📍 Near by alakhnanda, Golf city ghuswal kalan Lucknow Uttar Pradesh 226002</p>
              <p>🕒 4:00 PM - 12:00 AM</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Swaad Sarowar. All rights reserved. | Made with ❤️ for food lovers</p>
          </div>
        </div>
      </footer>
    </>
  );
}

function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [menuTab, setMenuTab] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/menu`)
      .then(res => res.json())
      .then(data => {
        setMenuItems(data);
        // Set default tab to first category
        if (data.length > 0) setMenuTab(data[0].category);
      })
      .catch(() => setMenuItems([]));
  }, []);

  // Group items by category
  const categories = Array.from(new Set(menuItems.map(item => item.category)));
  const itemsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = menuItems.filter(item => item.category === cat);
    return acc;
  }, {});

  const filteredItems = (itemsByCategory[menuTab] || []).filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="menu-page-section">
      <div className="container">
        <h2>Our Complete Menu</h2>
        <div className="menu-tabs">
          {categories.map(cat => (
            <button
              key={cat}
              className={menuTab === cat ? 'active' : ''}
              onClick={() => setMenuTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <input
          className="menu-search"
          type="text"
          placeholder="Search for your favorite dishes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="menu-grid">
          {filteredItems.map(item => (
            <div key={item._id || item.name} className="menu-card">
              <img
                src={item.imageUrl || fallbackFoodImg}
                alt={item.name}
                className="menu-photo"
                onError={e => { e.target.onerror = null; e.target.src = fallbackFoodImg; }}
                title={item.name}
              />
              <div className="menu-info">
                <span className="menu-name">{item.name}</span>
                <span className="menu-price">{item.price} ₹</span>
                {/* Add veg/non-veg dot if you want, or skip if not in DB */}
              </div>
            </div>
          ))}
        </div>
        {filteredItems.length === 0 && (
          <div className="menu-empty-state">
            No dishes found matching "{search}". Try a different search term.
          </div>
        )}
      </div>
    </section>
  );
}

function App() {
  const navigate = useNavigate();
  // Helper for section navigation
  const handleSectionNav = (e, section) => {
    e.preventDefault();
    if (window.location.pathname !== "/") {
      navigate("/", { state: { scrollTo: section } });
    } else {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">SWAAD SAROWAR</div>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/menu">Menu</Link>
            <a href="#gallery" onClick={e => handleSectionNav(e, 'gallery')}>Gallery</a>
            <a href="#location" onClick={e => handleSectionNav(e, 'location')}>Location</a>
            <a href="#contact" onClick={e => handleSectionNav(e, 'contact')}>Timing</a>
          </div>
        </div>
      </nav>

      {/* Gold Shiny Bar */}
      <div className="gold-shiny-bar"></div>

      {/* Floating Instagram Button */}
      <a
        href="https://www.instagram.com/swaad.sarowar?igsh=bTY0OGpnamk2NXVv"
        className="floating-instagram"
        target="_blank"
        rel="noopener noreferrer"
        title="Follow us on Instagram"
        style={{
          position: 'fixed',
          top: '84px',
          right: '2rem',
          zIndex: 1200,
          background: 'linear-gradient(135deg, #fd5949 0%, #d6249f 50%, #285AEB 100%)',
          color: '#fff',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          boxShadow: '0 4px 16px #d6249f44',
          transition: 'transform 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width="28" height="28" viewBox="0 0 448 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <radialGradient id="insta-gradient" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stop-color="#fd5949"/>
            <stop offset="50%" stop-color="#d6249f"/>
            <stop offset="100%" stop-color="#285AEB"/>
          </radialGradient>
          <rect width="448" height="512" rx="90" fill="url(#insta-gradient)"/>
          <path d="M224 144c-44.2 0-80 35.8-80 80s35.8 80 80 80 80-35.8 80-80-35.8-80-80-80zm0 132c-28.7 0-52-23.3-52-52s23.3-52 52-52 52 23.3 52 52-23.3 52-52 52zm85-136c0 10.5-8.5 19-19 19s-19-8.5-19-19 8.5-19 19-19 19 8.5 19 19zm76 19.2c-1.7-35.3-9.9-66.7-36.2-92.9S371.3 9.7 336 8c-35.3-1.7-141.3-1.7-176.6 0C124.1 9.7 92.7 17.9 66.5 44.1S9.7 124.1 8 159.4c-1.7 35.3-1.7 141.3 0 176.6 1.7 35.3 9.9 66.7 36.2 92.9s57.6 34.5 92.9 36.2c35.3 1.7 141.3 1.7 176.6 0 35.3-1.7 66.7-9.9 92.9-36.2s34.5-57.6 36.2-92.9c1.7-35.3 1.7-141.3 0-176.6zM398.8 388c-7.8 19.6-22.9 34.7-42.5 42.5-29.4 11.7-99.2 9-132.3 9s-102.9 2.6-132.3-9c-19.6-7.8-34.7-22.9-42.5-42.5-11.7-29.4-9-99.2-9-132.3s-2.6-102.9 9-132.3c7.8-19.6 22.9-34.7 42.5-42.5C99.1 25.8 168.9 28.4 202 28.4s102.9-2.6 132.3 9c19.6 7.8 34.7 22.9 42.5 42.5 11.7 29.4 9 99.2 9 132.3s2.6 102.9-9 132.3z" fill="#fff"/>
        </svg>
      </a>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <RequireAdminAuth>
            <AdminDashboard />
          </RequireAdminAuth>
        } />
      </Routes>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/919999999999?text=Hi! I'd like to order from Swaad Sarowar. Can you help me with the menu?"
        className="floating-whatsapp"
        target="_blank"
        rel="noopener noreferrer"
        title="Order on WhatsApp"
      >
        <span role="img" aria-label="WhatsApp">💬</span>
      </a>
    </>
  );
}

export default App;
