/* ==========================================================================
   Cozy Campus Coffee - E-Commerce JavaScript
   CS 202 Web Development - Final Project
   Student Name: [Your Name Here]
   ==========================================================================
   
   OVERVIEW:
   This is the main JavaScript file for my e-commerce project.
   It handles:
   1. Product data (hardcoded array - in a real app this would come from a server)
   2. Cart functionality (add, remove, update quantities)
   3. Dark/Light mode toggle with localStorage persistence
   4. Cart sidebar open/close
   5. Toast notifications for user feedback
   
   I used React's useState and useEffect hooks here, but the logic is the same
   as vanilla JS with querySelector and addEventListener!
   ========================================================================== */

import { useState, useEffect, useCallback } from 'react';
import './style.css';

// ---------- PRODUCT DATA ----------
// In a real app, this would be fetched from a database/API
// For now, I'm hardcoding it as an array of objects
// Each product has: id, name, description, price, and an emoji (as the "image")
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  emoji: string;
}

const products: Product[] = [
  {
    id: 1,
    name: "Classic Espresso",
    description: "A bold, rich shot of pure coffee perfection. Sourced from single-origin beans roasted right here on campus. The perfect study fuel!",
    price: 3.50,
    emoji: "☕"
  },
  {
    id: 2,
    name: "Caramel Cloud Latte",
    description: "Silky steamed milk meets our signature espresso, topped with homemade caramel drizzle and a cloud of vanilla foam. Pure bliss in a cup.",
    price: 5.00,
    emoji: "🥛"
  },
  {
    id: 3,
    name: "Matcha Zen Blend",
    description: "Premium ceremonial-grade matcha whisked to perfection with your choice of milk. Earthy, smooth, and packed with natural energy.",
    price: 5.50,
    emoji: "🍵"
  },
  {
    id: 4,
    name: "Cold Brew Bundle",
    description: "Our 24-hour steeped cold brew concentrate comes with a bag of freshly baked chocolate chip cookies. Perfect for late-night coding sessions!",
    price: 12.00,
    emoji: "🧊"
  }
];

// ---------- CART ITEM TYPE ----------
interface CartItem extends Product {
  quantity: number;
}

export default function App() {
  // ---------- STATE VARIABLES ----------
  // These are like global variables that trigger re-renders when changed
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [addedProductId, setAddedProductId] = useState<number | null>(null);

  // ---------- DARK MODE LOGIC ----------
  // On page load, check localStorage for saved theme preference
  // This is the "showing off my skills" move - remembering the user's choice!
  useEffect(() => {
    const savedTheme = localStorage.getItem('cozyCampusTheme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    }
    // Also check system preference as a fallback
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  // Toggle dark/light mode function
  // This adds/removes the .dark-mode class on <body>
  // The CSS variables handle all the color changes automatically!
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('cozyCampusTheme', 'dark');
      // Save to localStorage so it persists on page reload!
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('cozyCampusTheme', 'light');
    }
  };

  // ---------- CART FUNCTIONS ----------
  
  // Add item to cart
  // If item already exists, increment quantity
  // Otherwise, add new item with quantity 1
  const addToCart = (product: Product) => {
    setCartItems(prevItems => {
      // Check if this product is already in the cart
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Item exists - just increase the quantity
        // Using map() to create a new array (immutable update pattern)
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // New item - add it with quantity of 1
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });

    // Show the "Added!" feedback on the button
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1000);

    // Show toast notification
    showToastNotification(`${product.name} added to cart!`);
  };

  // Remove item from cart entirely
  const removeFromCart = (productId: number) => {
    // filter() creates a new array without the removed item
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Update quantity (increment or decrement)
  const updateQuantity = (productId: number, change: number) => {
    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + change;
          // If quantity goes to 0 or below, remove the item
          if (newQty <= 0) return null as any; // Will be filtered out
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item !== null && item.quantity > 0);
    });
  };

  // Calculate total price
  // Using reduce() - a classic array method that accumulates a single value
  const calculateTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  // Calculate total number of items in cart (for the badge)
  const totalItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // ---------- TOAST NOTIFICATION ----------
  // Shows a little popup message at the bottom of the screen
  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    // Auto-hide after 2 seconds
    setTimeout(() => setShowToast(false), 2000);
  };

  // ---------- CHECKOUT (just for show) ----------
  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    showToastNotification('🎉 Order placed! Thanks for your purchase!');
    setCartItems([]); // Clear the cart
    setIsCartOpen(false); // Close the sidebar
  };

  // ---------- RENDER ----------
  // This is like innerHTML - it defines what the page looks like
  return (
    <>
      {/* ===== NAVBAR ===== */}
      <nav className="navbar">
        <a href="#" className="navbar-brand">
          <span>☕</span> Cozy Campus Coffee
        </a>
        <div className="navbar-actions">
          {/* Dark/Light Mode Toggle Button */}
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {/* Cart Button with Item Count Badge */}
          <button 
            className="cart-btn" 
            onClick={() => setIsCartOpen(true)}
            aria-label="Open shopping cart"
          >
            🛒
            <span className="cart-text">Cart</span>
            {totalItemCount > 0 && (
              <span className="cart-count">{totalItemCount}</span>
            )}
          </button>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        <span className="hero-emoji">☕📚</span>
        <h1>Fuel Your Brain, Ace Your Classes</h1>
        <p>Handcrafted beverages made with love by students, for students. 
           Open late during finals week because we feel your pain.</p>
      </section>

      {/* ===== PRODUCTS SECTION ===== */}
      <section className="products-section">
        <h2 className="section-title">Our Menu</h2>
        <p className="section-subtitle">Freshly brewed daily • Student discount available</p>
        
        {/* Product Grid - uses CSS Grid for responsive layout */}
        <div className="product-grid">
          {products.map(product => (
            <div className="product-card" key={product.id}>
              {/* Product "image" - using emoji for simplicity */}
              <div className="product-image">
                {product.emoji}
              </div>
              
              {/* Product info section */}
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                
                <div className="product-footer">
                  <span className="product-price">${product.price.toFixed(2)}</span>
                  <button 
                    className={`add-to-cart-btn ${addedProductId === product.id ? 'added' : ''}`}
                    onClick={() => addToCart(product)}
                  >
                    {addedProductId === product.id ? '✓ Added!' : '+ Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CART OVERLAY (dark background behind sidebar) ===== */}
      <div 
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`}
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* ===== CART SIDEBAR (slide-out panel) ===== */}
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        {/* Cart Header */}
        <div className="cart-header">
          <h2>🛒 Your Cart</h2>
          <button 
            className="cart-close-btn" 
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Cart Items List */}
        <div className="cart-items">
          {cartItems.length === 0 ? (
            // Empty cart state
            <div className="cart-empty">
              <span className="cart-empty-icon">🛒</span>
              <p>Your cart is empty!</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Add some delicious coffee to get started.
              </p>
            </div>
          ) : (
            // List of cart items
            cartItems.map(item => (
              <div className="cart-item" key={item.id}>
                <span className="cart-item-emoji">{item.emoji}</span>
                <div className="cart-item-details">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">${item.price.toFixed(2)} each</div>
                </div>
                <div className="cart-item-controls">
                  {/* Decrease quantity button */}
                  <button 
                    className="qty-btn" 
                    onClick={() => updateQuantity(item.id, -1)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="cart-item-qty">{item.quantity}</span>
                  {/* Increase quantity button */}
                  <button 
                    className="qty-btn" 
                    onClick={() => updateQuantity(item.id, 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                {/* Remove item entirely */}
                <button 
                  className="remove-item-btn" 
                  onClick={() => removeFromCart(item.id)}
                  aria-label="Remove item"
                  title="Remove from cart"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer with Total */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span className="cart-total-price">${calculateTotal().toFixed(2)}</span>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              ☕ Place Order
            </button>
          </div>
        )}
      </div>

      {/* ===== TOAST NOTIFICATION ===== */}
      <div className={`toast ${showToast ? 'show' : ''}`}>
        {toastMessage}
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="site-footer">
        <p>© 2024 Cozy Campus Coffee | Made with ❤️ and ☕ for CS 202 Web Development</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
          This is a class project. No actual coffee will be delivered. (Sorry!)
        </p>
      </footer>
    </>
  );
}
